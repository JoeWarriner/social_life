const express = require('express')
const app = express()

const mongoose = require('mongoose')
require('dotenv/config')

const bodyParser = require('body-parser')
app.use(bodyParser.json())


const wallRouter = require('./routes/wall')
const accountRouter = require('./routes/account')

app.use('/wall', wallRouter)
app.use('/account', accountRouter)

app.get('/', (req, res) => {
    res.send('Hi there welcome to my app')
    console.log('Someone accessed the app')
})

mongoose.connect(process.env.MONGO_DB_URL, {dbName: 'social_life'},  () =>
    console.log('Database connected successfully.')
    )

app.listen(3000, () => {
    console.log('App is running')
})

