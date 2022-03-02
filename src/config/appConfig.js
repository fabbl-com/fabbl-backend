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

const allowlist = [
  "localhost",
  "127.0.0.1",
  "http://locahost:3000",
  "http://127.0.0.1:3000",
];
const options = (req, cb) => {
  let corsOptions;
  if (allowlist.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  cb(null, corsOptions);
};

const configureExpress = (app) => {
  app.use(logger("dev"));
  app.use(compression());
  app.use(fileUpload({ useTempFiles: true }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
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
  app.use((req, res, next) => {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
  });
  app.use("/", router);
  app.use(handleError);

  configurePassport(passport);
};

export default configureExpress;
