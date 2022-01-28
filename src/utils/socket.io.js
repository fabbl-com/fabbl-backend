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
          resolve(res[0]);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getChatList = (userId) =>
  new Promise((resolve, reject) => {
    try {
      Message.aggregate([
        { $match: { clients: mongoose.Types.ObjectId(userId) } },
        { $unwind: "$clients" },
        { $match: { clients: { $ne: mongoose.Types.ObjectId(userId) } } },
        { $unwind: "$messages" },
        { $match: { "messages.isRead": false } },
        {
          $group: {
            _id: "$_id",
            message_id: { $first: "$message_id" },
            receiver: { $first: "$clients" },
            unreadCount: { $sum: 1 },
            message: { $last: "$messages.text" },
            createdAt: { $last: "$messages.createdAt" },
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

export const insertMessage = (message) => {
  const { sender, receiver } = message;
  return new Promise((resolve, reject) => {
    try {
      Message.find(
        {
          message_id: {
            $in: [`${sender}_${receiver}`, `${receiver}_${sender}`],
          },
        },
        (err, doc) => {
          if (err) return reject(err);
          if (doc && doc.length > 0) {
            console.log(doc);
            Message.findOneAndUpdate(
              {
                message_id: {
                  $in: [`${sender}_${receiver}`, `${receiver}_${sender}`],
                },
              },
              { $push: { messages: message } },
              { uspert: true, new: true },
              (err, doc) => {
                if (err) return reject(err);
                resolve(doc);
              }
            );
          } else {
            new Message({
              clients: [sender, receiver],
              message_id: `${sender}_${receiver}`,
              messages: message,
            }).save((err, doc) => {
              console.log(doc);
              if (err) return reject(err);
              resolve(doc);
            });
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

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

export const getMessages = (sender, receiver) =>
  new Promise((resolve, reject) => {
    try {
      Message.findOne(
        {
          message_id: {
            $in: [`${sender}_${receiver}`, `${receiver}_${sender}`],
          },
        },
        (err, messages) => {
          if (err) return reject(err);
          resolve(messages);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
