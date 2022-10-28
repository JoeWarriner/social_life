const jsonwebtoken = require('jsonwebtoken')

function verifyWebToken(req, res, next){
    try {
        const verified = jsonwebtoken.verify(req.header('auth-token'), process.env.WEBTOKEN_SECRET)
        req.user = verified
        next()
    }catch(err){
        res.send('Access denied')
        console.log(err)
    }
}

module.exports = verifyWebToken