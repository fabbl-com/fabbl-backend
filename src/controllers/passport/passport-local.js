import passportLocal from "passport-local";
import passport from "passport";
import gravatar from "gravatar";
import User from "../../models/userModel.js";
import { getRefreshToken, getToken } from "../../../authenticate.js";
import ErrorMessage from "../../utils/errorMessage.js";

const LocalStrategy = passportLocal.Strategy;

export const localRegisterStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, email, password, next) => {
    const { displayName, avatar } = req.body;
    User.findOne({ email }, (err, oldUser) => {
      if (err) return next(err);
      if (oldUser) return next(new ErrorMessage("Already Registered", 400));

      const avatar = gravatar.url(
        email,
        { s: "100", r: "x", d: "retro" },
        true
      );

      const newUser = new User({
        displayName: { value: displayName },
        email,
        avatar: { value: avatar, status: 3 },
        password,
      });
      const accessToken = getToken({ _id: newUser._id });
      const refreshToken = getRefreshToken({ _id: newUser._id });
      console.log(req.body, accessToken, refreshToken);
      newUser.refreshToken.push({ refreshToken });
      newUser.save((err, user) => {
        if (err) return next(err);
        next(null, user.id, { accessToken, refreshToken });
      });
    });
  }
);

export const localLoginStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, email, password, next) => {
    User.findOne({ email }, (err, user) => {
      if (err || !user) return next(true);

      user.comparePassword(password, (err, isMatched) => {
        if (err || !isMatched) return next(true);
      });

      const accessToken = getToken({ _id: user._id });
      // handle remember me
      const refreshToken = getRefreshToken({ _id: user._id });
      console.log(user._id);
      User.findByIdAndUpdate(
        user._id,
        { $push: { refreshToken: { refreshToken } } },
        (err, user) => {
          if (err) return next(err);
          next(null, { id: user._id }, { accessToken, refreshToken });
        }
      );
    });
  }
);

// export const localRegisterStrategy = new LocalStrategy(
//   {
//     usernameField: "email",
//     passwordField: "password",
//   },
//   User.authenticate()
// );
