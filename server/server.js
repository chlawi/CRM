/**
 * Created by chet.williams on 1/29/2015.
 */
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var path = require('path');

var mongoskin = require('mongoskin');

var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var jwtSecret = 'DotheRightThing';

var moment = require('moment');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use((cors()));

app.use('/', express.static(path.join(__dirname, "/../client")));

//app.use(expressJwt({
//  secret: 'DotheRightThing',
//  credentialsRequired: true,
//  getToken: function fromHeaderOrQuerystring (req) {
//    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//      return req.headers.authorization.split(' ')[1];
//    } else if (req.query && req.query.token) {
//      return req.query.token;
//    }
//    return null;
//  }
//}).unless({path: ['/api/signIn']}));

//app.use(expressJwt({secret: jwtSecret}).unless({path: ['/api/signIn','/api/register']}));

app.use(function (req, res, next) {
  console.log("IP Addresses: %s, Hostname: %s, path: %s, base: %s, user: %s", req.ip, req.hostname, req.path, req.baseUrl, req.user);
  return next()
});


var db = mongoskin.db("mongodb://localhost:27017/l-tronInside", {safe: true});

app.post('/api/signIn', function (req, res, next) {
  try {
    console.log('request was here!', req.body);
    if (!( req.body.email && req.body.password)) {
      res.status(401).send('User name and password required');
    }
    //else{
    //  res.status(200).end();
    //}

    var credentials = {};
    credentials = req.body;
    db.collection('users').findOne({email: credentials.email}, function (err, result) {
      if (err) {
        console.log(err);
        throw(err);
      }
      else if (result === null) {
        res.status(401).end('Invalid user name or password')
      }
      else {
        var user = result;

        var hashedCode = crypto.createHmac('sha1', user.salt);
        var hashedPassword = hashedCode.update(credentials.password).digest('hex');
        if (user.password === hashedPassword) {
          var expiration = moment().add(7, 'days').valueOf();
          var token = jwt.sign(user.email, jwtSecret, expiration);
          var profile = {
            firstName: user.firstName,
            role: user.role,
            alias: user.alias
          };

          var decoded = jwt.decode(token);
          console.log(decoded);

          res.send({
            token: token,
            profile: profile
          });
        }
        else {
          res.status(401).end('Invalid user name or password');
        }
      }
    });
  }
  catch (err) {
    return next(err);
  }
});

app.post('/api/register', function (req, res, next) {
console.log("in api/register", req.user)
  db.collection('users').findOne({"email":req.user},{},function (err, result) {
    if (err) {
      console.log('and error occurred');
      return next(err);
    }

    console.log(' no error occurred');
    //console.log('result: ', result);
    if (result && result.role === 'administrator') {
      console.log(' user authorized');
      console.log(' pass db.collections');
      var salt = crypto.randomBytes(128).toString('base64');
      var hmac = crypto.createHmac('sha1', salt);

      var hashed_pwd = hmac.update(req.body.password).digest('hex');

      db.collection('users').insert({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
        alias: req.body.alias,
        salt: salt,
        password: hashed_pwd
      }, function (e, results) {
        if (e) {
          console.log(e);
          return next(e)
        }
        else {
          console.log(results);
          res.status(200).json(results)
        }
      })
    }
    else{
      res.status(403).send('user not authorized');
    }
  });
});

app.param('collectionName', function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next()
});

app.get('/api/:collectionName', function (req, res, next) {
  req.collection.find({}, {limit: 10, sort: [['_id', -1]]}).toArray(function (e, results) {
    if (e) return next(e);
    res.send(results)
  })
});

app.post('/api/:collectionName', function (req, res, next) {
  req.collection.insert(req.body, {}, function (e, results) {
    console.log(req.collection);
    if (e) return next(e);
    res.send(results)
  })
});

app.post('/api/:collectionName/signIn', function (req, res, next) {
  req.collection.findOne({email: req.body.email}, function (err, result) {
    if (err) {
      res.send(err)
    }
    else {
      var user = {};

      user.password = result.password;
      user.salt = result.salt;

      var hmac = crypto.createHmac('sha1', user.salt);

      var hashed_pwd = hmac.update(req.body.password).digest('hex');

      if (user.password === hashed_pwd) {
        res.status(200).json(user)
      }
      else {
        res.status(401).end()
      }
    }
  })
});

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.send(401, 'invalid token...');
  }
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json(err);
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('App listening at http://%s:%s', host, port)
});

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