import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";
import sendMail from "../utils/sendMail.js";

export const sendVerificationMail = async (req, res, next) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(req.user || userId).select(
      "email isEmailVerified"
    );

    if (!user) return next(new ErrorMessage("Register first", 400));

    jwt.sign(
      { userId: user._id },
      process.env.EMAIL_VERIFICATION_TOKEN_SECERT,
      // { algorithm: "RS256" },
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
  if (req.isAuthenticated()) return next();
  return next(new ErrorMessage("Access denied...", 401));
};
