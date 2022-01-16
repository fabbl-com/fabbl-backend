import passportFacebook from "passport-facebook";
import keys from "../config/keys.js";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";

const FacebookStrategy = passportFacebook.Strategy;

const facebookStrategy = new FacebookStrategy(
  {
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
    callbackURL: keys.facebook.callbackURL,
    profileFields: ["id", "email", "name"],
    passReqToCallback: true,
    proxy: true,
  },
  (req, accessToken, refreshToken, profile, next) => {
    User.findOne({ facebook: profile.id }, (err, user) => {
      if (err) return next(new ErrorMessage(err, 400));
      if (user) return next(null, user);

      console.log(profile);

      const newUser = new User({
        facebook: profile.id,
        displayName: { value: `${profile.first_name} ${profile.last_name}` },
        uuid: "12345", // to be genearted
        email: profile._json.email,
        // isEmailVerifed: profile._json.email_verified,
        avatar: `https://graph.facebook.com/${profile.id}/picture?type=large`,
      });

      newUser.fbTokens.push({ token: accessToken });

      newUser.save((err) => {
        if (err) return next(new ErrorMessage(err, 400));
        return next(null, newUser);
      });
    });
  }
);

export default facebookStrategy;
