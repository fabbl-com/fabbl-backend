import express from "express";
import passport from "passport";
import { check } from "express-validator";

// project imports
import {
  login,
  register,
  sendUpdateEmail,
  updatePassword,
  verifyEmail,
  sendResetPasswordMail,
  getUserProfile,
  changePassword,
  logout,
  deleteAccount,
  updateRefreshToken,
  googleLogin,
} from "./controllers/userControllers.js";
// import { insertUser } from "./test/controllers.js";
import { isAuth, sendVerificationMail } from "./middlewares/auth.js";
import {
  currentUserProfile,
  updateSettings,
  updatePersonalData,
  imageUpload,
  setGender,
} from "./controllers/profileControllers.js";
import { deleteMessage } from "./controllers/messageControllers.js";
import keys from "./config/keys.js";

const { CLIENT_URL } = process.env;

const router = express.Router();

// welcome route
router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));

// Auth Routes
router.post(
  "/auth/register",
  check("email", "enter valid email").isEmail(),
  check("password", "password is require").exists(),
  register
);

router.post("/auth/login", login);
router.post("/auth/refreshToken", updateRefreshToken);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: keys.google.scope })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  googleLogin
);

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook"),
  (req, res) => {
    res.redirect(`${CLIENT_URL}?userId=${req.user}`);
  }
);

router.post("/auth/check", isAuth, getUserProfile);
router.post("/auth/logout", isAuth, logout);

// only for testing
// router.post("/add-users", insertUser);

router.post(
  "/user/send-reset-password-email",
  check("email", "enter valid email").isEmail(),
  sendResetPasswordMail
);
router.get("/user/send-verify-email/:id", sendVerificationMail);
router.post(
  "/user/send-update-email/:id",
  check("email", "enter valid email").isEmail(),
  isAuth,
  sendUpdateEmail
);
router.get("/user/verify-email/:token", isAuth, verifyEmail);

// profile routes
router.get("/user/profile/:id", isAuth, currentUserProfile);
router.post("/user/profile/:id", isAuth, updateSettings);
router.delete("/user/delete/:id", isAuth, deleteAccount);
router.post(
  "/user/profile/personal/:id",
  check("hobbiesData", "hobbies required").not().isEmpty(),
  check("usernameData", "userName require").not().isEmpty(),
  // check("genderData", "Gender require").not().isEmpty(),
  check("relationshipStatusData", "RelationshipStatus require").not().isEmpty(),
  check("bioData", "Bio require").not().isEmpty(),
  isAuth,
  updatePersonalData
);
router.post(
  "/user/update-password/:id",
  check("oldPassword", "password is require").exists(),
  check("newPassword", "password is require").exists(),
  isAuth,
  updatePassword
);
router.post("/user/change-password", changePassword);

router.post("/user/upload/image/:id", imageUpload);

router.delete("/delete-message/:id", deleteMessage);

router.post("/user/verify-gender", isAuth, setGender);

export default router;
