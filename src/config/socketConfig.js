import {
  addFriendsListener,
  blockListener,
  getChatListListener,
  confirmFriendRequestListener,
  declineFriendRequestLister,
  disconnectListener,
  getRandomUsersListener,
  getUserMessagesListener,
  likeListner,
  readAllListener,
  readListener,
  reloadListener,
  sendMessageListener,
  unblockListener,
  viewListener,
} from "../socket/socketListeners.js";
import { initializeSocket } from "../middlewares/socket.js";
// import sessionMiddleware from "../middlewares/session.js";

const connectSocket = (io) => {
  io.use(initializeSocket);

  io.on("connect", async (socket) => {
    try {
      // connection logger
      const { userId } = await socket.request._query;
      console.info(`⚡︎ New connection: ${userId}`);
      socket.broadcast.emit("connection-response", {
        connected: true,
        userId,
        lastLogin: new Date(),
      });

      // find user listeners

      socket.on("get-random-users", ({ userId, page, limit, choices }) =>
        getRandomUsersListener(socket, io, { userId, page, limit, choices })
      );
      socket.on("like", ({ senderId, receiverId }) =>
        likeListner(socket, io, { senderId, receiverId })
      );
      socket.on("view", ({ senderId, receiverId }) =>
        viewListener({ senderId, receiverId })
      );
      socket.on("reload", ({ senderId, receiverId }) =>
        reloadListener(socket, io, { senderId, receiverId })
      );

      // chat listeners

      socket.on("get-chat-list", (userId) =>
        getChatListListener(socket, io, userId)
      );
      socket.on("get-user-messages", ({ sender, receiver, size, page }) =>
        getUserMessagesListener(socket, io, { sender, receiver, size, page })
      );
      socket.on("send-message", (message) =>
        sendMessageListener(socket, io, message)
      );
      socket.on("read", ({ _id, createdAt, sender }) =>
        readListener(socket, io, { _id, createdAt, sender })
      );
      socket.on("add-friends", ({ sender, receiver }) =>
        addFriendsListener(socket, io, { sender, receiver })
      );
      socket.on("block", ({ sender, receiver }) =>
        blockListener(socket, io, { sender, receiver })
      );
      socket.on("unblock", ({ sender, receiver }) =>
        unblockListener(socket, io, { sender, receiver })
      );

      // notification listeners

      socket.on(
        "confirm-friends-request",
        ({ sender, receiver, notificationId }) =>
          confirmFriendRequestListener(socket, io, {
            sender,
            receiver,
            notificationId,
          })
      );
      socket.on(
        "decline-friends-request",
        ({ sender, receiver, notificationId }) =>
          declineFriendRequestLister(socket, io, {
            sender,
            receiver,
            notificationId,
          })
      );
      socket.on("read-all", (userId) =>
        readAllListener(socket, io, { userId })
      );

      socket.on("disconnect", () => disconnectListener(socket));
    } catch (error) {
      console.log(error);
      socket.disconnect(true);
    }
  });
};

export default connectSocket;
