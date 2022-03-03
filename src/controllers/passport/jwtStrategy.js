import passportJWT from "passport-jwt";
import dotenv from "dotenv";
import User from "../../models/userModel.js";

dotenv.config();

const JwtStrategy = passportJWT.Strategy;
const { ExtractJwt } = passportJWT;

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET;

const jwtStrategy = new JwtStrategy(opts, (jwt_payload, done) => {
  // console.log(opts, jwt_payload);
  User.findOne({ _id: jwt_payload._id }, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  });
});

export default jwtStrategy;
