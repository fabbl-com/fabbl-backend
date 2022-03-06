import jwt from "jsonwebtoken";
import passport from "passport";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";
import sendMail from "../utils/sendMail.js";
import { COOKIE_OPTIONS, getTokens } from "../utils/jwt.js";

export const sendVerificationMail = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("email isEmailVerified");
    console.log(user);
    if (!user) return next(new ErrorMessage("Register first", 400));

    jwt.sign(
      { userId: user._id },
      process.env.EMAIL_VERIFICATION_TOKEN_SECERT,
      { expiresIn: "30d" },
      async (err, emailVerificationToken) => {
        if (err) return next(err);

        const activationURL = `${process.env.CLIENT_URL}/user/verify-email/?token=${emailVerificationToken}`;

        if (user.isEmailVerified)
          return next(new ErrorMessage("Already Verified", 400));

        try {
          const result = await sendMail(user.email, activationURL, "activate");
          if (!result)
            return next(
              new ErrorMessage(
                "Cannot send verification mail. Please try again later",
                400
              )
            );

          res.status(200).json({
            success: true,
            userId: user._id,
            message: "Register Success! Please activate your email to start.",
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

export const isAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, async (err, user) => {
    if (err) return next(err);
    if (!user) return next(new ErrorMessage("Unauthorized", 401));

    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    const { accessToken, refreshToken: newRefreshToken } = getTokens({
      _id: user.id,
      rememberMe: false,
    });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, payload) => {
        if (err) return next(new ErrorMessage("Unauthorized", 401));

        if (!payload) {
          await User.findByIdAndUpdate(req.user.id, {
            $pull: { refreshToken: { refreshToken } },
          });
          return next(new ErrorMessage("Unauthorized", 401));
        }
        try {
          const result = await User.updateOne(
            {
              _id: mongoose.Types.ObjectId(user._id),
              "refreshToken.refreshToken": refreshToken,
            },
            { $set: { "refreshToken.$.refreshToken": newRefreshToken } }
          );
          if (!result.matchedCount || !result.acknowledged)
            return next(new ErrorMessage("Unauthorized", 401));
          req.user = {
            id: user.id,
            email: user.email,
            accessToken,
            oldRefreshToken: refreshToken,
            newRefreshToken,
          };
          res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
          next();
        } catch (err) {
          console.log(err);
          return next(new ErrorMessage("Unauthorized", 401));
        }
      }
    );
  })(req, res, next);
};
