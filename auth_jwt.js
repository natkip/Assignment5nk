const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('./Users');
const opts = {};

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");
opts.secretOrKey = process.env.SECRET_KEY;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({ _id: jwt_payload.id }, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

exports.isAuthenticated = passport.authenticate('jwt', { session: false });
