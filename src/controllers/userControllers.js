import passport from "passport";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";
import sendMail from "../utils/sendMail.js";
import {
  deleteUser,
  getNotifications,
  getProfile,
  removeFromArray,
  updateKeys,
} from "./helpers/index.js";
import {
  DELETE_FROM_FRIENDS,
  DELETE_FROM_LIKE_RECEIVED,
  DELETE_FROM_LIKE_SENT,
  DELETE_FROM_MATCHES,
} from "../constants/index.js";

export const register = (req, res, next) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  passport.authenticate("local.register", (err, user, info) => {
    console.log(err, user, info);
    if (err) return next(err);
    if (info && !info.success) return res.status(401).json(info);
    req.login(user, async (err) => {
      if (err) return next(err);
      const [notifications, profile] = await Promise.all([
        getNotifications(user),
        getProfile(user),
      ]);
      return res.status(200).json({ success: true, notifications, profile });
    });
  })(req, res, next);
};

export const login = (req, res, next) => {
  passport.authenticate("local.login", (err, user, info) => {
    console.log(user);
    if (err) return next(err);
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    req.login(user, async (err) => {
      if (err) return next(err);
      if (req.body.rememberMe) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      }
      const [notifications, profile] = await Promise.all([
        getNotifications(user),
        getProfile(user),
      ]);
      return res.status(200).json({ success: true, notifications, profile });
    });
  })(req, res, next);
};

export const sendResetPasswordMail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log("users", req.user);
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select("_id");

    if (!user)
      return res
        .status(200)
        .json({ success: true, message: "Password reset email sent" });

    jwt.sign(
      { userId: user._id, email },
      process.env.EMAIL_VERIFICATION_TOKEN_SECERT,
      { expiresIn: "30d" },
      async (err, passwordResetToken) => {
        console.log(err, passwordResetToken);
        if (err) return next(err);

        const URL = `${process.env.CLIENT_URL}/user/reset-password/?token=${passwordResetToken}`;
        console.log(URL);
        try {
          const result = await sendMail(email, URL, "reset");
          if (!result)
            return next(
              new ErrorMessage(
                "Cannot send password reset mail. Please try again later",
                400
              )
            );

          res.status(200).json({
            success: true,
            userId: user._id,
            message: "Password reset email sent",
          });
        } catch (error) {
          console.log(error);
          next(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// @route     post /user/update/email/:id
// desc         Update user email
// @access  private

export const sendUpdateEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.params.id;
  const { email } = req.body;

  try {
    const user = await User.findOne({ email }).select("_id");
    if (user)
      return next(new ErrorMessage("Email is already registered...", 403));
    jwt.sign(
      { userId, email },
      process.env.EMAIL_VERIFICATION_TOKEN_SECERT,
      { expiresIn: "30d" },
      async (err, passwordResetToken) => {
        console.log(err, passwordResetToken);
        if (err) return next(new ErrorMessage(err.message, 401));

        try {
          const URL = `${process.env.CLIENT_URL}/user/verify-email/?token=${passwordResetToken}`;

          const result = await sendMail(email, URL, "activate");
          if (!result)
            return next(
              new ErrorMessage(
                "Cannot send verification mail. Please try again later",
                403
              )
            );
          res.status(200).json({
            success: true,
            message: "Please verify your email...",
          });
        } catch (error) {
          console.log(error);
          next(error);
        }
      }
    );
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const verifyEmail = (req, res, next) => {
  const { token } = req.params;
  jwt.verify(
    token,
    process.env.EMAIL_VERIFICATION_TOKEN_SECERT,
    (err, newUser) => {
      console.log(newUser);
      if (err) return next(new ErrorMessage(err.message, 401));
      User.findByIdAndUpdate(
        newUser.userId,
        { $set: { email: newUser.email, isEmailVerified: true } },
        (err) => {
          if (err) return next(err);
          res.status(200).json({
            success: true,
            userId: newUser.userId,
          });
        }
      );
    }
  );
};

// @route     post /user/update/password/:id
// desc         Update user password
// @access  private
export const updatePassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;

  console.log(userId, oldPassword, newPassword);
  try {
    const user = await User.findById(userId);
    if (!user) return next(new ErrorMessage("User not found", 401));

    if (oldPassword) {
      user.comparePassword(oldPassword, async (err, isMatched) => {
        if (err) return next(err);
        if (!isMatched)
          return next(new ErrorMessage("Incorrect credentails", 401));
      });
    }

    user.password = newPassword;
    user.save((err, doc) => {
      if (err) return next(err);
      return res.status(200).json({ success: true });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const getUserProfile = async (req, res, next) => {
  const userId = req.session.user.id;
  const publicKey = req.body?.publicKey;
  const privateKey = req.body?.privateKey;
  try {
    const [notifications, profile, isKeysUpdated] = await Promise.all([
      getNotifications(userId),
      getProfile(userId),
      updateKeys({ userId, publicKey, privateKey }),
    ]);
    return res
      .status(200)
      .json({ success: true, notifications, profile, isKeysUpdated });
  } catch (error) {
    return next(error);
  }
};

// @route     post /user/change/password
// desc         change user password
// @access  private
export const changePassword = async (req, res, next) => {
  const { token, newPassword } = req.body;
  // console.log(token, newPassword);
  if (!token) {
    return next(new ErrorMessage("Incorrect credentails", 401));
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.EMAIL_VERIFICATION_TOKEN_SECERT
    );
    const { userId, email } = decoded;
    const user = await User.findById(userId);
    if (!user) {
      // console.log("no token");
      return next(new ErrorMessage("User not found", 401));
    }
    user.password = newPassword;
    user.save((err, doc) => {
      if (err) return next(err);
      return res.status(200).json({ success: true });
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    return res.status(200).json({ success: true, isLoggedOut: true });
  });
};

export const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Promise.all([
      deleteUser(id),
      removeFromArray({ id, type: DELETE_FROM_FRIENDS }),
      removeFromArray({ id, type: DELETE_FROM_MATCHES }),
      removeFromArray({ id, type: DELETE_FROM_LIKE_SENT }),
      removeFromArray({ id, type: DELETE_FROM_LIKE_RECEIVED }),
    ]);
    if (result[0] && result[1] && result[2] && result[3] && result[4])
      res
        .status(200)
        .json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};
