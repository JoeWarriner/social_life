const jsonwebtoken = require('jsonwebtoken')

function verifyWebToken(req, res, next){
    /* Verify user identity. Store user detials in req.user */
    try {
        const verified = jsonwebtoken.verify(req.header('auth-token'), process.env.WEBTOKEN_SECRET)
        req.user = verified
        next()
    }catch(err){
        res.status(401).send('Access denied')
        console.log(err)
    }
}

module.exports = verifyWebToken