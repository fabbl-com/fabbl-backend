import passport from "passport";
import User from "../models/userModel.js";
import { localRegisterStrategy, localLoginStrategy } from "./passport-local.js";

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

export default passport;
