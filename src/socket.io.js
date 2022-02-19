import {
  addSocketID,
  getUserInfo,
  getChatList,
  insertMessage,
  getMessages,
  getRandomUsers,
  like,
  getLikes,
  getMatches,
  checkLike,
  match,
  getReceiverInfo,
  changeUserOnline,
  makeMessageSeen,
  addToArray,
  removeFromBlock,
  addToFriends,
  getFriends,
  getBlocked,
  checkBlock,
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
      // console.log(res1, res2, "resolved");
      socket.broadcast.emit("connection-response", {
        connected: true,
        userId,
        lastLogin: new Date(),
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
      // console.log(message);
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
          // check if blocked
          const [receiverSocketID, _] = await Promise.all([
            getUserInfo({
              userId: message.receiver,
              socketID: true,
            }),
            insertMessage(message),
          ]);
          // console.log(receiverSocketID);
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

    socket.on("get-user-messages", async ({ sender, receiver }) => {
      console.log(sender, receiver);
      try {
        const [messages, user, isBlockedBy] = await Promise.all([
          getMessages(sender, receiver),
          getReceiverInfo({
            senderId: sender,
            receiverId: receiver,
          }),
          checkBlock({ userId: receiver, blockedId: sender }),
        ]);
        user.isBlockedBy = isBlockedBy;
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
        const [onlyMatches, matchedAndMessaged, friends, blocked] =
          await Promise.all([
            getMatches(userId),
            getChatList(userId),
            getFriends(userId),
            getBlocked(userId),
          ]);
        // console.log(messages);
        const arr = [...matchedAndMessaged, ...onlyMatches];
        const messages = arr.filter(
          (value, index, self) =>
            index ===
            self.findIndex(
              (t) => t.userId?.toString() === value.userId?.toString()
            )
        );
        if (friends && friends.length > 0)
          friends.forEach((user) => {
            const index = messages.findIndex(
              (el) => el.userId?.toString() === user.userId?.toString()
            );
            console.log(index);
            if (index !== -1) messages[index].friendStatus = user.status;
          });
        if (blocked && blocked.length > 0)
          blocked.forEach((user) => {
            const index = messages.findIndex(
              (el) => el.userId?.toString() === user.userId?.toString()
            );
            if (index !== -1) messages[index].isBlocked = true;
          });

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
        // console.log(user, "user");
        const baseUser = {
          viewed: user.viewed,
          dob: new Date(user.dob.value).getTime(),
          hobby: user.hobby.value,
          gender: user.gender.value === 0 ? 1 : 0,
          relationshipStatus: user.relationshipStatus.value,
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
        console.log(error);
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

        // console.log(user1ID, user2ID, "checklike");

        if (user1ID && user2ID) {
          const [result1, result2] = await Promise.all([
            match({ senderId: user1ID, receiverId: user2ID }),
            match({ senderId: user2ID, receiverId: user1ID }),
          ]);

          // console.log(result1, result2);

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
          addToArray({
            userId: receiverId,
            receiverId: senderId,
            type: "VIEW",
          }),
        ]);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("read", async ({ _id, createdAt, sender }) => {
      try {
        console.log(_id, createdAt, sender, "read");
        const [isRead, socketId] = await Promise.all([
          makeMessageSeen({ _id, sender, createdAt }),
          getUserInfo({
            userId: sender,
            socketID: true,
          }),
        ]);

        console.log(isRead, socketId);

        if (isRead)
          io.to(socketId).emit("read-response", {
            success: true,
            sender,
            createdAt,
          });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("add-friends", async ({ sender, receiver }) => {
      console.log(sender, receiver, "array");
      try {
        const [isAdded1, isAdded2, socketID] = await Promise.all([
          addToFriends({
            userId: sender,
            receiverId: receiver,
            status: "sent",
          }),
          addToFriends({
            userId: receiver,
            receiverId: sender,
            status: "received",
          }),
          getUserInfo({
            userId: receiver,
            socketID: true,
          }),
        ]);
        if (isAdded1)
          io.to(socket.id).emit("add-friends-response", {
            success: true,
            status: "sent",
            message: "Friend Request sent",
          });
        if (isAdded2)
          io.to(socketID).emit("add-friends-response", {
            success: true,
            status: "received",
            message: "You have received a friend request",
          });
      } catch (error) {
        io.to(socket.id).emit("add-friends-response", {
          success: false,
          message: "Friend Request cannot be sent",
        });
      }
    });

    socket.on("block", async ({ sender, receiver }) => {
      try {
        const [isBlocked, socketID] = await Promise.all([
          addToArray({
            userId: sender,
            receiverId: receiver,
            type: "BLOCK",
          }),
          getUserInfo({
            userId: receiver,
            socketID: true,
          }),
        ]);

        if (isBlocked) {
          io.to(socket.id).emit("block-response", {
            success: true,
            isBlocked,
            blockedAt: new Date(),
          });
          io.to(socketID).emit("block-response", {
            success: true,
            isBlockedBy: isBlocked,
            blockedAt: new Date(),
          });
        }
      } catch (error) {
        io.to(socket.id).emit("block-response", {
          success: false,
          message: "Failed to block",
        });
      }
    });

    socket.on("unblock", async ({ sender, receiver }) => {
      try {
        const [isUnblocked, socketID] = await Promise.all([
          removeFromBlock({
            userId: sender,
            receiverId: receiver,
            type: "UNBLOCK",
          }),
          getUserInfo({
            userId: receiver,
            socketID: true,
          }),
        ]);

        if (isUnblocked) {
          io.to(socket.id).emit("block-response", {
            success: true,
            isBlocked: false,
            unblockedAt: new Date(),
          });
          io.to(socketID).emit("block-response", {
            success: true,
            isBlockedBy: false,
            unblockedAt: new Date(),
          });
        }
      } catch (error) {
        io.to(socket.id).emit("block-response", {
          success: false,
          message: "Failed to unblock",
        });
      }
    });

    socket.on("disconnect", async () => {
      const userId = await changeUserOnline({
        userId: socket.request._query.userId,
        changeToOnline: false,
      });
      console.log(userId, "disconnected");
      socket.broadcast.emit("connection-response", {
        connected: false,
        userId,
        lastLogin: new Date(),
      });
    });
  });
};

export default connectSocket;
