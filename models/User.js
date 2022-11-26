const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    username: {
        type:String,
        required:true,
        maxLength: 100,
        validate: {
            validator: (v) => !(v.includes(' '))
        }
    },
    password: {
        type:String,
        required:true,
    }
})

module.exports = mongoose.model('User', userSchema)