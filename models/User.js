const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    first_name: {
        type:String,
        required:true,
    },
    surname: {
        type:String,
        required:true,
    },
    email: {
        type:String,
        required:true,
    },
    password: {
        type:String,
        required:true
    },
    friends: [String]
})

module.exports = mongoose.model('User', userSchema)