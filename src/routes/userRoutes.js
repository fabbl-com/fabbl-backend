import express from "express";
import passport from "passport";
import { login, register } from "../controllers/userControllers.js";

const router = express.Router();

router.post("/register", passport.authenticate("local.register"), register);
router.post("/login", passport.authenticate("local.login"), login);

export default router;
