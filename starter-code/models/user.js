const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'You need a username'],
    unique: [true, 'That name already exists']
  },
  name: String,
  familyName: String,
  password: String,
  facebookID: String,
  googleID: String,
  role: {
    type: String,
    enum: ['Boss', 'Developer', 'TA', 'Student'],
    default: 'Developer'
  },
  permissions: {
    userShow: Boolean,
    userList: Boolean,
    userNew: Boolean,
    userEdit: Boolean,
    userDelete: Boolean,
    courseShow: Boolean,
    courseList: Boolean,
    courseNew: Boolean,
    courseEdit: Boolean,
    courseDelete: Boolean
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})

// Method to assign permissions depending on the user's role
userSchema.methods.assignPermissions = function assignPermissions () {
  if (this.role === 'Boss') {
    this.permissions = {
      userShow: true,
      userList: true,
      userNew: true,
      userEdit: true,
      userDelete: true,
      courseShow: true,
      courseList: true,
      courseNew: false,
      courseEdit: false,
      courseDelete: false
    }
  } else if (this.role === 'Developer') {
    this.permissions = {
      userShow: true,
      userList: true,
      userNew: false,
      userEdit: false,
      userDelete: false,
      courseShow: true,
      courseList: true,
      courseNew: false,
      courseEdit: false,
      courseDelete: false
    }
  } else if (this.role === 'TA') {
    this.permissions = {
      userShow: true,
      userList: true,
      userNew: false,
      userEdit: false,
      userDelete: false,
      courseShow: true,
      courseList: true,
      courseNew: true,
      courseEdit: true,
      courseDelete: true
    }
  } else if (this.role === 'Student') {
    this.permissions = {
      userShow: false,
      userList: false,
      userNew: false,
      userEdit: false,
      userDelete: false,
      courseShow: true,
      courseList: true,
      courseNew: false,
      courseEdit: false,
      courseDelete: false
    }
  }
}

const User = mongoose.model('User', userSchema)
module.exports = User
