import { localRegisterStrategy, localLoginStrategy } from "./passport-local.js";
import googleStrategy from "./passport-google.js";
import facebookStrategy from "./passport-facebook.js";
import User from "../../models/userModel.js";

const configurePassport = (passport) => {
  passport.serializeUser((userId, next) => {
    next(null, userId);
  });

  passport.deserializeUser((id, next) => {
    console.log(`deserializeUser ${id}`);
    User.findById(id, (err, user) => {
      next(err, user.id);
    });
  });

  passport.use("local.register", localRegisterStrategy);
  passport.use("local.login", localLoginStrategy);
  passport.use(googleStrategy);
  passport.use(facebookStrategy);
};

export default configurePassport;
