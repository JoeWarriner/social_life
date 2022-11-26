const express = require('express')
const router = express.Router()

const User = require('../models/User')
const WallPost = require('../models/WallPost')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const verifyWebToken = require('../verifyToken')


function validatePassword(password) {
    /* Validate new passowrd against requirements */ 
    if (password.length < 8){
        return false
    }
    return true
}

async function unique_username(username) {
    /* Check username is unique */
    const sameNameUsersList = await User.find({username: username})
    return  sameNameUsersList.length == 0
}

async function create_user(username, password){
    /* Create a new User object */
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(password, salt)
    const user = new User({
        username : username,
        password : hashedPassword
    })
    return user
}


router.post('/register', async(req,res) => {
    /* Registeer a new user, if details provided are valid */
    if (validatePassword(req.body.password) && (await unique_username(req.body.username))){
        try {
            const user = await create_user(req.body.username, req.body.password)
            const newUser = await user.save()
            res.send(newUser)
        }catch(err){
            res.status(400).send({message:err})
        }
    } else{
        res.status(400).send({message:'Invalid password'})
    }
})


router.post('/login', async(req,res) => {
    /* Log in user, send back json web token for access to other resources */
    
    /* Find user record */
    const user = await User.findOne({username:req.body.username})
    if (!user) {
        return res.status(400).send({'message': 'User does not exist'})
    }

    /* Validate password */
    const passwordValid = await bcryptjs.compare(req.body.password, user.password)
    if (!passwordValid) {
        return res.status(400).send({'message': 'Incorrect password'})
    }
    
    /* Return json webtoken */ 
    const webToken = jsonwebtoken.sign({_id:user._id}, process.env.WEBTOKEN_SECRET)
    return res.header('auth_token',webToken).send({'auth_token':webToken})
})



module.exports = router


