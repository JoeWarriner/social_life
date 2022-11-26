const express = require('express')
const router = express.Router()

const verifyWebToken = require('../../verifyToken')
const WallPost = require('../../models/WallPost')


router.get('/engagement_summary', verifyWebToken, async(req, res) => {
    try{
        let comments_list = []
        let likes = 0
        const wallPostList = await WallPost.find({owner: req.user._id})
        for (const post of wallPostList){
            comments_list = comments_list.concat(post.comments)
            likes = likes + post.likes.length
        }

        const engagementSummary = {
            'comments': comments_list,
            'likes': likes
        }
        res.send(engagementSummary)
    }catch(err){
        res.status(400).send({message:err})
    }
})



module.exports = router