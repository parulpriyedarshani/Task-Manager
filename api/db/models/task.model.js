const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    _listId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    completed: {    //for setting the tasks to completed.
        type: Boolean,
        default: false
    }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = { Task }
 //name of my model is exported.