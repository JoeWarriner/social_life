
const express = require('express')
const router = express.Router()
const verifyWebToken = require('../../../verifyToken')
const WallPost = require('../../../models/WallPost')



router.post('/:postId', verifyWebToken, async(req, res) => {
    /* Add a like to a post */
    /* Find the specified post: */
    try{
        postToUpdate = await WallPost.findById(req.params.postId)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
    /* Check if it is user's own post: */
    if (postToUpdate.owner == req.user._id){
        res.status(401).send('Users cannot comment on their own posts.')
    /* Check if user has already liked this post: */
    }else if (req.user._id in postToUpdate.likes){
        res.status(400).send('User has already liked this post.')
    }else{
        try{
            /* Push additional like to post and save */
            postToUpdate.likes.push({owner_id: req.user})
            const updatedPost = await postToUpdate.save()
            res.send(updatedPost)
        }catch(err){
            console.log(err)
            res.status(400).send({message:err})
        }
    }
})

module.exports = router