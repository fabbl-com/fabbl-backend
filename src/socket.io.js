import {
  getMessages,
  sendMessage,
  disconnect,
  addSocketId,
} from "./utils/socket.io.js";

const connectSocket = (io) => {
  io.use(async (socket, next) => {
    console.log(socket.request._query.userId);
    try {
      await addSocketId({
        userId: socket.request._query.userId,
        socketID: socket.id,
      });
      next();
    } catch (error) {
      console.error(error);
    }
  });

  io.on("connection", (socket) => {
    console.log("connected");

    socket.on("get-messages", () => getMessages(io));
    socket.on("send-message", (message) => sendMessage(io, message));
    socket.on("disconnect", () => disconnect(socket.id));
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  });
};

export default connectSocket;
