const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const indexRouter = require('./routes/index')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const app = express()

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.once('open', () => console.log("Successfully connected to MongoDB"))

app.use('/', indexRouter)

const port = process.env.PORT || 3000
app.listen(port, () => {console.log(`Server is running on port ${port}`)})

