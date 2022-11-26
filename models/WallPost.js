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
    likes: {
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('wall_posts', wallPostSchema)
