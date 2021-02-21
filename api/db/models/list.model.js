const mongoose = require('mongoose');

//create schema
const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    }
})

//create model
 const List = mongoose.model('List', ListSchema);

 module.exports = { List }

