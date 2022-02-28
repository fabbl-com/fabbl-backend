import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import { check } from "express-validator";
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
} from "./controllers/userControllers.js";
// import { insertMessage } from "./utils/socket.io.js";
// import { insertUser } from "./test/controllers.js";
// import { makeMessageSeen } from "./test/controllers.js";
import { isAuth, sendVerificationMail } from "./middlewares/auth.js";

import {
  currentUserProfile,
  updateSettings,
  updatePersonalData,
  imageUpload,
} from "./controllers/profileControllers.js";
import Message from "./models/messageModel.js";
import { deleteMessage } from "./controllers/messageControllers.js";

const router = express.Router();

// welcome route
router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));

// Auth Routes
router.post(
  "/auth/register",
  check("email", "enter valid email").isEmail(),
  check("password", "password is require").exists(),
  register,
  sendVerificationMail
);

router.post("/auth/login", login);

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
// router.post("/read", async (req, res) => {
//   try {
//     const result = await Message.updateMany(
//       {
//         _id: mongoose.Types.ObjectId("620d6d560fe08325a32c8b08"),
//       },
//       { $set: { "messages.$[elem].isRead": true } },
//       {
//         arrayFilters: [
//           {
//             "elem.createdAt": {
//               $lte: new Date("2022-02-17T09:51:14.924+00:00"),
//             },
//           },
//         ],
//         upsert: true,
//       }
//       // { new: true, upsert: true }
//     );
//     res.send(result);
//   } catch (err) {
//     console.log(err);
//   }
// });
// router.post("/user/add-message", async (req, res, next) => {
//   try {
//     const message = {
//       sender: req.body.sender,
//       receiver: req.body.receiver,
//       text: req.body.text,
//       createdAt: req.body.createdAt,
//     };
//     const messages = await insertMessage(message);
//     res.send(messages);
//   } catch (error) {
//     next(error);
//   }
// });

router.post(
  "/user/send-reset-password-email",
  check("email", "enter valid email").isEmail(),
  sendResetPasswordMail
);
router.get("/user/send-verify-email/:id", isAuth, sendVerificationMail);
router.post(
  "/user/send-update-email/:id",
  check("email", "enter valid email").isEmail(),
  isAuth,
  sendUpdateEmail
);
router.get("/user/verify-email/:token", isAuth, verifyEmail);
router.get("/user/profile/:id", isAuth, currentUserProfile);
router.post("/user/profile/:id", isAuth, updateSettings);
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
