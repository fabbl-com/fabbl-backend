import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const getUserInfo = ({ userId, socketID }) => {
  let query = null;
  if (socketID) {
    query = {
      socketID: true,
    };
  } else {
    query = {
      uuid: true,
      displayName: true,
      online: true,
      _id: false,
      id: "$_id",
    };
  }
  return new Promise((resolve, reject) => {
    try {
      User.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId),
          },
        },
        { $project: query },
      ]).exec((err, res) => {
        if (err) return reject(err);
        if (socketID) {
          resolve(res[0].socketID);
        } else {
          resolve(res);
        }
      });
      // .exec((err, res) => {
      //   if (err) return reject(err);
      //   if (socketID) {
      //     resolve(res[0].socketID);
      //   } else {
      //     resolve(res);
      //   }
      // });
    } catch (error) {
      reject(error);
    }
  });
};

export const getChatList = (socketID) =>
  new Promise((resolve, reject) => {
    try {
      User.aggregate([
        {
          $match: {
            socketID: { $ne: socketID },
          },
        },
        {
          $project: {
            uuid: true,
            displayName: true,
            online: true,
            _id: false,
            id: "$_id",
          },
        },
      ]).exec((err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    } catch (error) {
      reject(error);
    }
  });

export const exitChat = (userId) =>
  new Promise((resolve, reject) => {
    try {
      User.findByIdAndUpdate(
        userId,
        { online: false },
        { upsert: true, new: true },
        (err, user) => {
          if (err) return reject(err);
          resolve(user);
        }
      );
    } catch (err) {
      reject(err);
    }
  });

// const getMessagesFromDB = (userId) => {
//   console.log(userId);
//   return new Promise((resolve, reject) => {
//     Message.find(
//       {
//         $or: [{ sender: userId }, { receiver: userId }],
//       },
//       (err, messages) => {
//         console.log(messages);
//         if (err) return reject(err);
//         resolve(messages);
//       }
//     );
//   });
// };

export const insertMessage = (message) =>
  new Promise((resolve, reject) => {
    new Message(message).save((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

export const addSocketID = async ({ userId, socketID }) =>
  new Promise((resolve, reject) => {
    try {
      User.findByIdAndUpdate(userId, { socketID }, (err, user) => {
        if (err) reject(err);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
