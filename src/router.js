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
import {
  currentUserProfile,
  updateSettings,
  updatePersonalData,
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

router.get("/user/profile/:id", async (req, res) => {
  const userId = req.params.id;
  currentUserProfile(req, res, userId);
});

router.post("/user/profile/:id", async (req, res) => {
  const userId = req.params.id;
  updateSettings(req, res, userId);
});
router.post("/user/profile/Personal/:id", async (req, res) => {
  const userId = req.params.id;
  updatePersonalData(req, res, userId);
});

router.post("/user/update/email/:id", async (req, res) => {
  const userId = req.params.id;
  updateEmail(req, res, userId);
});

router.post("/user/update/password/:id", async (req, res) => {
  const userId = req.params.id;
  updatePassword(req, res, userId);
});

export default router;
