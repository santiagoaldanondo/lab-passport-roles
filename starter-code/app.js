const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const expressLayouts = require('express-ejs-layouts')
const flash = require('connect-flash')
const app = express()

const siteController = require('./routes/siteController')
const privateController = require('./routes/privateController')
const userController = require('./routes/userController')
const courseController = require('./routes/courseController')

// mongoose configuration
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/ibi-ironhack')

// require the user model
const User = require('./models/user')

// session and passport
const session = require('express-session')
const bcrypt = require('bcrypt')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FbStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('layout', 'layouts/main-layout')

app.use(expressLayouts)
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public/images/favicon.ico')))

// Session and Passport
app.use(flash())
app.use(session({
  secret: 'ibi-ironhack',
  resave: true,
  saveUninitialized: true
}))

passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findOne({
    '_id': id
  }, (err, user) => {
    if (err) {
      return cb(err)
    }
    cb(null, user)
  })
})

passport.use(new FbStrategy({
  clientID: '102312127053047',
  clientSecret: '0b99bca664ff589bba2217a0208331f4',
  callbackURL: '/auth/facebook/callback'
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({
    facebookID: profile.id
  }, (err, user) => {
    if (err) {
      return done(err)
    }
    if (user) {
      return done(null, user)
    }
    const newUser = new User({
      facebookID: profile.id,
      username: profile.displayName,
      name: profile.name.givenName || null,
      familyName: profile.name.familyName || null,
      role: 'Student'
    })

    newUser.save((err) => {
      if (err) {
        return done(err)
      }
      done(null, newUser)
    })
  })
}))

passport.use(new GoogleStrategy({
  clientID: '502887739806-o6agsds2pvt82ebknm07vrlogfrh71b7.apps.googleusercontent.com',
  clientSecret: '5kXXkLcq-lRFv8BWtdBpd44H',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({
    googleID: profile.id
  }, (err, user) => {
    if (err) {
      return done(err)
    }
    if (user) {
      return done(null, user)
    }
    const newUser = new User({
      googleID: profile.id,
      username: profile.displayName,
      name: profile.name.givenName || null,
      familyName: profile.name.familyName || null,
      role: 'Student'
    })

    newUser.save((err) => {
      if (err) {
        return done(err)
      }
      done(null, newUser)
    })
  })
}))

passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({
    username
  }, (err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return next(null, false, {
        message: 'Incorrect username'
      })
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return next(null, false, {
        message: 'Incorrect password'
      })
    }

    return next(null, user)
  })
}))

app.use(passport.initialize())
app.use(passport.session())

// Definition of middleware to check authentication
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/login')
  }
}

// require the routers
app.use('/', siteController)

// require authentication for the private routes
app.use(ensureAuthenticated)
app.use('/private', privateController)
app.use('/private/users', userController)
app.use('/private/courses', courseController)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
