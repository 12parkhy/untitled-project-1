const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/User')

const passportSetup = (passport) => {
    let userByEmail = ''
    passport.use(new localStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            await User.findOne({ email: email })
                .then((user) => { userByEmail = user })
                .catch((error) => { console.error(error) })
            if (!userByEmail) {
                return done(null, false, { message: 'There Is No Account With That Email' })
            }
            if (await bcrypt.compare(password, userByEmail.password)) {
                return done(null, userByEmail)
            }
            else {
                return done(null, false, { message: 'Wrong Password, Please Try Again' })
            }
        }
        catch (error) {
            return done(error)
        }
    })
    )
    passport.serializeUser((user, done) => { return done(null, user.id) })
    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => { return done(error, user) })
    })
}

module.exports = passportSetup