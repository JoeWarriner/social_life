const express = require('express')
const router = express.Router()

const User = require('../models/User')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

function validate_password(password) {
    if (password.length < 8){
        return false
    }
    return true
}

async function create_user(username, password){
    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(password, salt)
    const user = new User({
        username : username,
        password : hashedPassword
    })
    return user
}

router.post('/register', async(req,res) => {
    
    console.log(req.body)
    if ((validate_password(req.body.password))){
        const user = await create_user(req.body.username, req.body.password)
        try {
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

    const user = await User.findOne({username:req.body.username})

    if (!user) {
        return res.status(400).send({'message': 'user does not exist'})
    }

    const passwordValid = await bcryptjs.compare(req.body.password, user.password)

    if (!passwordValid) {
        return res.status(400).send({'message': 'Incorrect password'})
    }

    const webToken = jsonwebtoken.sign({_id:user._id}, process.env.WEBTOKEN_SECRET)
    return res.header('auth_token',webToken).send({'auth_token':webToken})
})

module.exports = router


