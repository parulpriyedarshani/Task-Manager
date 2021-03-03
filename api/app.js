const express = require('express');
const app = express();

const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

/* Load the models here */
const { List, Task, User } = require('./db/models');

const jwt = require('jsonwebtoken');


/*  MIDDLWARE  */

//Load middleware
// This will parse the request body of the http requests
app.use(bodyParser.json()); 

// CORS HEADERS MIDDLWARE
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header('Access-Control-Expose-Headers',
                'x-access-token, x-refresh-token'
    );

    next();
});

//check whether the request has a valid JWT token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    //verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid so - donot authenticate
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }

    });
}

// Verify refresh token middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refesh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }

        //if the code reaches here - the user was found
        // therefore the refresh token exists in the database but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if(session.token === refreshToken) {
                // check if the session has expired
                if(User.hasRefreshedTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if(isSessionValid) {
            // the session is VALID - call next() to continue with procesing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })

        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

/** END MIDDLWARES */





/* ROUTE HANDLERS */

/* LIST ROUTES */


/**
 * LISTS ROUTES
 * GET /lists
 * purpose: get all the lists
 */
app.get('/lists', authenticate, (req, res) => {
    // return an array of all the lists in the database that belong to the authenticated user
    List.find({
       _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((e) => {
        res.send(e);
    });
})

/**
 * POST /lists
 * purpose: Create a list
 */
app.post('/lists', authenticate, (req, res) => {
    //create a new list document and return it back to the user
    //with id where the list info(fields) will be passed in via the JSON request body.
    let title = req.body.title; 

    let newList = new List({
        title,
        _userId: req.user_id
    });

    newList.save().then((listDoc) => {
        // the full list document with id will be returned
        res.send(listDoc);
    });

});

/**
 * PATCH /lists/:id
 * Purpose: Update a specified list
 */
app.patch('/lists/:id', authenticate, (req, res) => {
    // We want to update the specified list (list document with id in the URL) with the new values specified in the JSON body of the request
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete a list
 */
app.delete('/lists/:id', authenticate, (req, res) => {
    // We want to delete the specified list (document with id in the URL)
    List.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);

        // delete all the tasks that are in the deleted list
        deleteTasksFromList(removedListDoc._id);
    })
});

/* TASKS ROUTES */

/**
 * GET /lists/:listId/tasks
 * purpose: get an array of all the task specified in the listID of the list
 */
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    //find is used to geta all the tasks in the db from a particular list
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    })
});

app.get('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    //findOne is used to get any one specific task with a taskId in a specific list.
    Task.findOne({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((task) => {
        res.send(task);
    });
});

/**
 * POST /lists/:listId/tasks
 * purpose: to create and save a new task in a specific list with listId.
 */
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    // we want to create a new task in the list specified by the listId

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can create new tasks
            return true;
        }
        // else the user object is undefined
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _listId: req.params.listId
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            });

        } else {
            res.sendStatus(404);
        }

    })

});

/**
 * PATCH /lists/:listId/tasks/:taskId
 * purpose: to update an existing task with a taskID in a particular list with a listId
 */
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    // we want to update an existing task (specified by taskId)

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can create new tasks
            return true;
        }
        // else the user object is undefined
        return false;
    }).then((canUpdateTasks) => {
        if(canUpdateTasks) {
            // the currently authenticated user can update tasks
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {

                $set: req.body
            }
        ).then(() => {
            res.send({ message: 'Updated successfully! '})
        })
        } else {
        res.sendStatus(404);
        }
    })
});

/**
 * DELETE /lists/listId/tasks/taskId
 * purpose: to delete the task with a taskId in a specific list with a listId
 */
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {

    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list) => {
        if (list) {
            // list object with the specified conditions was found
            // therefore the currently authenticated user can create new tasks
            return true;
        }

        // else the user object is undefined
        return false;
    }).then((canDeleteTasks) => {

        if (canDeleteTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _listId: req.params.listId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });
});

/* USER ROUTES */

/**
 * POST /users
 * Purpose: sign up
 */
app.post('/users', (req, res) => {
    //user sign up

    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
    // session created successfully - refreshToken returned.
    // now we generate an access auth token for the user

    return newUser.generateAccessAuthToken().then((accessToken) => {
       // access auth token generated successfully, now we return an object containing the auth tokens
       return { accessToken, refreshToken }
    });
}).then((authTokens) => {
    // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
    res
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(newUser);
}).catch((e) => {
    res.status(400).send(e);
    })
})


/**
 * POST /users/login
 * purpose: login
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we generate an access auth token for the user.

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
            res.status(400).send(e);
        });
    })


/**
 * GET /users/me/access-token
 * purpose: generates and retuns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticateda and we have the user._id and user object available to us.
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);  //setting the status and sending our error back.
    });
})

/** HELPER METHODS */

let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + " were deleted!");
    })

}

app.listen(3000, () => {
    console.log("Server is listening at port 3000.");
});