/**
 * Created by chet.williams on 1/29/2015.
 */
var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
var morgan = require('morgan')

var mongoskin = require('mongoskin')

var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')


var jwtSecret = 'DotheRightThing'

var user = {
  username: 'chet.williams',
  password: 'secret'
};

var app = express()

console.log(__dirname)

app.use('/', express.static(__dirname + '/../client'))

app.use(expressJwt({secret: jwtSecret}).unless({path: ['/signIn']}))
//app.use(expressJwt({secret: jwtSecret}));
app.use((cors()));
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))


app.post('/signIn', authenticate, function (req, res) {
  var token = jwt.sign({
    usename: user.username
  }, jwtSecret)
  res.send({
    token: token,
    user: user
  });
});


app.param('collectionName', function(req, res, next, collectionName){
  req.collection = db.collection(collectionName)
  return next()
})

app.get('/collections/:collectionName', function(req, res, next){
  req.collection.find({}, {limit:10, sort: [['_id',-1]]}).toArray(function(e, results){
    if(e) return next(e)
    res.send(results)
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