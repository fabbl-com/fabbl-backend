import passportGoogle from "passport-google-oauth20";
import gravatar from "gravatar";
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
      if (user) {
        req.user = { id: user._id };
        return next(null, user._id);
      }
      // console.log(user.id);

      const avatar = gravatar.url(
        profile._json.email,
        { s: "100", r: "x", d: "retro" },
        true
      );

      User.findOneAndUpdate(
        { email: profile._json.email },
        {
          email: profile._json.email,
          google: profile.id,
          displayName: { value: profile.displayName, status: 3 },
          isEmailVerifed: profile._json.email_verified,
          avatar: { value: profile._json.picture || avatar, status: 3 },
        },
        { new: true, upsert: true },
        (err, user) => {
          if (err) return next(err);
          req.user = { id: user._id };
          return next(null, user._id);
        }
      );
    });
  }
);

export default googleStrategy;
