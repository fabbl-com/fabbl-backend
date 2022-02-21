import {
  BLOCKED,
  GET_NOTIFICATION_USERS,
  GET_RANDOM_USERS,
  GET_SOCKET_ID,
  GET_SOCKET_ID_AND_GET_NOTIFICATION_USERS,
  LIKED,
  MATCHED,
  UNBLOCKED,
  VIEWED,
  GOT_FRIEND_REQUEST,
  CONFIRMED_FRIEND_REQUEST,
  DECLINED_FRIEND_REQUEST,
  DELETE_NOTIFICATION,
} from "./constants/index.js";
import {
  addSocketID,
  addToArray,
  addToFriends,
  addToNotifications,
  changeUserOnline,
  checkBlock,
  checkLike,
  confirmFriendRequest,
  declineFriendRequest,
  getBlocked,
  getChatList,
  getFriends,
  getLikes,
  getMatches,
  getMessages,
  getRandomUsers,
  getReceiverInfo,
  getUserInfo,
  insertMessage,
  like,
  makeMessageSeen,
  match,
  removeFromArray,
} from "./utils/socket.io.js";

const connectSocket = (io, session) => {
  io.use(async (socket, next) => {
    session(socket.request, {}, next);
  });
  io.on("connection", async (socket) => {
    try {
      const { userId } = await socket.request._query;
      console.info(`⚡︎ New connection: ${userId}`);
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
      socket.broadcast.emit("connection-response", {
        connected: true,
        userId,
        lastLogin: new Date(),
      });
    } catch (error) {
      console.log(error);
    }
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
              type: GET_SOCKET_ID,
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
      // console.log(sender, receiver);
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
            // console.log(index);
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
          type: GET_RANDOM_USERS,
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
          type: GET_SOCKET_ID,
        });

        const [user1ID, user2ID] = await Promise.all([
          checkLike({ sent: true, senderId, receiverId }),
          checkLike({ sent: false, senderId, receiverId }),
        ]);

        // console.log(user1ID, user2ID, "checklike");

        if (user1ID && user2ID) {
          const [result1, result2, notification1, notification2, user1, user2] =
            await Promise.all([
              match({ senderId: user1ID, receiverId: user2ID }),
              match({ senderId: user2ID, receiverId: user1ID }),
              addToNotifications({
                userId: senderId,
                receiverId,
                notificationType: MATCHED,
              }),
              addToNotifications({
                userId: receiverId,
                receiverId: senderId,
                notificationType: MATCHED,
              }),
              getUserInfo({ userId: senderId, type: GET_NOTIFICATION_USERS }),
              getUserInfo({ userId: receiverId, type: GET_NOTIFICATION_USERS }),
            ]);

          // console.log(result1, result2);
          io.to(socket.id).emit("send-notifications", {
            ...notification1,
            ...user1,
          });
          io.to(socketID).emit("send-notifications", {
            ...notification2,
            ...user2,
          });
          io.to(socketID).emit("like-response", {
            success: true,
            isMatched: true,
          });
        } else {
          const [result1, result2, likes, notification] = await Promise.all([
            like({ sent: true, senderId, receiverId }),
            like({ sent: false, senderId, receiverId }),
            getLikes({ userId: receiverId }),
            addToNotifications({
              userId: receiverId,
              receiverId: senderId,
              notificationType: LIKED,
            }),
          ]);

          // console.log(result1, result2, socketID, likes.interaction.received);
          io.to(socketID).emit("send-notifications", notification);
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
            type: VIEWED,
          }),
        ]);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("read", async ({ _id, createdAt, sender }) => {
      try {
        // console.log(_id, createdAt, sender, "read");
        const [isRead, socketId] = await Promise.all([
          makeMessageSeen({ _id, sender, createdAt }),
          getUserInfo({
            userId: sender,
            type: GET_SOCKET_ID,
          }),
        ]);

        // console.log(isRead, socketId);

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
      // console.log(sender, receiver, "array");
      try {
        const [isAdded1, isAdded2, notification, user] = await Promise.all([
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
          addToNotifications({
            userId: receiver,
            receiverId: sender,
            notificationType: GOT_FRIEND_REQUEST,
          }),
          getUserInfo({
            userId: receiver,
            type: GET_SOCKET_ID_AND_GET_NOTIFICATION_USERS,
          }),
        ]);
        if (isAdded1)
          io.to(socket.id).emit("add-friends-response", {
            success: true,
            status: "sent",
            message: "Friend Request sent",
          });
        if (isAdded2) {
          io.to(user.socketID).emit("send-notifications", {
            ...notification,
            avatar: user.avatar,
            displayName: user.displayName,
          });
          io.to(user.socketID).emit("add-friends-response", {
            success: true,
            status: "received",
            message: "You have received a friend request",
          });
        }
      } catch (error) {
        console.log(error);
        io.to(socket.id).emit("add-friends-response", {
          success: false,
          message: "Friend Request cannot be sent",
        });
      }
    });

    socket.on(
      "confirm-friends-request",
      async ({ sender, receiver, notificationId }) => {
        console.log(sender, receiver, notificationId, "hello");
        try {
          const [
            isConfirmed1,
            isConfirmed2,
            notification,
            user,
            socketID,
            isDeleted,
          ] = await Promise.all([
            confirmFriendRequest({ userId: sender, receiverId: receiver }),
            confirmFriendRequest({ userId: receiver, receiverId: sender }),
            addToNotifications({
              userId: receiver,
              receiverId: sender,
              notificationType: CONFIRMED_FRIEND_REQUEST,
            }),
            getUserInfo({
              userId: sender,
              type: GET_NOTIFICATION_USERS,
            }),
            getUserInfo({
              userId: receiver,
              type: GET_SOCKET_ID,
            }),
            removeFromArray({
              userId: sender,
              removedId: notificationId,
              type: DELETE_NOTIFICATION,
            }),
          ]);
          console.log(socketID);
          if (isConfirmed1 && isDeleted)
            io.to(socket.id).emit("friends-request-response", {
              success: true,
              messsage: "Friend request confirmed",
              notificationId,
            });

          if (isConfirmed2)
            io.to(socketID).emit("send-notifications", {
              ...notification,
              avatar: user.avatar,
              displayName: user.displayName,
            });
        } catch (error) {
          console.log(error);
          io.to(socket.id).emit("friends-request-response", {
            success: false,
            message: "Cannot confirm friend request",
          });
        }
      }
    );

    socket.on(
      "decline-friends-request",
      async ({ sender, receiver, notificationId }) => {
        try {
          const [
            isDeclined1,
            isDeclined2,
            notification,
            user,
            socketID,
            isDeleted,
          ] = await Promise.all([
            declineFriendRequest({ userId: sender, receiverId: receiver }),
            declineFriendRequest({ userId: receiver, receiverId: sender }),
            addToNotifications({
              userId: receiver,
              receiverId: sender,
              notificationType: DECLINED_FRIEND_REQUEST,
            }),
            getUserInfo({
              userId: sender,
              type: GET_NOTIFICATION_USERS,
            }),
            getUserInfo({
              userId: receiver,
              type: GET_SOCKET_ID,
            }),
            await removeFromArray({
              userId: sender,
              removedId: notificationId,
              type: DELETE_NOTIFICATION,
            }),
          ]);

          if (isDeclined1 && isDeleted)
            io.to(socket.id).emit("friends-request-response", {
              success: true,
              messsage: "Friend request declined",
              notificationId,
            });

          if (isDeclined2)
            io.to(socketID).emit("send-notifications", {
              ...notification,
              avatar: user.avatar,
              displayName: user.displayName,
            });
        } catch (error) {
          console.log(error);
          io.to(socket.id).emit("friends-request-response", {
            success: false,
            message: "Cannot confirm friend request",
          });
        }
      }
    );

    socket.on("block", async ({ sender, receiver }) => {
      try {
        const [isBlocked, notification, user] = await Promise.all([
          addToArray({
            userId: sender,
            receiverId: receiver,
            type: BLOCKED,
          }),
          addToNotifications({
            userId: receiver,
            receiverId: sender,
            notificationType: BLOCKED,
          }),
          getUserInfo({
            userId: receiver,
            type: GET_SOCKET_ID_AND_GET_NOTIFICATION_USERS,
          }),
        ]);

        if (isBlocked) {
          io.to(socket.id).emit("block-response", {
            success: true,
            isBlocked,
            blockedAt: new Date(),
          });
          io.to(user.socketID).emit("send-notifications", {
            ...notification,
            avatar: user.avatar,
            displayName: user.displayName,
          });
          io.to(user.socketID).emit("block-response", {
            success: true,
            isBlockedBy: isBlocked,
            blockedAt: new Date(),
          });
        }
      } catch (error) {
        console.log(error);
        io.to(socket.id).emit("block-response", {
          success: false,
          message: "Failed to block",
        });
      }
    });

    socket.on("unblock", async ({ sender, receiver }) => {
      try {
        const [isUnblocked, notification, user] = await Promise.all([
          removeFromArray({
            userId: sender,
            removedId: receiver,
            type: UNBLOCKED,
          }),
          addToNotifications({
            userId: receiver,
            receiverId: sender,
            notificationType: UNBLOCKED,
          }),
          getUserInfo({
            userId: receiver,
            type: GET_SOCKET_ID_AND_GET_NOTIFICATION_USERS,
          }),
        ]);

        if (isUnblocked) {
          io.to(socket.id).emit("block-response", {
            success: true,
            isBlocked: true,
            unblockedAt: new Date(),
          });
          io.to(user.socketID).emit("send-notifications", {
            ...notification,
            avatar: user.avatar,
            displayName: user.displayName,
          });
          io.to(user.socketID).emit("block-response", {
            success: true,
            isBlockedBy: false,
            unblockedAt: new Date(),
          });
        }
      } catch (error) {
        console.log(error);
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
