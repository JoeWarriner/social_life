const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('You have made it to the wall_post page')
    console.log('A user has accessed the wall post page.')
})

module.exports = router