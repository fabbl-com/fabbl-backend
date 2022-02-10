import {
  addSocketID,
  getUserInfo,
  getChatList,
  insertMessage,
  exitChat,
  getMessages,
  getRandomUsers,
  like,
  getLikes,
} from "./utils/socket.io.js";

const connectSocket = (io) => {
  io.use(async (socket, next) => {
    const { userId } = await socket.request._query;
    console.log(userId);
    try {
      await addSocketID({
        userId: socket.request._query.userId,
        socketID: socket.id,
      });
      next();
    } catch (error) {
      console.error(error);
      next(error);
    }
  });
  io.on("connection", (socket) => {
    console.log("connected");

    socket.on("send-message", async (message) => {
      console.log(message);
      if (!message.text) {
        io.to(socket.id).emit("send-message-response", {
          success: false,
          message: "Cannot send empty message",
        });
      } else if (!message.sender) {
        io.to(socket.id).emit("send-message-response", {
          success: false,
          message: "Sender required",
        });
      } else if (!message.receiver) {
        io.to(socket.id).emit("send-message-response", {
          success: false,
          message: "receiver required",
        });
      } else {
        try {
          const [receiverSocketID, _] = await Promise.all([
            getUserInfo({ userId: message.receiver, socketID: true }),
            insertMessage(message),
          ]);
          console.log(receiverSocketID);
          io.to(receiverSocketID).emit("send-message-response", message);
        } catch (error) {
          console.log(error);
          io.to(socket.id).emit("send-message-response", {
            success: false,
            message: "Could not store messages, server error.",
          });
        }
      }
    });

    socket.on("exit-chat", async ({ userId }) => {
      try {
        await exitChat(userId);
        io.to(socket.id).emit("exit-chat-response", {
          success: true,
          message: "Logged out!",
          userId,
        });
        socket.broadcast.emit("exit-chat-response", {
          success: true,
          isDisconnected: true,
          userId,
        });
      } catch (error) {
        io.to(socket.id).emit("exit-chat-response", {
          success: false,
          message: "Something bad happened",
          userId,
        });
      }
    });

    socket.on("get-user-messages", async ({ sender, receiver }) => {
      console.log(sender, receiver);
      try {
        const messages = await getMessages(sender, receiver);
        io.to(socket.id).emit("get-user-messages-response", {
          success: true,
          messages,
        });
        // console.log(messages);
      } catch (error) {
        io.to(socket.id).emit("get-user-messages-response", {
          success: false,
          messages: [],
        });
      }
    });

    socket.on("chat-list", async (userId) => {
      console.log(userId);
      try {
        const messages = await getChatList(userId);
        console.log(messages);
        io.to(socket.id).emit("chat-list-response", {
          success: true,
          messages,
        });
      } catch (error) {
        io.to(socket.id).emit("chat-list-response", {
          success: false,
          message: null,
          error: "Cannot list users",
        });
      }
    });

    socket.on("get-random-users", async ({ userId, page, limit, choices }) => {
      try {
        const user = await getUserInfo({ userId, socketID: false });
        console.log(user.viewed);
        const baseUser = {
          viewed: user.viewed,
          dob: new Date(user.dob.value).getTime(),
          hobby: user.hobby.value,
          gender: user.gender.value === "male" ? "female" : "male",
        };
        const users = await getRandomUsers(
          userId,
          page,
          limit,
          choices,
          baseUser
        );
        io.to(socket.id).emit("get-random-users-response", {
          success: true,
          users: users[0].data,
        });
      } catch (error) {
        io.to(socket.id).emit("get-random-users-response", {
          success: false,
          users: [],
          error: error.message || "Cannot fetch users",
        });
      }
    });

    socket.on("like", async ({ senderId, receiverId }) => {
      try {
        const [result1, result2, likes, socketID] = await Promise.all([
          like({ sent: true, senderId, receiverId }),
          like({ sent: false, senderId, receiverId }),
          getLikes({ userId: receiverId }),
          getUserInfo({ userId: receiverId, socketID: true }),
        ]);

        console.log(result1, result2, socketID, likes.interaction.received);
        io.to(socketID).emit("like-response", {
          success: true,
          likes: likes.interaction.received,
          isMatched: false,
        });
      } catch (error) {
        console.log(error);
        io.to(socket.id).emit("like-response", {
          success: false,
          users: [],
          message: error.message || "Cannot fetch users",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnected");
      socket.broadcast.emit("chat-list-response", {
        succes: true,
        isDisconnected: true,
        userId: socket.request._query.userId,
      });
    });
  });
};

export default connectSocket;
