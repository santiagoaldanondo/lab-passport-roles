const express = require('express')
const router = express.Router()

// require the course model here
const Course = require('../models/course')

// Moment to format dates
const moment = require('moment')

// private/courses get. Show courses root
router.get('/', (req, res, next) => {
  res.render('courses/index', {
    currentUser: req.user
  })
})

// private/courses/list get. Show list of courses
router.get('/list', (req, res, next) => {
  Course.find({}, (err, courses) => {
    if (err) {
      throw err
    }
    res.render('courses/list', {
      currentUser: req.user,
      courses: courses,
      moment
    })
  })
})

// private/courses/new get. New course
router.get('/new', (req, res, next) => {
  res.render('courses/new', {
    currentUser: req.user
  })
})

// private/courses post (comes from the form new). Create a course
router.post('/', (req, res, next) => {
  if (req.body.name === '' || req.body.startingDate === '' ||
        req.body.endDate === '' || req.body.level === '') {
    return res.render('courses/new', {
      currentUser: req.user,
      messages: {
        error: 'You must fill in all the information in the form'
      }
    })
  }

  const newCourse = new Course({
    name: req.body.name,
    startingDate: req.body.startingDate,
    endDate: req.body.endDate,
    level: req.body.level,
    available: !!req.body.available
  })

  newCourse.save((err) => {
    if (err) {
      res.render('courses/new', {
        currentUser: req.user,
        messages: {
          error: newCourse.errors
        }
      })
    } else {
      res.redirect('/private/courses/list')
    }
  })
})

// private/courses/:id get. Show a course
router.get('/:id', (req, res, next) => {
  const courseId = req.params.id

  Course.findById(courseId, (err, course) => {
    if (err) {
      return next(err)
    }
    res.render('courses/show', {
      currentUser: req.user,
      course: course,
      moment
    })
  })
})

// private/courses/:id/edit get. Edit a course
router.get('/:id/edit', (req, res, next) => {
  const courseId = req.params.id

  Course.findById(courseId, (err, course) => {
    if (err) {
      return next(err)
    }
    res.render('courses/edit', {
      currentUser: req.user,
      course: course,
      moment
    })
  })
})

// private/courses/:id/edit get. Update a course
router.post('/:id', (req, res, next) => {
  const courseId = req.params.id

  const updates = {
    name: req.body.name,
    startingDate: req.body.startingDate,
    endDate: req.body.endDate,
    level: req.body.level,
    available: !!req.body.available
  }

  Course.findByIdAndUpdate(courseId, updates, (err, course) => {
    if (err) {
      res.render(`courses/${courseId}/update`, {
        currentUser: req.user,
        messages: {
          error: err
        }
      })
    } else {
      res.redirect('/private/courses/list')
    }
  })
})

// private/courses/:id/delete get. Delete a course
router.get('/:id/delete', (req, res, next) => {
  const courseId = req.params.id

  Course.findByIdAndRemove(courseId, (err, course) => {
    if (err) {
      return next(err)
    }
    return res.redirect('/private/courses/list')
  })
})

module.exports = router
