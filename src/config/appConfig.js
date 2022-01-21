import express from "express";
import compression from "compression";
import cors from "cors";
import csurf from "csurf";
import logger from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "../controllers/passport/index.js";

const configureExpress = (app) => {
  const clientP = mongoose
    .connect("mongodb://localhost/fabbleDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((m) => m.connection.getClient());

  mongoose.connection.on(
    "error",
    console.error.bind(console, "____mongoDB connection error____")
  );

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

  app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        clientPromise: clientP,
        dbName: "fabbleDB",
      }),
    })
  );
  // app.use(passport.initialize());
  // app.use(passport.session());

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
