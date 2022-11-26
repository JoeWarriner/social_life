
const express = require('express')
const router = express.Router()
const verifyWebToken = require('../verifyToken')
const WallPost = require('../models/WallPost')

const postRouter = require('./wall_routes/post')
const summaryRouter = require('./wall_routes/summary')

router.use('/post', postRouter)
router.use('/summary', summaryRouter)

router.get('/', verifyWebToken, async(req, res) => {
    /* Get all wall posts */
    try{
        const wallPostList = await WallPost.find({}, null, {sort: {likes: -1}})
        res.send(wallPostList)
    }catch(err){
        console.log(err)
        res.status(400).send({message:err})
    }
})

module.exports = router