const express = require('express')
const router = express.Router()
const verifyWebToken = require('../../../verifyToken')
const WallPost = require('../../../models/WallPost')


router.post('/', verifyWebToken, async(req, res) => {
    /*** Add comment to post ***/ 
    /* Find relevant post: */
    try{
        postToUpdate = await WallPost.findById(req.body.postId)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
    /* Don't allow users to comment on own posts: */
    if (postToUpdate.owner == req.user._id){
        res.status(401).send('Users cannot comment on their own posts.')
    }
    else{   
        try{
            /* Push new comment to post comments list and save post: */
            postToUpdate.comments.push({owner_id: req.user, timestamp: Date.now(), comment: req.body.comment})
            const updatedPost = await postToUpdate.save()
            res.send(updatedPost)
        }catch(err){
            console.log(err)
            res.status(400).send({message:err})
        }
    }
})

module.exports = router