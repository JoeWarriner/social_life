const express = require('express')
const router = express.Router()

const User = require('../models/User')

router.post('/register', async(req,res) => {
    
    // Validation stuff

    const user = new User({
        first_name : req.body.first_name,
        surname : req.body.surname,
        email : req.body.email,
        password : req.body.password
    })
    try {
        const newUser = await user.save()
        res.send(newUser)
    }catch(err){
        res.send({message:err})
    }

})

module.exports = router


