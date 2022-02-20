import express from "express";
import dotenv from "dotenv";
import http from "http";
import fileupload from "express-fileupload";
import Session from "express-session";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";
import mongoose from "mongoose";
import handleError from "./middlewares/error.js";
import configureExpress from "./config/appConfig.js";
import router from "./router.js";
import connectSocket from "./socket.io.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const DB_URL = process.env.DB_URL || "mongodb://localhost/fabblDB";
const clientP = mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((m) => m.connection.getClient());

const session = Session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  key: "SID",
  store: MongoStore.create({
    clientPromise: clientP,
    dbName: "fabblDB",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === "production",
  },
});

configureExpress(app, session);
connectSocket(io, session);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(fileupload({ useTempFiles: true }));
// Routes
app.use("/", router);
app.use(handleError);

// Run the server
let PORT;
if (process.env.NODE_ENV === "production") PORT = process.env.PORT;
else PORT = process.env.DEV_PORT;

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

server.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  server.close(() => server.exit(1));
});
