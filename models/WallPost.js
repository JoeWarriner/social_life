const mongoose = require('mongoose')

const wallPostSchema = mongoose.Schema({
    owner: {
        type:String,
        required:true
    },
    title: {
        type:String,
        required:true
    },
    text: {
        type:String,
        required: true
    },
    timestamp: {
        type:Date,
        default:Date.now
    },
    comments: [{
        owner_id: String,
        timestamp: Date,
        comment: String
        }
    ],
    likes: {
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('wall_posts', wallPostSchema)
