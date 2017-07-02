const express = require('express')
const router = express.Router()

// root get
router.get('/', (req, res, next) => {
  res.render('index', {
    user: req.user
  })
})

module.exports = router
