const express = require('express')
const app = express()

const mongoose = require('mongoose')

const wallRouter = require('./routes/wall_post')

app.use('/wall_post', wallRouter)

app.get('/', (req, res) => {
    res.send('Hi there welcome to my app')
    console.log('Someone accessed the app')
})

app.listen(3000, () => {
    console.log('App is running')
})


