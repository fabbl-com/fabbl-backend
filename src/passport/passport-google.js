import passportGoogle from "passport-google-oauth20";
import keys from "../config/keys.js";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";

const GoogleStrategy = passportGoogle.Strategy;

const googleStrategy = new GoogleStrategy(
  {
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: keys.google.callbackURL,
    passReqToCallback: true,
  },
  (req, accessToken, refreshToken, profile, next) => {
    User.findOne({ google: profile.id }, (err, user) => {
      if (err) return next(new ErrorMessage(err, 400));
      if (user) return next(null, user);

      console.log(profile);

      const newUser = new User({
        google: profile.id,
        displayName: { value: profile.displayName },
        uuid: "12345", // to be genearted
        email: profile._json.email,
        isEmailVerifed: profile._json.email_verified,
        avatar: profile._json.picture,
      });

      newUser.save((err) => {
        if (err) return next(new ErrorMessage(err, 400));
        return next(null, newUser);
      });
    });
  }
);

export default googleStrategy;
