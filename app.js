const express = require('express')
const app = express()

const mongoose = require('mongoose')
require('dotenv/config')

const bodyParser = require('body-parser')
const wallRouter = require('./routes/wall_post')

app.use(bodyParser.json())
app.use('/wall_post', wallRouter)

app.get('/', (req, res) => {
    res.send('Hi there welcome to my app')
    console.log('Someone accessed the app')
})

mongoose.connect(process.env.MONGO_DB_URL, () =>
    console.log('Database connected successfully.'))

app.listen(3000, () => {
    console.log('App is running')
})

