import express from "express";

const router = express.Router();

router.get("/", (req, res) => res.send("<h1>Hello from server</h1>"));
router.get("/login", (req, res) => res.send("<h1>Hello </h1>"));

export default router;
