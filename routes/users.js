const express = require('express')
const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Book = require('../models/Book')
const { authenticated, notAuthenticated } = require('../authentication')
const router = express.Router()

if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const admin = process.env.ADMIN

router.get('/', authenticated, async(req, res) => {
    let books
    try {
        books = await Book.find().sort({ addedDate: 'desc' }).limit(9).exec()
    } catch (error) {
        console.error(error)
        books = []
    }
    res.render('users/index', {
        user: req.user,
        books: books,
        admin
    })
})

router.get('/login', notAuthenticated, (req, res) => {
    res.render("users/login")
})

router.post('/login', notAuthenticated, passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/users/login',
    failureFlash: true
}))

router.delete('/logout', authenticated, (req, res) => {
    req.logOut()
    req.flash('logout', 'You Are Logged Out')
    res.redirect('/users/login')
})

router.get('/signup', notAuthenticated, (req, res) => {
    res.render('users/signup')
})

router.post('/signup', notAuthenticated, async(req, res) => {
    try {
        let errors = []
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        if (!req.body.name || !req.body.email || !req.body.telephoneNumb || !req.body.password || !req.body.confirmPassword) {
            errors.push({ message: 'All Fields Must Be Filled In' })
        }
        if (req.body.password != req.body.confirmPassword) {
            errors.push({ message: 'Passwords Do Not Match' })
        }
        if (req.body.password.length < 8) {
            errors.push({ message: 'Password Should Be At Least 8 Characters Long' })
        }
        if (errors.length > 0) {
            res.render('users/signup', {
                errors,
                name: req.body.name,
                email: req.body.email,
                telephoneNumb: req.body.telephoneNumb,
                admin
            })
        } else {
            User.findOne({ email: req.body.email })
                .then((user) => {
                    if (user) {
                        errors.push({ message: 'There Is An Account With That Email' })
                        res.render('users/signup', {
                            errors,
                            name: req.body.name,
                            email: req.body.email,
                            telephoneNumb: req.body.telephoneNumb,
                            admin
                        })
                    } else {
                        const newUser = new User({
                            name: req.body.name,
                            email: req.body.email,
                            telephoneNumb: req.body.telephoneNumb,
                            password: req.body.password
                        })
                        newUser.password = hashedPassword
                        newUser.save()
                            .then((user) => {
                                req.flash('signup', 'You Successfully Signed Up')
                                return res.redirect('/users/login')
                            })
                            .catch((error) => { console.error(error) })
                    }
                })
        }
    } catch (error) {
        console.error(error)
        res.redirect('/users/signup')
    }
})

router.get('/searchbooks', authenticated, async(req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.author != null && req.query.author != '') {
        query = query.regex('author', new RegExp(req.query.author, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishedDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishedDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('users/searchbooks', {
            user: req.user,
            books: books,
            searched: req.query,
            admin
        })
    } catch (error) {
        console.error(error)
        res.redirect('/users')
    }
})

router.get('/searchbooks/:id', authenticated, async(req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        res.render('users/book', {
            user: req.user,
            book: book,
            admin
        })
    } catch (error) {
        console.error(error)
        res.redirect('/users')
    }
})

router.get('/status', authenticated, (req, res) => {
    res.render('users/status', { user: req.user, admin })
})

router.get('/:id', authenticated, async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.render('users/profile', { user: user, admin })
    } catch (error) {
        console.error(error)
        res.redirect('/users')
    }
})

router.get('/:id/edit', authenticated, async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.render('users/edit', { user: user, admin })
    } catch (error) {
        console.error(error)
        res.redirect('/users')
    }
})

router.put('/:id', authenticated, async(req, res) => {
    let user
    try {
        let errors = []
        user = await User.findById(req.params.id)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let userByEmail = await User.find({ email: req.body.email })
        userByEmail = userByEmail[0]
        if (userByEmail != null && user.id != userByEmail.id) {
            errors.push({ message: 'There Is An Account With That Email' })
        }
        if (req.body.password != null && req.body.password != '') {
            if (req.body.password != req.body.confirmPassword) {
                errors.push({ message: 'Passwords Do Not Match' })
            }
            if (req.body.password.length < 8) {
                errors.push({ message: 'Password Should Be At Least 8 Characters Long' })
            }
        }
        if (errors.length > 0) {
            return res.render('users/edit', {
                errors,
                user,
                name: req.body.name,
                email: req.body.email,
                telephoneNumb: req.body.telephoneNumb,
                admin
            })
        }
        user.name = req.body.name
        user.email = req.body.email
        user.telephoneNumb = req.body.telephoneNumb
        if (req.body.password != null && req.body.password != '') {
            user.password = hashedPassword
        } else {
            user.password = user.password
        }
        await user.save()
        res.redirect(`/users/${user.id}`)
    } catch (error) {
        console.error(error)
        if (user != null) {
            res.render('users/edit', {
                errors,
                user,
                name: req.body.name,
                email: req.body.email,
                telephoneNumb: req.body.telephoneNumb,
                admin
            })
        } else {
            redirect('/users')
        }
    }
})

module.exports = router