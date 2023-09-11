const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { User, BlackListedToken } = require('../../models');
const { checkAuthenticationWithJWT } = require('../../middleware');

const generateJwtToken = (user, tokenSecret, expiryTime) => {
    return jwt.sign({
        'name': user.name,
        'id': user.id,
        'email': user.email
        },
        tokenSecret,
        {
        expiresIn: expiryTime
        }
    )
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hashedPassword = sha256.update(password).digest('base64')
    return hashedPassword;
}

router.post('/login', async(req, res)=>{

    let foundUser = await User.where({
        'email': req.body.email,
        'password': getHashedPassword(req.body.password)
    }).fetch({
        require: false
    });

    if (foundUser){
        const accessToken = generateJwtToken(foundUser.toJSON(), process.env.ACCESS_TOKEN_SECRET, "1hr");
        const refreshToken = generateJwtToken(foundUser.toJSON(), process.env.REFRESH_TOKEN_SECRET, "30d");
        res.json({
            accessToken, refreshToken
        })
    } else {
        res.sendStatus(403)
    }
})

router.post('/refreshAccess', (req,res)=>{

    const refreshToken = req.body.refresh;

    if (!refreshToken){
        
        return res.sendStatus(400);

    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(error, payload)=>{

            if (error){
                return res.sendStatus(400);
            } 

            let blackListedToken = await BlackListedToken.where({
                    "token": refreshToken
                }).fetch({
                    require:false
                })
            console.log('tried fetching blacklist token', blackListedToken)
                
            if (blackListedToken){
                res.status(400);
                return res.json({
                    "error": "Refresh Token black listed"
                })
            } else {
                const accessToken = generateJwtToken(payload, process.env.ACCESS_TOKEN_SECRET, "1h");
                res.json({
                    accessToken
                })
            }
        })
    }
})

router.delete('/blackList', async (req, res)=>{

    jwt.verify(req.query.refreshToken, process.env.REFRESH_TOKEN_SECRET, (error,payload)=>{

        if (error){
            return res.sendStatus(400);
        } else {
            const blackListedToken = new BlackListedToken({
                token: req.query.refreshToken,
                date_of_creation: new Date()
            })
            blackListedToken.save();
            res.json({
                'success': "Token is blacklisted"
            })
        }
    })
})

router.get("/profile", [checkAuthenticationWithJWT], (req, res)=>{
    res.json(req.user);
})

module.exports = router;

