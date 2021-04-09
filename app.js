const express = require('express')
const path = require('path')
const router = require('./router')
const bodyParser = require('body-parser')
const session = require('express-session')
const template = require('art-template')

const app = express()

app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

app.engine('html', require('express-art-template'))
app.set('views', path.join(__dirname, './views/'))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use(session({
  secret: '123456',
  resave: false,
  saveUninitialized: true
}))

app.use(router)

//注册一个过滤器 通过处理时间戳 转为日期格式
template.defaults.imports.getDate = dateTime => {
  const datetime = new Date(dateTime)

  const year = datetime.getFullYear()
  const month = ("0" + (datetime.getMonth() + 1)).slice(-2)
  const date = ("0" + datetime.getDate()).slice(-2)
  const hour = ("0" + datetime.getHours()).slice(-2)
  const minute = ("0" + datetime.getMinutes()).slice(-2)

  return year + "-" + month + "-" + date + " " + hour + ":" + minute
}

app.listen(5000, () => {
  console.log('http://127.0.0.1:5000/')
})