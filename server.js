const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const booksRouter = require('./routes/books')
const manageUsersRouter = require('./routes/manageusers')
const passportSetup = require('./config/passport')
const User = require('./models/User')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

passportSetup(passport)

const app = express()

app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => { console.log('Successfully connected to MongoDB') })
    .catch((error) => console.error(error))

app.use(indexRouter)
app.use('/users', usersRouter)
app.use('/books', booksRouter)
app.use('/manageusers', manageUsersRouter)

const port = process.env.PORT || 3000
app.listen(port, () => { console.log(`Server is running on port ${port}`) })