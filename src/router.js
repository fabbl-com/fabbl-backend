import express from "express";
import passport from "passport";
import { login, register, googleLogin } from "./controllers/userControllers.js";

const router = express.Router();

// welcome route

router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));
router.get("/login", (req, res) => res.send("<h1>Hello </h1>"));

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
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
  }),
  googleLogin
);

export default router;
