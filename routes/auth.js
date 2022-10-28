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


router.post('/login', async(req,res) => {

    const user = await User.findOne({email:req.body.email})

    if (!user) {
        return res.status(400).send({'message': 'user does not exist'})
    }

    if (user.password == req.body.password){
        return res.send('ACCEPTED')
    } else {
        return res.send('DENIED')
    }
    
})

module.exports = router


