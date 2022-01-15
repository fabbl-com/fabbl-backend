import passportLocal from "passport-local";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";

const LocalStrategy = passportLocal.Strategy;

export const localRegisterStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passReqToCallback: true,
  },
  (req, email, password, next) => {
    const { uuid, displayName, avatar } = req.body;
    User.findOne({ email }, (err, user) => {
      if (err) return next(new ErrorMessage(err, 400));
      console.log(user);
      if (user) return next(new ErrorMessage("Email already exists", 400));

      const newUser = new User({
        uuid,
        displayName: { value: displayName },
        email,
        // avatar: { value: avatar },
        password,
      });
      newUser.save((error) => {
        if (error) return next(new ErrorMessage(error, 400));
      });

      next(null, newUser);
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
      if (!user)
        return next(new ErrorMessage("Email or password is incorrect", 401));

      user.comparePassword(password, (err, isMatched) => {
        if (err) return next(err);
        if (!isMatched)
          return next(null, false, {
            message: "Email or password is incorrect",
          });
      });

      next(null, user);
    });
  }
);
