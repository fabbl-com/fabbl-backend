import express from "express";
import compression from "compression";
import cors from "cors";
import csurf from "csurf";
import logger from "morgan";
import passport from "../controllers/passport/index.js";

const configureExpress = (app, session) => {
  app.use(compression());
  app.use(cors());
  app.use(express.json());
  app.use(express.static("public"));
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(logger("dev"));

  app.use(session);
  passport.initialize();
  passport.session();

  // CSRF security for Production
  if (process.env.NODE_ENV === "production") {
    app.use(csurf());
    app.use((req, res, next) => {
      res.set("x-frame-options", "DENY");
      res.cookie("mytoken", req.csrfToken());
      next();
    });
  }
};

export default configureExpress;
