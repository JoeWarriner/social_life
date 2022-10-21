const express = require('express')
const router = express.Router()

const WallPost = require('../models/WallPost')

router.get('/', (req, res) => {
    res.send('You have made it to the wall_post page')
    console.log('A user has accessed the wall post page.')
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

module.exports = router