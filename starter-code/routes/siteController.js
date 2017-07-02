const express = require('express')
const router = express.Router()

// User model
const User = require('../models/user')

// Course model
const Course = require('../models/course')

// Bcrypt and passport
const bcrypt = require('bcrypt')
const bcryptSalt = 10
const ensureLogin = require('connect-ensure-login')
const passport = require('passport')

// Definition of middlewares to check authentication and roles
function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  } else {
    res.redirect('/login')
  }
}

function checkRoles (role) {
  return function (req, res, next) {
    if (req.isAuthenticated() && req.user.role === role) {
      return next()
    } else {
      res.redirect('/login')
    }
  }
}

const checkBoss = checkRoles('Boss')
const checkDeveloper = checkRoles('Developer')
const checkTA = checkRoles('TA')

// // Signup get
// router.get('/signup', (req, res, next) => {
//   res.render('auth/signup', {
//     currentUser: req.user
//   })
// })

// // Signup post
// router.post('/signup', (req, res, next) => {
//   const username = req.body.username
//   const password = req.body.password
//   const password2 = req.body.password2

//   if (username === '' || password === '') {
//     return res.render('auth/signup', {
//       currentUser: req.user,
//       messages: {
//         error: 'Your username and password cannot be empty'
//       }
//     })
//   }
//   if (password !== password2) {
//     return res.render('passport/signup', {
//       currentUser: req.user,
//       messages: {
//         error: 'Your passwords don\'t match'
//       }
//     })
//   }

//   const salt = bcrypt.genSaltSync(bcryptSalt)
//   const hashPass = bcrypt.hashSync(password, salt)

//   const newUser = User({
//     username: username,
//     password: hashPass
//   })
//   newUser.save((err) => {
//     if (err) {
//       res.render('auth/signup', {
//         currentUser: req.user,
//         messages: {
//           error: 'There was a problem with your signup. That user already exists'
//         }
//       })
//     } else {
//       res.render('auth/login', {
//         currentUser: req.user,
//         messages: {
//           success: 'Your account was created succesfully. You can log in now'
//         }
//       })
//     }
//   })
// })

// root get
router.get('/', (req, res, next) => {
  res.render('index', {
    currentUser: req.user
  })
})

// Login get
router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    currentUser: req.user,
    messages: {
      error: req.flash('error')
    }
  })
})

// Login post
router.post('/login', passport.authenticate('local', {
  successRedirect: '/private',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

// Facebook authentication
router.get('/auth/facebook', passport.authenticate('facebook'))
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  authType: 'reauthenticate',
  successRedirect: '/private',
  failureRedirect: '/'
}))

// Google authentication
router.get('/auth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'
  ]
}))
router.get('/auth/google/callback', passport.authenticate('google', {
  authType: 'reauthenticate',
  failureRedirect: '/',
  successRedirect: '/private'
}))

// Logout get (to prevent 404 errors when refreshing)
router.get('/logout', (req, res) => {
  res.redirect('/login')
})

// Logout post
router.post('/logout', (req, res) => {
  req.logout()
  res.redirect('/login')
})

// Private root get
router.get('/private', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('private/index', {
    currentUser: req.user
  })
})

module.exports = router
