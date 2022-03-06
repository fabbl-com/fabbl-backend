import passportLocal from "passport-local";
import gravatar from "gravatar";
import User from "../../models/userModel.js";
import ErrorMessage from "../../utils/errorMessage.js";
import { getTokens } from "../../utils/jwt.js";

const LocalStrategy = passportLocal.Strategy;

export const localRegisterStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
  },
  (req, email, password, next) => {
    const { displayName } = req.body;
    User.findOne({ email }, (err, oldUser) => {
      if (err) return next(err);
      if (oldUser) return next(new ErrorMessage("Already Registered", 401));

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
      const { accessToken, refreshToken } = getTokens({
        _id: newUser._id,
        rememberMe: req.body?.rememberMe || false,
      });
      console.log(req.body, accessToken, refreshToken);
      newUser.refreshToken.push({ refreshToken });
      newUser.save((err, user) => {
        if (err) return next(err);
        next(null, { _id: user.id, email }, { accessToken, refreshToken });
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
      if (err) return next(err);
      if (!user) return next(new ErrorMessage("Invalid Credentials", 401));

      user.comparePassword(password, (err, isMatched) => {
        if (err || !isMatched)
          return next(new ErrorMessage("Invalid Credentials", 401));
        const { accessToken, refreshToken } = getTokens({
          _id: user._id,
          rememberMe: req.body.rememberMe || false,
        });

        console.log(refreshToken, "1");

        User.findByIdAndUpdate(
          user._id,
          {
            $push: {
              refreshToken: { refreshToken },
            },
          },
          (err, user) => {
            if (err) return next(err);
            req.user = { id: user._id };
            next(null, { id: user._id }, { accessToken, refreshToken });
          }
        );
      });
    });
  }
);
