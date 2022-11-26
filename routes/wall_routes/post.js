
const express = require('express')
const router = express.Router()
const verifyWebToken = require('../../verifyToken')
const WallPost = require('../../models/WallPost')


const commentRouter = require('./post_routes/comment')
const likeRouter = require('./post_routes/like')

router.use('/comment', commentRouter)
router.use('/like', likeRouter)



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


router.get('/:postId',verifyWebToken, async(req, res) => {
    console.log(`Received get request for wall post with id: ${req.params.postId}`)
    try{
        const wallPost = await WallPost.findById(req.params.postId)
        res.send(wallPost)
    }catch(err){
        res.status(400).send({message:err})
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