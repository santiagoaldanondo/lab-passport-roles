const express = require('express')
const router = express.Router()

// require the user model here
const User = require('../models/user')

// Private root get
router.get('/', (req, res, next) => {
  // After login in, you are redirected to /private. Assign permissions in case they have changed
  const userId = req.user.id
  const permissionUser = req.user
  permissionUser.assignPermissions()
  User.findByIdAndUpdate(userId, permissionUser, (err, user) => {
    if (err) {
      throw err
    } else {
      res.render('private/index', {
        currentUser: req.user
      })
    }
  })
})

module.exports = router
