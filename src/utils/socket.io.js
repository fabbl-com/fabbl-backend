import { v4 as uuidv4 } from "uuid";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const messages = new Set();
const users = new Map();

const defaultUser = {
  id: "anon",
  name: "Anonymous",
};

const getMessagesFromDB = (userId) => {
  console.log(userId);
  return new Promise((resolve, reject) => {
    Message.find(
      {
        $or: [{ sender: userId }, { receiver: userId }],
      },
      (err, messages) => {
        console.log(messages);
        if (err) return reject(err);
        resolve(messages);
      }
    );
  });
};

const getSocketID = (userId) =>
  new Promise((resolve, reject) => {
    User.findById(userId, (err, user) => {
      if (err) return reject(err);
      resolve(user.socketID);
    });
  });

const insertMessage = (message) =>
  new Promise((resolve, reject) => {
    new Message(message).save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const msgExpirationTimeInMS = 5 * 60 * 1000;

export const getMessages = async (io, data) => {
  console.log(data);
  try {
    const [socketID, messages] = await Promise.all([
      getSocketID(data.userId),
      getMessagesFromDB(data.userId),
    ]);
    console.log(socketID);
    io.to(socketID).emit("get-messages", messages);
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};

export const sendMessage = async (io, message) => {
  console.log(message.receiver);
  try {
    const result = await Promise.all([
      getSocketID(message.receiver),
      insertMessage(message),
    ]);
    io.to(result[0]).emit("add-message", message);
    console.log(result[1]);
  } catch (err) {
    console.log(`Error: ${err}`);
  }
};
// export const sendMessage = async (io, text) => {
//   const message = {
//     id: uuidv4(),
//     user: users && users.length > 0 ? users.get(this.socket) : defaultUser,
//     text,
//     time: Date.now(),
//   };

//   messages.add(message);
//   io.sockets.emit("send-message", message);
//   console.log(messages);

//   setTimeout(() => {
//     messages.delete(message);
//     io.sockets.emit("deleteMsg", message.id);
//   }, msgExpirationTimeInMS);
// };

export const disconnect = (id) => {
  console.log("disconnected");
};

export const addSocketId = async ({ userId, socketID }) =>
  new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      userId,
      { socketID },
      { upsert: true, new: true },
      (err, user) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
