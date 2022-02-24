import mongoose from "mongoose";
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

export const updatePublicKey = ({ userId, publicKey }) =>
  new Promise((resolve, reject) => {
    if (!publicKey) {
      resolve(false);
      return;
    }
    console.log(publicKey, "ehy");
    try {
      User.findByIdAndUpdate(
        userId,
        { $set: { publicKey: JSON.stringify(publicKey) } },
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
