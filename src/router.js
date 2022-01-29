import express from "express";
import passport from "passport";
import {
  login,
  register,
  getMessages,
  getAllMessagedUsers,
  updateEmail,
  updatePassword,
} from "./controllers/userControllers.js";
import { insertMessage } from "./utils/socket.io.js";
// import { insertUser } from "./test/controllers.js";
import {
  currentUserProfile,
  updateSettings,
  updatePersonalData,
  addFriend,
  blockFriend,
  sentRequest,
  receivedRequest,
  removeFriend,
  removeBlock,
} from "./controllers/profileControllers.js";

const router = express.Router();

// welcome route
router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));

// Auth Routes
router.post("/auth/register", register);

router.post("/auth/login", login);

router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "email",
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/plus.profile.emails.read",
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

router.get("/get-messages", getMessages);
router.post("/user/get-all-users", getAllMessagedUsers);

// only for testing
router.post("/user/add-message", async (req, res, next) => {
  try {
    const message = {
      sender: req.body.sender,
      receiver: req.body.receiver,
      text: req.body.text,
      createdAt: req.body.createdAt,
    };
    const messages = await insertMessage(message);
    res.send(messages);
  } catch (error) {
    next(error);
  }
});

router.get("/user/profile/:id", currentUserProfile);
router.post("/user/profile/:id", updateSettings);
router.post("/user/profile/Personal/:id", updatePersonalData);
router.post("/user/update/email/:id", updateEmail);
router.post("/user/update/password/:id", updatePassword);
router.post("/user/add/friend/:id", addFriend);
router.post("/user/add/friend/:id", blockFriend);
router.post("/user/add/block/:id", blockFriend);
router.post("/user/add/sent-request/:id", sentRequest);
router.post("/user/add/received-Request/:id", receivedRequest);
router.post("/user/remove/friend/:id", removeFriend);
router.post("/user/remove/block/:id", removeBlock);

// router.post("/test/add-many", insertUser);

export default router;
