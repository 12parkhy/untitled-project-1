const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishedDate: {
        type: Date,
        required: true
    },
    addedDate: {
        type: Date,
        required: true,
        default: Date.now()
    },
    pageCount: {
        type: Number,
        required: true
    },
    coverImage: {
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }

})

BookSchema.virtual('coverImageSrc').get(function () {
    if (this.coverImage != null && this.coverImageType != null) {
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

const Book = mongoose.model('Book', BookSchema)

module.exports = Book 
