
const express = require('express')
const router = express.Router()
const verifyWebToken = require('../../verifyToken')
const WallPost = require('../../models/WallPost')


const commentRouter = require('./post_routes/comment')
const likeRouter = require('./post_routes/like')
const { post } = require('./post_routes/comment')

router.use('/comment', commentRouter)
router.use('/like', likeRouter)



router.post('/',verifyWebToken, async(req, res) => {
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
    try{
        const wallPost = await WallPost.findById(req.params.postId)
        res.send(wallPost)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
})


async function postBelongsToUser(postId, user_id){

    const post = await WallPost.findById(postId)
    if (post.owner != user_id ) {return false}
    return true
    
}

router.patch('/:postId', verifyWebToken, async(req, res) => {
    try{
        if (!(await postBelongsToUser(req.params.postId, req.user._id))){
            console.log('Accessed denied on patch request.')
            res.status(401).send('Access denied')
        }else{
        const updatePostbyID = await WallPost.updateOne(
            {_id:req.params.postId},
            {$set:{
                text:req.body.text,
                title:req.body.title
            }} 
        )
        res.send(updatePostbyID)
        }
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
})


router.delete('/:postId', verifyWebToken, async(req, res) => {
    try{
        if (!(await postBelongsToUser(req.params.postId, req.user._id))){
            res.status(401).send('Access denied')
        }else{
        const deletePostbyID = await WallPost.deleteOne({_id:req.params.postId})
        res.send(deletePostbyID)
        }
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
})





module.exports = router