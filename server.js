var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var User = require('./app/models/user');
var port = process.env.PORT || 5000;
var jwt = require('jwt-simple');

//get our request parameters
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

// demo Route
app.get('/', function(req, res) {
    res.send('Api response at localhost: ');
});

mongoose.connect(config.database);

require('./config/passport')(passport);

var apiRoutes = express.Router();

apiRoutes.post('/signup', function(req, res) {
    if(!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password'})
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password
        });
        newUser.save(function(err) {
            if(err) {
                res.json({success: false, msg: 'Username already exists.'})
            } else {
                res.json({success: true, msg: 'Successfully created user!'})
            }
        });
    }
});

apiRoutes.post('/authenticate', function(req, res) {
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if(err) throw err;

        if(!user) {
            return res.status(403).send({
                success: false,
                msg: 'Authentication failed. User not found.'
            })
        } else {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if(isMatch && !err) {
                    var token = jwt.encode(user, config.secret);
                    res.json({
                        success: true,
                        token: 'JWT ' + token
                    });
                } else {
                    return res.status(403).send({
                        success: false,
                        msg: 'Authentication failed. Wrong password.'
                    });
                }
            });
        }
    })
});

apiRoutes.get('/memberinfo', passport.authenticate('jwt', {session: false}), function(req, res) {
    console.log('ddddd')
    var token = getToken(req.headers);
    if(token) {
        var decoded = jwt.decode(token, 'secret'); console.log('Decoded pass: ', decoded)
        User.findOne({
            name: decoded.name
        }, function(err, user) {
            if(err) throw err;
            if(!user) {
                return res.status(403).send({
                    success: false,
                    msg: 'Authentication failed. Wrong password.'
                });
            } else {
                return res.json({
                    success: true,
                    msg: 'Welcome in the member area ' + user.name + '!'
                });
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            msg: 'No token provided.'
        });
    }
});

getToken = function(headers) {
    if(headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if(parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

app.use('/api', apiRoutes)

// Start the server
app.listen(port);
console.log('App is running on Port ', port);