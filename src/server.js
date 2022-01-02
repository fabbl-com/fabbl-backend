import express from "express";
import dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import csurf from "csurf";
import logger from "morgan";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import "./config/dbConnection.js";
import handleError from "./middlewares/error.js";
import indexRoutes from "./routes/indexRoutes.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

const BASE_DIR = path.resolve();

//Socket app

io.on("connection", (socket) => {
  // Welcome current user
  socket.emit("message", "connected");

  // Run when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "disconnected");
  });
});

// Middlewares
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(BASE_DIR, "public")));

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(logger("dev"));

// #CSRF security for Production
if (process.env.NODE_ENV === "production") {
  app.use(csurf());
  app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.cookie("mytoken", req.csrfToken());
    next();
  });
}

// Routes
app.use("/", indexRoutes);
app.use(handleError);

// Run the server
let PORT;
if (process.env.NODE_ENV === "production") PORT = process.env.PORT;
else PORT = process.env.DEV_PORT;

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

server.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err}`);
  server.close(() => server.exit(1));
});
