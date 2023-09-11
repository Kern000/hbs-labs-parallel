const jwt = require('jsonwebtoken');

const checkAuthentication = (req, res, next) => {

    if (req.session.user){
        next();
    } else {
        req.flash('error', 'Must be logged in to view page')
        res.redirect('/user/login');
    }
}

const checkAuthenticationWithJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(authHeader){
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, payload){
            if(error){
                res.status(401);
                return res.json({
                    error
                })
            } else {
                req.user = payload;
                next();
            }
        })        
    } else {
        res.sendStatus(401);
    }
}

module.exports = {
    checkAuthentication,
    checkAuthenticationWithJWT
}