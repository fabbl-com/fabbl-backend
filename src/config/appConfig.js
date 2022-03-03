import express from "express";
import compression from "compression";
import cors from "cors";
import logger from "morgan";
import fileUpload from "express-fileupload";
import passport from "passport";
import cookieParser from "cookie-parser";

// project imports
import configurePassport from "../controllers/passport/index.js";
import router from "../router.js";
import handleError from "../middlewares/error.js";
import ErrorMessage from "../utils/errorMessage.js";

const configureExpress = (app) => {
  const whitelist = process.env.WHITELISTED_DOMAINS
    ? process.env.WHITELISTED_DOMAINS.split(",")
    : [];

  const corsOptions = {
    origin(origin, cb) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        cb(null, true);
      } else {
        cb(new ErrorMessage("Not allowed by CORS", 500));
      }
    },
    credentials: true,
  };

  app.use(logger("dev"));
  app.use(compression());
  app.use(cors(corsOptions));
  app.use(fileUpload({ useTempFiles: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(express.static("public"));
  app.use(passport.initialize());
  app.use("/", router);
  app.use(handleError);

  configurePassport(passport);
};

export default configureExpress;
