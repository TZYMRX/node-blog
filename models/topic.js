const mongoose = require('mongoose')
const db = require('./db')
const Schema = mongoose.Schema

const topicSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  nickname: {
    type: String,
    required: true
  },
  model: {
    type: Number,
    enum: [0, 1, 2, 3],
    required: true
    //0--分享 1--问答 2--招聘 3--客户端测试
  },
  title: {
    type: String,
    required: true
  },
  article: {
    type: String,
    required: true
  },
  created_time: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Topic', topicSchema)
