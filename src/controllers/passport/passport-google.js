import passportGoogle from "passport-google-oauth20";
import keys from "../../config/keys.js";
import User from "../../models/userModel.js";

const GoogleStrategy = passportGoogle.Strategy;

const googleStrategy = new GoogleStrategy(
  {
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret,
    callbackURL: keys.google.callbackURL,
    passReqToCallback: true,
    proxy: true,
  },
  (req, accessToken, refreshToken, profile, next) => {
    User.findOne({ google: profile.id }, (err, user) => {
      if (err) return next(err);
      if (user) return next(null, user.id);
      // console.log(user.id);

      User.findOneAndUpdate(
        { email: profile._json.email },
        { google: profile.id, isEmailVerifed: profile._json.email_verified },
        { new: true, upsert: true },
        (err, user) => {
          if (err) return next(err);
          return next(null, user.id);
        }
      );
      // console.log(profile);
      const newUser = new User({
        google: profile.id,
        displayName: { value: profile.displayName },
        email: profile._json.email,
        isEmailVerifed: profile._json.email_verified,
        avatar: profile._json.picture,
      });

      newUser.save((err) => {
        if (err) return next(err);
        return next(null, newUser.id);
      });
    });
  }
);

export default googleStrategy;
