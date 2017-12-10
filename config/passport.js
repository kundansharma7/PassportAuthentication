// var JwtStrategy = require('passport-jwt').Strategy;

var JwtStrategy = require('passport-jwt').Strategy,
ExtractJwt = require('passport-jwt').ExtractJwt;


var User = require('../app/models/user');
var config = require('../config/database');
const _ = require('underscore');

module.exports = function(passport) {
    /*var opts = {};
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function(jwt_payload, done){
        User.find({id: jwt_payload.id}, function(err, user) {
            if(err) {
                return done(err, false);
            }
            if(user) {
                done(null, user);
            } else {
                done (null, false);
            }
        });
    }));*/
/*
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = 'secret';
    opts.issuer = 'accounts.examplesoft.com';
    opts.audience = 'yoursite.net';
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        User.findOne({id: jwt_payload.sub}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    }));*/


    var jwtOptions = {}
    jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
    jwtOptions.secretOrKey = 'secret';
    
    var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, done) {
      console.log('payload received', jwt_payload);
      // usually this would be a database call:
    //   var user = User[_.findIndex(User, {id: jwt_payload.id})];
    //   if (user) {
    //     next(null, user);
    //   } else {
    //     next(null, false);
    //   }

        User.findOne({id: jwt_payload.sub}, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
    });
    
    passport.use(strategy);
};