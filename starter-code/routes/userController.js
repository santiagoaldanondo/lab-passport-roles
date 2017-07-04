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
  if (req.user.permissions.userList) { // If it has permissions, list all users
    User.find({}, (err, users) => {
      if (err) {
        throw err
      }
      res.render('users/list', {
        currentUser: req.user,
        users: users
      })
    })
  } else if (req.user.role === 'Student') { // If it is a student, list only students
    User.find({
      role: req.user.role
    }, (err, users) => {
      if (err) {
        throw err
      }
      res.render('users/list', {
        currentUser: req.user,
        users: users
      })
    })
  } else {
    res.redirect('/private/users')
  }
})

// private/users/new get. New user
router.get('/new', (req, res, next) => {
  if (req.user.permissions.userNew) {
    res.render('users/new', {
      currentUser: req.user
    })
  } else {
    res.redirect('/private/users')
  }
})

// private/users post (comes from the form new). Create a user
router.post('/', (req, res, next) => {
  if (req.user.permissions.userNew) {
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

    newUser.assignPermissions() // Assign permissions when creating new user
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
  } else {
    res.redirect('/private/users')
  }
})

// private/users/:id get. Show a user
router.get('/:id', (req, res, next) => {
  const userId = req.params.id
  User.findById(userId, (err, user) => {
    if (err) {
      throw err
    }
  }).then(function (userShow) {
    // If the current user has permissions or has the same role as the user to be shown
    if (req.user.permissions.userShow || userShow.role === req.user.role) {
      res.render('users/show', {
        currentUser: req.user,
        user: userShow
      })
    } else {
      res.redirect('/private/users')
    }
  })
})

// private/users/:id/edit get. Edit a user
router.get('/:id/edit', (req, res, next) => {
  // If the user has permissions, or the id to edit is his own
  const userId = req.params.id
  if (req.user.permissions.userEdit || req.user.id === userId) {
    User.findById(userId, (err, user) => {
      if (err) {
        return next(err)
      }
      res.render('users/edit', {
        currentUser: req.user,
        user: user
      })
    })
  } else {
    res.redirect('/private/users')
  }
})

// private/users/:id/edit get. Update a user
router.post('/:id', (req, res, next) => {
  // If the user has permissions, or the id to edit is his own
  const userId = req.params.id
  if (req.user.permissions.userEdit || req.user.id === userId) {
    const updates = {
      username: req.body.username,
      name: req.body.name,
      familyName: req.body.familyName,
      role: req.body.role
    }

    User.findByIdAndUpdate(userId, updates, (err, user) => {
      if (err) {
        return res.render(`users/${userId}/update`, {
          currentUser: req.user,
          messages: {
            error: err
          }
        })
      } else {
        res.redirect('/private/users/list')
      }
    })
  } else {
    res.redirect('/private/users')
  }
})

// private/users/:id/delete get. Delete a user
router.get('/:id/delete', (req, res, next) => {
  if (req.user.permissions.userDelete) {
    const userId = req.params.id

    User.findByIdAndRemove(userId, (err, user) => {
      if (err) {
        return next(err)
      }
      return res.redirect('/private/users/list')
    })
  } else {
    res.redirect('/private/users')
  }
})

module.exports = router
