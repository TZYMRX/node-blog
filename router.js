const express = require('express')
const router = express.Router()

const Comment = require('./models/comment')
const Topic = require('./models/topic')
const User = require('./models/user')
const md5 = require('blueimp-md5')

router.get('/', async (req, res) => {
  try {
    const data = await Topic.find({})
    res.render('index.html', {
      user: req.session.user,
      topics: data
    })
  } catch (e) {
    throw e
  }
})

router.get('/login', (req, res) => {
  res.render('login.html')
})

router.post('/login', (req, res) => {
  let body = req.body
  console.log(md5(md5(body.password)))
  User.findOne({
    email: body.email,
    password: md5(md5(body.password))
  }, (err, user) => {
    if (err) {
      return res.status(500).json({
        err_code: 500,
        massage: err.massage
      })
    }

    if (!user) {
      return res.status(200).json({
        err_code: 1,
        massage: 'Email or Password is invalid'
      })
    }

    req.session.user = user

    res.status(200).json({
      err_code: 0,
      massage: 'OK'
    })
  })
})

router.post('/register', (req, res) => {
  // 获取表单提交的数据
  let body = req.body
  console.log(body)
  // 操作数据库
  User.findOne({
    $or: [
      {email: body.email},
      {nickname: body.nickname}
    ]
  }, (err, data) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Server Error'
      })
    }

    if (data) {
      // 邮箱或名称已存在
      return res.status(200).json({
        err_code: 1,
        message: 'email or name already exists.'
      })
    }

    // 密码MD5重复加密
    body.password = md5(md5(body.password))

    new User(body).save((error, user) => {
      if (error) {
        console.log(error)
        return res.status(500).json({
          err_code: 500,
          message: 'Server Error'
        })
      }

      //  注册成功, 使用Session记录用户登录状态
      req.session.user = user
      console.log(req.session)
      return res.status(200).json({
        err_code: 0,
        message: 'ok'
      })
    })
  })
})


router.get('/logout', (req, res) => {
  delete req.session.user

  res.redirect('/login')
})


router.get('/settings/profile', (req, res) => {
  res.render('settings/profile.html', {
    user: req.session.user
  })
})

router.post('/settings/profile', async (req, res) => {
  const body = req.body

  try {
    await User.updateOne(
        {
          email: req.session.user.email
        },
        {
          $set: {
            "nickname": body.nickname,
            "bio": body.bio,
            "gender": body.gender,
            "birthday": body.birthday
          },
          $currentDate: {"lastModified": true}
        })
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
    res.render('settings/profile.html', {
      user: req.session.user
    })
  } catch (e) {
    return res.status(500).json({
      err_code: 500,
      message: e.message
    })
  }
})


router.get('/settings/admin', (req, res) => {
  res.render('settings/admin.html', {
    user: req.session.user
  })
})

router.post('/settings/admin', async (req, res) => {
  const body = req.body
  const newPwd = md5(md5(body.checkPwd))

  try {
    await User.updateOne(
        {email: req.session.user.email},
        {
          $set: {"password": newPwd},
          $currentDate: {"lastModified": true}
        })
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  } catch (e) {
    return res.status(500).json({
      err_code: 500,
      message: e.message
    })
  }
})

router.get('/settings/delete', (req, res) => {
  User.deleteOne({
    email: req.session.user.email
  })
      .then(data => {
        res.status(200).json({
          err_code: 0,
          message: 'OK'
        })
        delete req.session.user
      })
      .catch(err => {
        return res.status(500).json({
          err_code: 500,
          message: e.message
        })
      })
})


router.get('/topics/new', (req, res) => {
  res.render('topic/new.html', {
    user: req.session.user
  })
})

router.post('/topics/new', (req, res) => {
  const body = req.body
  body["email"] = req.session.user.email
  body["nickname"] = req.session.user.nickname

  new Topic(body).save()
      .then(data => {
        res.status(200).json({
          err_code: 0,
          message: 'OK'
        })
      })
      .catch(err => {
        return res.status(500).json({
          err_code: 500,
          message: err.message
        })
      })
})

router.get('/topics/show', async (req, res) => {
  const id = (req.query.id).replace(/\"/g, "")
  try {
    const topic = await Topic.findOne({_id: id})
    const comments = await Comment.find({articleId: id})
    res.render('topic/show.html', {
      comments,
      topic,
      user: req.session.user
    })
  } catch (e) {
    throw e
  }
})

router.post('/topics/show', async (req, res) => {
  const body = req.body
  const articleId = body.articleId.replace(/\"/g, "")
  try {
    const data = await Topic.findOne({_id: articleId})
    const comment = {}
    comment.articleId = articleId
    comment.email = data.email
    comment.nickname = req.session.user.nickname
    comment.comments = body.comments
    await new Comment(comment).save()
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  } catch (e) {
    res.status(500).json({
      err_code: 500,
      message: e.message
    })
  }
})


module.exports = router