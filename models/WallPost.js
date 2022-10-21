const mongoose = require('mongoose')

const wallPostSchema = mongoose.Schema({
    user: {
        type:String,
        required:true
    },
    post_text: {
        type:String,
        required: true
    },
    date: {
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('wall_posts', wallPostSchema)
