const express = require('express')
const router = express.Router()

const verifyWebToken = require('../verifyToken')
const WallPost = require('../models/WallPost')


router.get('/', verifyWebToken, async(req, res) => {
    console.log('Received get request for wall post list.')
    try{
        const wallPostList = await WallPost.find({}, null, {sort: {likes: -1}})
        console.log(wallPostList)
        res.send(wallPostList)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
})


router.get('/comment_like_summary', verifyWebToken, async(req, res) => {
    console.log('Received get request for user comments')
    try{
        let comments_list = []
        let likes = 0
        const wallPostList = await WallPost.find({owner: req.user._id})
        for (const post of wallPostList){
            comments_list = comments_list.concat(post.comments)
            likes = likes + post.likes
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
    try {
        const wallPostData = new WallPost({
            owner:req.user,
            text:req.body.text,
            title:req.body.title
        })
        const newPost = await wallPostData.save()
        res.send(newPost)
    }catch(err){
        res.status(400).send({message:err})
    }
}) 


router.post('/comment', verifyWebToken, async(req, res) => {
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


router.post('/like', verifyWebToken, async(req, res) => {
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
            postToUpdate.likes = postToUpdate.likes + 1
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