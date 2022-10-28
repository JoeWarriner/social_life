const { Router } = require('express')
const express = require('express')

const verifyWebToken = require('../verifyToken')
const router = express.Router()

const User = require('../models/User')

router.patch('/add/:userId', verifyWebToken, async(req,res) => {

    const user = await User.findById(req.user)
    try{
        const newFriend = await User.findById(req.params.userId)
    }catch{
        res.send({message:err})
    }
    let newFriendsList = user.friends
    newFriendsList.push(req.params.userId)
    user.update({$set:
        {friends:newFriendsList}
    })
    res.send(user)
})


module.exports = router