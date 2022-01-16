import passport from "passport";
import User from "../models/userModel.js";
import { localRegisterStrategy, localLoginStrategy } from "./passport-local.js";
import googleStrategy from "./passport-google.js";
import facebookStrategy from "./passport-facebook.js";

passport.serializeUser((user, next) => {
  next(null, { _id: user._id });
});

passport.deserializeUser((id, next) => {
  User.findById(id, (err, user) => {
    next(err, user);
  });
});

passport.use("local.register", localRegisterStrategy);
passport.use("local.login", localLoginStrategy);
passport.use(googleStrategy);
passport.use(facebookStrategy);

export default passport;
