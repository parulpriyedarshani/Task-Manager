// This file will handle connection logic to the MongoDB database 

const mongoose = require('mongoose');

mongoose.Promise = global.Promise; //So that mongoose uses the JS promises

mongoose.connect('mongodb://localhost:27017/TaskManager', { useNewUrlParser: true}).then(() => {
    console.log("Successfully connected to mongoDB database :)");
}).catch((e) => {
    console.log("Error while connecting with the database :(");
    console.log(e);
});

// to prevent some depreciation warnings(from MongoDB native driver)
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose  //object here
};
