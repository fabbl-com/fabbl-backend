import passport from "passport";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";

export const register = (req, res, next) => {
  passport.authenticate("local.register", (err, user, info) => {
    console.log(err, user, info);
    if (err) return next(err);
    if (info && !info.success) return res.status(401).json(info);
    req.login(user, (err) => {
      if (err) return next(err);
      next();
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
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({
        success: true,
        userId: user,
      });
    });
  })(req, res, next);
};

// @route     post /user/update/email/:id
// desc         Update user email
// @access  private

export const updateEmail = async (req, res) => {
  const userId = req.params.id;
  const email = req.body;
  try {
    const profile = await User.findByIdAndUpdate(
      userId,
      {
        $set: email,
      },
      {
        new: true,
        upsert: true,
      }
    );
    res.status(200).json({
      success: true,
      profile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};

export const verifyEmail = (req, res, next) => {
  const { token } = req.params;
  jwt.verify(
    token,
    process.env.EMAIL_VERIFICATION_TOKEN_SECERT,
    (err, newUser) => {
      if (err) return next(new ErrorMessage(err.message, 401));
      User.findByIdAndUpdate(
        newUser.userId,
        { $set: { isEmailVerified: true } },
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
export const updatePassword = async (req, res) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;
  try {
    //  see if user exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "invalid credentials",
          },
        ],
      });
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (isMatch) {
      const profile = await User.findByIdAndUpdate(
        userId,
        {
          $set: newPassword,
        },
        {
          new: true,
        }
      );
      res.status(200).json({
        success: true,
        profile,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
};
