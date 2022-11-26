const mongoose = require('mongoose')

const wallPostSchema = mongoose.Schema({
    owner: {
        type:String,
        required:true
    },
    title: {
        type:String,
        required:true,
        minLength: 1,
        maxLength: 128
    },
    text: {
        type:String,
        required: true,
        minLength: 1,
        maxLength: 256,
    },
    timestamp: {
        type:Date,
        default:Date.now
    },
    comments: [{
        owner_id: String,
        timestamp: Date,
        comment: {
            type: String,
            minLength: 1,
            maxLength: 256,
        }
    }],
    likes: [{
        owner_id: String
    }]
})

module.exports = mongoose.model('wall_posts', wallPostSchema)
