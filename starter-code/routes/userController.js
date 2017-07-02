const express = require('express')
const router = express.Router()

// require the user model here
const User = require('../models/user')

// Bcrypt and passport
const bcrypt = require('bcrypt')
const bcryptSalt = 10

// private/users get. Show users root
router.get('/', (req, res, next) => {
  res.render('users/index', {
    currentUser: req.user
  })
})

// private/users/list get. Show list of users
router.get('/list', (req, res, next) => {
  User.find({}, (err, users) => {
    if (err) {
      throw err
    }
    res.render('users/list', {
      currentUser: req.user,
      users: users
    })
  })
})

// private/users/new get. New user
router.get('/new', (req, res, next) => {
  res.render('users/new', {
    currentUser: req.user
  })
})

// private/users post (comes from the form new). Create a user
router.post('/', (req, res, next) => {
  if (req.body.username === '' || req.body.password === '') {
    return res.render('users/new', {
      currentUser: req.user,
      messages: {
        error: 'The username and password cannot be empty'
      }
    })
  }

  const salt = bcrypt.genSaltSync(bcryptSalt)
  const hashPass = bcrypt.hashSync(req.body.password, salt)

  const newUser = new User({
    username: req.body.username,
    name: req.body.name,
    familyName: req.body.familyName,
    password: hashPass,
    role: req.body.role
  })

  newUser.save((err) => {
    if (err) {
      res.render('users/new', {
        currentUser: req.user,
        messages: {
          error: newUser.errors
        }
      })
    } else {
      res.redirect('/private/users/list')
    }
  })
})

// private/users/:id get. Show a user
router.get('/:id', (req, res, next) => {
  const userId = req.params.id

  User.findById(userId, (err, user) => {
    if (err) {
      return next(err)
    }
    res.render('users/show', {
      currentUser: req.user,
      user: user
    })
  })
})

// private/users/:id/edit get. Edit a user
router.get('/:id/edit', (req, res, next) => {
  const userId = req.params.id

  User.findById(userId, (err, user) => {
    if (err) {
      return next(err)
    }
    res.render('users/edit', {
      currentUser: req.user,
      user: user
    })
  })
})

// private/users/:id/edit get. Update a user
router.post('/:id', (req, res, next) => {
  const userId = req.params.id

  const updates = {
    username: req.body.username,
    name: req.body.name,
    familyName: req.body.familyName,
    role: req.body.role
  }

  User.findByIdAndUpdate(userId, updates, (err, user) => {
    if (err) {
      res.render(`users/${userId}/update`, {
        currentUser: req.user,
        messages: {
          error: err
        }
      })
    } else {
      res.redirect('/private/users/list')
    }
  })
})

// private/users/:id/delete get. Delete a user
router.get('/:id/delete', (req, res, next) => {
  const userId = req.params.id

  User.findByIdAndRemove(userId, (err, user) => {
    if (err) {
      return next(err)
    }
    return res.redirect('/private/users/list')
  })
})

module.exports = router
