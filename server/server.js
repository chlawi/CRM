/**
 * Created by chet.williams on 1/29/2015.
 */
var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
//var bodyParser = require('body-parser')
var morgan = require('morgan')

var mongoskin = require('mongoskin')

var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')

var crypto = require('crypto')
var jwtSecret = 'DotheRightThing'

var user = {
  username: 'chet.williams',
  password: 'secret'
};


var app = express()

console.log(__dirname)

app.use('/', express.static(__dirname + '/../client'))

//app.use(expressJwt({secret: jwtSecret}).unless({path: ['/signIn']}))
//app.use(expressJwt({secret: jwtSecret}));
app.use((cors()));

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(bodyParser.json({type: 'application/*+json'}))


app.use(morgan('dev'))

var db = mongoskin.db("mongodb://localhost:27017/l-tronInside")

//app.post('/signIn', authenticate, function (req, res) {
//  var token = jwt.sign({
//    usename: user.username
//  }, jwtSecret)
//  res.send({
//    token: token,
//    user: user
//  });
//});

app.param('collectionName', function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName)
  console.log(collectionName)
  return next()
})

app.get('/api/:collectionName', function (req, res, next) {
  req.collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray(function (e, results) {
    if (e) return next(e)
    res.send(results)
  })
})

app.post('/api/:collectionName/signIn', function (req, res, next) {
  req.collection.findOne({email: req.body.email}, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      var user = {}

      user.password = result.password
      user.salt = result.salt

      var hmac = crypto.createHmac('sha1', user.salt)

      var hashed_pwd = hmac.update(req.body.password).digest('hex')

      if (user.password === hashed_pwd) {
        res.status(200).json(user)
      }
      else {
        res.status(401).end()
      }
    }
  })
})


app.post('/api/:collectionName/register', function (req, res, next) {

  var salt = crypto.randomBytes(128).toString('base64')
  var hmac = crypto.createHmac('sha1', salt)

  var hashed_pwd = hmac.update(req.body.password).digest('hex')

  req.collection.insert({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    salt: salt,
    password: hashed_pwd
  }, function (e, results) {
    if (e) {
      console.log(e)
      return next(e)
    }
    else {
      console.log(results)
      res.status(200).json(results)
    }
  })
})

var server = app.listen(3000, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('App listening at http://%s:%s', host, port)
})

// UTIL FUNCTIONS
function authenticate(req, res, next) {
  var body = req.body;
  if (!body.username || !body.password) {
    res.status(400).end('Must provide username or password');
  }

  if (body.username != user.username || body.password != user.password) {
    res.status(404).end('Username or password incorrect')
  }
  next()
}