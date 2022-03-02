import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DB_URL || "mongodb://localhost/fabblDB";

const sessionMiddleware = session({
  secret: process.env.SECRET,
  resave: false,
  key: "connect.sid",
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: mongoose
      .connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((m) => m.connection.getClient()),
    dbName: "fabblDB",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === "production",
  },
});

export default sessionMiddleware;
