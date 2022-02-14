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
  getMatches,
  checkLike,
  match,
  setView,
  getReceiverInfo,
  changeUserOnline,
} from "./utils/socket.io.js";

const connectSocket = (io) => {
  io.use(async (socket, next) => {
    const { userId } = await socket.request._query;
    console.log(userId);
    try {
      const [res1, res2] = await Promise.all([
        changeUserOnline({
          userId,
          changeToOnline: true,
        }),
        addSocketID({
          userId: socket.request._query.userId,
          socketID: socket.id,
        }),
      ]);
      console.log(res1, res2, "resolved");
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
            getUserInfo({
              userId: message.receiver,
              socketID: true,
            }),
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
        const [messages, user] = await Promise.all([
          getMessages(sender, receiver),
          getReceiverInfo({
            senderId: sender,
            receiverId: receiver,
          }),
        ]);
        // console.log(messages, "user");
        io.to(socket.id).emit("get-user-messages-response", {
          success: true,
          messages,
          receiver: user,
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
      // console.log(userId);
      try {
        const [onlyMatches, matchedAndMessaged] = await Promise.all([
          getMatches(userId),
          getChatList(userId),
        ]);
        // console.log(messages);
        const arr = [...matchedAndMessaged, ...onlyMatches];
        const messages = arr.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.userId.toString() === value.userId.toString()
            )
        );
        console.log(arr);
        io.to(socket.id).emit("chat-list-response", {
          success: true,
          // remove duplicates
          messages,
        });
      } catch (error) {
        console.log(error);
        io.to(socket.id).emit("chat-list-response", {
          success: false,
          message: null,
          error: "Cannot list users",
        });
      }
    });

    socket.on("get-random-users", async ({ userId, page, limit, choices }) => {
      try {
        const user = await getUserInfo({
          userId,
          socketID: false,
        });
        // console.log(user.viewed);
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
        const socketID = await getUserInfo({
          userId: receiverId,
          socketID: true,
        });

        const [user1ID, user2ID] = await Promise.all([
          checkLike({ sent: true, senderId, receiverId }),
          checkLike({ sent: false, senderId, receiverId }),
        ]);

        console.log(user1ID, user2ID, "checklike");

        if (user1ID && user2ID) {
          const [result1, result2] = await Promise.all([
            match({ senderId: user1ID, receiverId: user2ID }),
            match({ senderId: user2ID, receiverId: user1ID }),
          ]);

          console.log(result1, result2);

          io.to(socketID).emit("like-response", {
            success: true,
            isMatched: true,
          });
        } else {
          const [result1, result2, likes] = await Promise.all([
            like({ sent: true, senderId, receiverId }),
            like({ sent: false, senderId, receiverId }),
            getLikes({ userId: receiverId }),
          ]);

          // console.log(result1, result2, socketID, likes.interaction.received);
          io.to(socketID).emit("like-response", {
            success: true,
            likes: likes.interaction.received,
            isMatched: false,
          });
        }
      } catch (error) {
        console.log(error);
        io.to(socket.id).emit("like-response", {
          success: false,
          users: [],
          message: error.message || "Cannot fetch users",
        });
      }
    });

    socket.on("view", async ({ senderId, receiverId }) => {
      try {
        const res = await Promise.all([
          // setView({ userId: senderId, receiverId }), if don't show me to disliked profiles
          setView({ userId: receiverId, receiverId: senderId }),
        ]);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", async () => {
      const userId = await changeUserOnline({
        userId: socket.request._query.userId,
        changeToOnline: false,
      });
      console.log(userId, "disconnected");
      socket.broadcast.emit("chat-list-response", {
        succes: true,
        isDisconnected: true,
        userId: socket.request._query.userId,
      });
    });
  });
};

export default connectSocket;
