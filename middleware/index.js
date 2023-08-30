const checkAuthentication = (req, res, next) => {

    if (req.session.user){
        next();
    } else {
        req.flash('error', 'Must be logged in to view page')
        res.redirect('/user/login');
    }
}

module.exports = {
    checkAuthentication
}