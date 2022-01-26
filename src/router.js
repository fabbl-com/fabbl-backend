import express from "express";
import passport from "passport";
import { login, register } from "./controllers/userControllers.js";
import {currentUserProfile,addUserProfile} from "./controllers/profileControllers"
const router = express.Router();

// welcome route
router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));

// Auth Routes
router.post(
  "/auth/register",
  passport.authenticate("local.register"),
  register
);

router.post("/auth/login", passport.authenticate("local.login"), login);

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

router.get("/auth/google/callback", passport.authenticate("google"), login);

router.get("/auth/facebook", passport.authenticate("facebook"));

router.get("/auth/facebook/callback", passport.authenticate("facebook"), login);

router.get('/user/profile/:id', async (req, res) => {
  req.isAuthenticated;
  currentUserProfile
});

router.post('/user/profile/:id', async (req, res) => {
  req.isAuthenticated;
  updateUserProfile
});

export default router;
