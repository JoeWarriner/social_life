const express = require('express')
const router = express.Router()

const User = require('../models/User')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')


router.post('/register', async(req,res) => {
    
    // Validation stuff

    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password, salt)

    const user = new User({
        first_name : req.body.first_name,
        surname : req.body.surname,
        email : req.body.email,
        password : hashedPassword
    })
    try {
        const newUser = await user.save()
        res.send(newUser)
    }catch(err){
        res.send({message:err})
    }

})


router.post('/login', async(req,res) => {

    const user = await User.findOne({email:req.body.email})

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


