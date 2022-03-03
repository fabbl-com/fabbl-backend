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
} from "./controllers/userControllers.js";
// import { insertUser } from "./test/controllers.js";
import { isAuth, sendVerificationMail } from "./middlewares/auth.js";
import {
  currentUserProfile,
  updateSettings,
  updatePersonalData,
  imageUpload,
} from "./controllers/profileControllers.js";
import { deleteMessage } from "./controllers/messageControllers.js";

const router = express.Router();

// welcome route
router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));

// Auth Routes
router.post(
  "/auth/register",
  // check("email", "enter valid email").isEmail(),
  // check("password", "password is require").exists(),
  register,
  sendVerificationMail
);

router.post("/auth/login", login);
router.post("/auth/refreshToken", updateRefreshToken);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect(`http://localhost:3000?userId=${req.user}`);
  }
);

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook"),
  (req, res) => {
    res.redirect(`http://localhost:3000?userId=${req.user}`);
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

export default router;
