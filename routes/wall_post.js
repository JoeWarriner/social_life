const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('You have made it to the wall_post page')
    console.log('A user has accessed the wall post page.')
})

router.post('/', async(req, res) => {
    console.log(req.body)
    res.send('It arrived!')
}
)

module.exports = router