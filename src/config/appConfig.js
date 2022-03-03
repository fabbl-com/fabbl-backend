import express from "express";
import compression from "compression";
import cors from "cors";
import logger from "morgan";
import fileUpload from "express-fileupload";
import passport from "passport";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// project imports
import configurePassport from "../controllers/passport/index.js";
import router from "../router.js";
import handleError from "../middlewares/error.js";

const whitelist = process.env.WHITELISTED_DOMAINS
  ? process.env.WHITELISTED_DOMAINS.split(",")
  : [];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  credentials: true,
};

const configureExpress = (app) => {
  const url = process.env.DB_URL;
  const connect = mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connect
    .then((db) => {
      console.log("connected to db");
    })
    .catch((err) => {
      console.log(err);
    });

  app.use(logger("dev"));
  app.use(compression());
  app.use(fileUpload({ useTempFiles: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(express.static("public"));
  app.use(cors(corsOptions));
  app.use(passport.initialize());
  // app.use(passport.session());
  app.use("/", router);
  app.use(handleError);

  configurePassport(passport);
};

export default configureExpress;
