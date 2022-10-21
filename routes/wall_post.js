const express = require('express')
const router = express.Router()

const WallPost = require('../models/WallPost')

router.get('/', async(req, res) => {
    console.log('Received get request for wall post list.')
    try{
        const wallPostList = await WallPost.find()
        res.send(wallPostList)
    }catch(err){
        res.send({message:err})
    }
})

router.get('/:postId', async(req, res) => {
    console.log(`Received get request for wall post with id: ${req.params.postId}`)
    try{
        const wallPost = await WallPost.findById(req.params.postId)
        res.send(wallPost)
    }catch(err){
        res.send({message:err})
    }
})


router.post('/', async(req, res) => {
    console.log(req.body)
    const wallPostData = new WallPost({
        user:req.body.user,
        post_text: req.body.post_text
    })
    try{
        const newPost = await wallPostData.save()
        res.send(newPost)
    }catch(err){
        res.send({message:err})
    }
}
)


router.patch('/:postId', async(req, res) => {
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
        res.send({message:err})
    }
})


router.delete('/:postId', async(req, res) => {
    console.log(`Received delete request for wall post with id: ${req.params.postId}`)
    try{
        const deletePostbyID = await WallPost.deleteOne({_id:req.params.postId})
        res.send(deletePostbyID)
    }catch(err){
        res.send({message:err})
    }
})


module.exports = router