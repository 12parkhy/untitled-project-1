const express = require('express')
const Book = require('../models/Book')
const { authenticated, notAuthenticated, adminAuthenticated } = require('../authentication')
const router = express.Router()
const imageMimeTypes = ['image/bmp', 'image/jpeg', 'image/png', 'image/gif']

if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const admin = process.env.ADMIN

router.get('/', adminAuthenticated, async (req, res) => {
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
        res.render('books/index', {
            user: req.user,
            books: books,
            searched: req.query,
            admin
        })
    } catch (error) {
        console.error(error)
        res.redirect('/books')
    }
})

router.get('/add', adminAuthenticated, async (req, res) => {
    try {
        const book = new Book()
        res.render(`books/form`, {
            user: req.user,
            book: book,
            admin,
            error: 'Something Went Wrong When Adding A Book'
        })
    } catch (error) {
        console.error(error)
        res.redirect('/books')
    }
})

router.post('/', adminAuthenticated, async (req, res) => {
    let errors = []
    const book = new Book({
        title: req.body.title,
        description: req.body.description,
        publishedDate: new Date(req.body.publishedDate),
        pageCount: req.body.pageCount,
        author: req.body.author
    })
    if (!req.body.title || !req.body.author || !req.body.publishedDate || !req.body.pageCount || !req.body.coverImage) {
        errors.push({ message: 'All Fields Must Be Filled In Except Description' })
    }
    if (errors.length > 0) {
        return res.render('books/form', {
            user: req.user,
            errors,
            book: book,
            admin
        })
    }

    if (req.body.coverImage != null && req.body.coverImage != '') {
        const coverImage = JSON.parse(req.body.coverImage)
        if (coverImage != null && imageMimeTypes.includes(coverImage.type)) {
            book.coverImage = new Buffer.from(coverImage.data, 'base64')
            book.coverImageType = coverImage.type
        }
    }
    try {
        const newBook = await book.save()
        res.redirect(`/books/${newBook.id}`)
    } catch (error) {
        console.error(error)
        res.render(`books/form`, {
            user: req.user,
            book: book,
            admin,
            error: 'Something Went Wrong When Adding A Book'
        })
    }
})

router.get('/:id', adminAuthenticated, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        res.render('books/book', { user: req.user, book: book, admin })
    } catch (error) {
        console.error(error)
        res.redirect('/')
    }
})

router.get('/:id/edit', adminAuthenticated, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        res.render(`books/edit`, {
            user: req.user,
            book: book,
            admin
        })
    } catch (error) {
        console.error(error)
        res.redirect('/')
    }
})

router.put('/:id', adminAuthenticated, async (req, res) => {
    let book
    try {
        let errors = []
        book = await Book.findById(req.params.id)
        if (!req.body.title || !req.body.author || !req.body.publishedDate || !req.body.pageCount) {
            errors.push({ message: 'All Fields Must Be Filled In Except Description' })
        }
        if (errors.length > 0) {
            return res.render('books/edit', {
                user: req.user,
                errors,
                book: book,
                admin
            })
        }
        book.title = req.body.title
        book.author = req.body.author
        book.publishedDate = new Date(req.body.publishedDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.coverImage != null && req.body.coverImage != '') {
            const coverImage = JSON.parse(req.body.coverImage)
            if (coverImage != null && imageMimeTypes.includes(coverImage.type)) {
                book.coverImage = new Buffer.from(coverImage.data, 'base64')
                book.coverImageType = coverImage.type
            }
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        console.error(error)
        if (book != null) {
            res.render(`books/edit`, {
                user: req.user,
                book: book,
                admin,
                error: 'Something Went Wrong When Updating A Book'
            })
        } else {
            redirect('/')
        }
    }
})

router.delete('/:id', adminAuthenticated, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        console.error(error)
        if (book != null) {
            res.render('books/book', {
                user: req.user,
                book: book,
                admin,
                error: "Unable to Remove Book"
            })
        } else {
            res.redirect('/')
        }
    }
})

module.exports = router