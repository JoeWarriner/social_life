const express = require('express')
const router = express.Router()

const verifyWebToken = require('../verifyToken')
const WallPost = require('../models/WallPost')


router.get('/', verifyWebToken, async(req, res) => {
    console.log('Received get request for wall post list.')
    try{
        const wallPostList = await WallPost.find()
        res.send(wallPostList)
    }catch(err){
        res.status(400).send({message:err})
    }
})


router.get('/:postId',verifyWebToken, async(req, res) => {
    console.log(`Received get request for wall post with id: ${req.params.postId}`)
    try{
        const wallPost = await WallPost.findById(req.params.postId)
        res.send(wallPost)
    }catch(err){
        res.status(400).send({message:err})
    }
})


router.post('/',verifyWebToken, async(req, res) => {
    console.log('New wall post received.')
    console.log(req.body)
    const wallPostData = new WallPost({
        owner:req.user,
        text:req.body.text,
        title:req.body.title
    })
    try{
        const newPost = await wallPostData.save()
        res.send(newPost)
    }catch(err){
        res.status(400).send({message:err})
    }
})


router.patch('/add_comment', verifyWebToken, async(req, res) => {
    console.log(req.body)
    try{
        postToUpdate = await WallPost.findById(req.body.postId)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
    console.log(postToUpdate.owner)
    console.log(req.user)
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

router.patch('/:postId',verifyWebToken, async(req, res) => {
    console.log(req.body)
    try{
        const updatePostbyID = await WallPost.updateOne(
            {_id:req.params.postId},
            {$set:{
                user:req.body.user,
                post_text:req.body.post_text
            }} 
        )
        res.send(updatePostbyID)
    }catch(err){
        res.status(400).send({message:err})
    }
})

router.delete('/:postId',verifyWebToken, async(req, res) => {
    console.log(`Received delete request for wall post with id: ${req.params.postId}`)
    try{
        const deletePostbyID = await WallPost.deleteOne({_id:req.params.postId})
        res.send(deletePostbyID)
    }catch(err){
        res.status(400).send({message:err})
    }
})

module.exports = router