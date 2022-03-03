import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

// project imports
import configureExpress from "./config/appConfig.js";
import connectSocket from "./config/socketConfig.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const { DB_URL, PORT = 4000 } = process.env;

connectDB(DB_URL);
configureExpress(app);
connectSocket(io);

// Run the server
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

server.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  server.close(() => server.exit(1));
});
