const express = require('express')
const bcrypt = require('bcrypt')
const { authenticated, adminAuthenticated } = require('../authentication')
const User = require('../models/User')
const router = express.Router()

if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const admin = process.env.ADMIN

router.get('/', adminAuthenticated, async(req, res) => {
    let query = User.find()
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    if (req.query.email != null && req.query.email != '') {
        query = query.regex('email', new RegExp(req.query.email, 'i'))
    }
    if (req.query.telephoneNumb != null && req.query.telephoneNumb != '') {
        query = query.regex('telephoneNumb', new RegExp(req.query.telephoneNumb))
    }
    if (req.query.addedBefore != null && req.query.addedBefore != '') {
        query = query.lte('date', req.query.addedBefore)
    }
    if (req.query.addedAfter != null && req.query.addedAfter != '') {
        query = query.gte('date', req.query.addedAfter)
    }

    try {
        const users = await query.exec()
        res.render('manageusers/users', {
            user: req.user,
            users: users,
            searched: req.query,
            admin
        })
    } catch (error) {
        console.error(error)
        res.redirect('/manageusers')
    }
})

router.get('/:id', adminAuthenticated, async(req, res) => {
    res.send('Unavailable For Now')
})

router.get('/:id/edit', adminAuthenticated, async(req, res) => {
    try {
        let user = req.user
        let nonAdmin = await User.findById(req.params.id)
        res.render('manageusers/edit', {
            user: user,
            nonAdmin: nonAdmin,
            admin
        })
    } catch (error) {
        console.error(error)
        res.redirect('/manageusers')
    }
})

router.put('/:id', adminAuthenticated, async(req, res) => {
    let nonAdmin
    let user = req.user
    try {
        let errors = []
        nonAdmin = await User.findById(req.params.id)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        let userByEmail = await User.find({ email: req.body.email })
        userByEmail = userByEmail[0]
        if (userByEmail != null && nonAdmin.id != userByEmail.id) {
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
            return res.render('manageusers/edit', {
                errors,
                user,
                nonAdmin,
                name: req.body.name,
                email: req.body.email,
                telephoneNumb: req.body.telephoneNumb,
                admin
            })
        }
        nonAdmin.name = req.body.name
        nonAdmin.email = req.body.email
        nonAdmin.telephoneNumb = req.body.telephoneNumb
        if (req.body.password != null && req.body.password != '') {
            nonAdmin.password = hashedPassword
        } else {
            nonAdmin.password = nonAdmin.password
        }
        await nonAdmin.save()
        res.redirect(`/manageusers`)
    } catch (error) {
        console.error(error)
        if (nonAdmin != null) {
            res.render('manageusers/edit', {
                errors,
                user,
                nonAdmin,
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