if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash('login', 'Please Log In To View This Page')
    res.redirect('/users/login')
}

const notAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/user')
    }
    next()
}

const adminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.email === process.env.ADMIN) {
        return next()
    }
    req.flash('adminPage', 'Only Administrators Are Allowed To View This Page')
    res.redirect('/users')
}

module.exports = { authenticated, notAuthenticated, adminAuthenticated }