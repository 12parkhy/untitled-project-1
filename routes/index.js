const express = require('express')
const { authenticated } = require('../authentication')
const Book = require('../models/Book')
const router = express.Router()

router.get('/', authenticated, async (req, res) => {
    res.redirect('/users')
})

module.exports = router 