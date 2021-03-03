const mongoose = require('mongoose');

//create schema
const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    // with auth
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

//create model
 const List = mongoose.model('List', ListSchema);

 module.exports = { List }

