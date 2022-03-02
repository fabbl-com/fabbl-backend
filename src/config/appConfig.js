import express from "express";
import compression from "compression";
import cors from "cors";
import logger from "morgan";
import fileUpload from "express-fileupload";
import passport from "passport";

// project imports
import configurePassport from "../controllers/passport/index.js";
import router from "../router.js";
import handleError from "../middlewares/error.js";
import sessionMiddleware from "../middlewares/session.js";

const whitelist = ["http://localhost:3000"];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    if (whitelist.includes(origin)) return callback(null, true);

    callback(new Error("Not allowed by CORS"));
  },
};

const configureExpress = (app) => {
  app.use(logger("dev"));
  app.use(compression());
  app.use(fileUpload({ useTempFiles: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.static("public"));
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(sessionMiddleware);
  app.use(passport.initialize());
  app.use(passport.session());
  app.use("/", router);
  app.use(handleError);

  configurePassport(passport);
};

export default configureExpress;
