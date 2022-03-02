import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// project imports
import configureExpress from "./config/appConfig.js";
import connectSocket from "./config/socketConfig.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

configureExpress(app);
connectSocket(io);

// Run the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

server.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  server.close(() => server.exit(1));
});
