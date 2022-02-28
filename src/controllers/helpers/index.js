import mongoose from "mongoose";
import {
  DELETE_FROM_FRIENDS,
  DELETE_FROM_LIKE_RECEIVED,
  DELETE_FROM_LIKE_SENT,
  DELETE_FROM_MATCHES,
} from "../../constants/index.js";
import User from "../../models/userModel.js";

export const getNotifications = (userId) =>
  new Promise((resolve, reject) => {
    try {
      User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        {
          $project: {
            _id: 0,
            notifications: 1,
          },
        },
        { $unwind: { path: "$notifications" } },
        {
          $lookup: {
            from: "users",
            localField: "notifications.userId",
            foreignField: "_id",
            as: "profile",
          },
        },
        { $unwind: { path: "$profile" } },
        {
          $project: {
            notificationId: "$notifications.notificationId",
            notificationType: "$notifications.notificationType",
            isRead: "$notifications.isRead",
            createdAt: "$notifications.createdAt",
            userId: "$profile._id",
            displayName: "$profile.displayName",
            avatar: "$profile.avatar",
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

export const getProfile = (userId) =>
  new Promise((resolve, reject) => {
    try {
      User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        {
          $project: {
            online: 1,
            displayName: 1,
            gender: 1,
            email: 1,
            isEmailVerified: 1,
            avatar: 1,
            headline: 1,
            dob: 1,
            hobby: 1,
            relationshipStatus: 1,
            location: 1,
            settings: 1,
            lastLogin: 1,
            isProfileCompleted: 1,
            privateKey: 1,
            publicKey: 1,
            createdAt: 1,
          },
        },
      ]).exec((err, res) => {
        if (err) return reject(err);
        resolve(res[0]);
      });
    } catch (error) {
      reject(error);
    }
  });

export const updateKeys = ({ userId, publicKey, privateKey }) =>
  new Promise((resolve, reject) => {
    if (!publicKey && !privateKey) {
      resolve(false);
      return;
    }
    console.log(publicKey, "ehy");
    try {
      User.updateOne(
        {
          _id: mongoose.Types.ObjectId(userId),
          $and: [
            {
              publicKey: {
                $exists: false,
              },
            },
            {
              privateKey: {
                $exists: false,
              },
            },
          ],
        },
        {
          $set: {
            publicKey: JSON.stringify(publicKey),
            privateKey: JSON.stringify(privateKey),
          },
        },
        { $upsert: true },
        (err, doc) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });

export const deleteUser = (id) =>
  new Promise((resolve, reject) => {
    try {
      User.deleteOne({ _id: mongoose.Types.ObjectId(id) }, (err, doc) => {
        if (err) return reject(err);
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const removeFromArray = ({ id, type }) => {
  let obj = {};
  switch (type) {
    case DELETE_FROM_FRIENDS:
      obj = {
        friends: { userId: mongoose.Types.ObjectId(id) },
      };
      break;
    case DELETE_FROM_MATCHES:
      obj = {
        matches: { userId: mongoose.Types.ObjectId(id) },
      };
      break;
    case DELETE_FROM_LIKE_SENT:
      obj = {
        "interaction.received": { userId: mongoose.Types.ObjectId(id) },
      };
      break;
    case DELETE_FROM_LIKE_RECEIVED:
      obj = {
        "interaction.sent": { userId: mongoose.Types.ObjectId(id) },
      };
      break;
    default:
      break;
  }
  return new Promise((resolve, reject) => {
    try {
      User.updateMany(
        {},
        {
          $pull: obj,
        },
        (err, doc) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
