import express from "express";
import passport from "passport";
import mongoose from "mongoose";
import {
  login,
  register,
  sendUpdateEmail,
  updatePassword,
  verifyEmail,
  sendResetPasswordMail,
  getUserProfile,
  changePassword,
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

const router = express.Router();

// welcome route
router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));

// Auth Routes
router.post("/auth/register", register, sendVerificationMail);

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

router.get("/auth/check", isAuth, getUserProfile);

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

router.post("/user/send-reset-password-email", sendResetPasswordMail);
router.get("/user/send-verify-email/:id", isAuth, sendVerificationMail);
router.post("/user/send-update-email/:id", isAuth, sendUpdateEmail);
router.get("/user/verify-email/:token", isAuth, verifyEmail);
router.get("/user/profile/:id", isAuth, currentUserProfile);
router.post("/user/profile/:id", isAuth, updateSettings);
router.post("/user/profile/personal/:id", isAuth, updatePersonalData);
router.post("/user/update-password/:id", isAuth, updatePassword);
router.post("/user/change-password", changePassword);

router.post("/user/upload/image/:id", imageUpload);

export default router;
