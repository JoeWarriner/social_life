const express = require('express')
const router = express.Router()
const verifyWebToken = require('../../../verifyToken')
const WallPost = require('../../../models/WallPost')


router.post('/', verifyWebToken, async(req, res) => {
    console.log(req.body)
    try{
        postToUpdate = await WallPost.findById(req.body.postId)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
    if (postToUpdate.owner == req.user._id){
        res.status(401).send('Users cannot comment on their own posts.')
    }
    else{
        try{
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