const mongoose = require('mongoose')
const db = require('./db')
const Schema = mongoose.Schema
const commentSchema = new Schema({
  articleId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  comments: {
    type: String,
    required: true
  },
  created_time: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Comment', commentSchema)
