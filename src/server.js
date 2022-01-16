import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import handleError from "./middlewares/error.js";
import configureExpress from "./config/appConfig.js";
import router from "./router.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket app

io.on("connection", (socket) => {
  // Welcome current user
  console.log("connected");

  // Run when client disconnects
  socket.on("disconnect", () => {
    io.emit("message", "disconnected");
  });
});

configureExpress(app);

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

server.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err}`);
  server.close(() => server.exit(1));
});
