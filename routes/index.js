const express = require('express')
const { authenticated } = require('../authentication')
const Book = require('../models/Book')
const router = express.Router()

router.get('/', async (req, res) => {
    let books
    try {
        books = await Book.find().sort({ addedDate: 'desc' }).limit(9).exec()
    } catch (error) {
        console.error(error)
        books = []
    }
    res.render('index', {books: books})
})

module.exports = router 