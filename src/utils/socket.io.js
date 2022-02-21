import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  BLOCKED,
  DELETE_NOTIFICATION,
  GET_NOTIFICATION_USERS,
  GET_RANDOM_USERS,
  GET_SOCKET_ID,
  GET_SOCKET_ID_AND_GET_NOTIFICATION_USERS,
  UNBLOCKED,
  VIEWED,
} from "../constants/index.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const getUserInfo = ({ userId, type }) => {
  let query = null;
  switch (type) {
    case GET_SOCKET_ID:
      query = {
        socketID: true,
      };
      break;
    case GET_RANDOM_USERS:
      query = {
        _id: false,
        hobby: true,
        dob: true,
        viewed: true,
        gender: true,
        relationshipStatus: true,
      };
      break;
    case GET_NOTIFICATION_USERS:
      query = {
        _id: false,
        displayName: true,
        avatar: true,
      };
      break;
    case GET_SOCKET_ID_AND_GET_NOTIFICATION_USERS:
      query = {
        _id: false,
        socketID: true,
        displayName: true,
        avatar: true,
      };
      break;
    default:
      break;
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
        if (type === GET_SOCKET_ID) {
          resolve(res[0]?.socketID);
        } else {
          resolve(res[0]);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getReceiverInfo = ({ senderId, receiverId }) =>
  new Promise((resolve, reject) => {
    try {
      User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(receiverId) } },
        {
          $project: {
            avatar: 1,
            online: 1,
            lastLogin: 1,
            displayName: 1,
            matches: 1,
          },
        },
        {
          $project: {
            avatar: 1,
            online: 1,
            displayName: 1,
            lastLogin: 1,
            matches: 1,
          },
        },
        {
          $unwind: {
            path: "$matches",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $match: { "matches.userId": mongoose.Types.ObjectId(senderId) } },
        {
          $project: {
            avatar: 1,
            matchAt: "$matches.createdAt",
            displayName: 1,
            lastLogin: 1,
            online: 1,
          },
        },
      ]).exec((err, res) => {
        if (err) return reject(err);
        resolve(res[0]);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });

export const checkBlock = ({ userId, blockedId }) =>
  new Promise((resolve, reject) => {
    try {
      User.find(
        {
          _id: mongoose.Types.ObjectId(userId),
          "blocked.userId": mongoose.Types.ObjectId(blockedId),
        },
        (err, doc) => {
          if (err) return reject(err);
          if (doc.length > 0) resolve(true);
          else resolve(false);
        }
      );
    } catch (error) {
      reject(error);
    }
  });

export const getChatList = (userId) =>
  new Promise((resolve, reject) => {
    try {
      Message.aggregate([
        { $match: { clients: mongoose.Types.ObjectId(userId) } },
        { $unwind: "$clients" },
        { $match: { clients: { $ne: mongoose.Types.ObjectId(userId) } } },
        {
          $project: {
            _id: true,
            clients: true,
            message_id: true,
            messages: true,
            msgCopy: "$messages",
          },
        },
        { $unwind: "$messages" },
        {
          $group: {
            _id: "$_id",
            message_id: { $first: "$message_id" },
            receiver: { $first: "$clients" },
            message: { $last: "$messages.text" },
            msgCopy: { $first: "$msgCopy" },
            createdAt: { $last: "$messages.createdAt" },
          },
        },
        { $unwind: "$msgCopy" },
        {
          $group: {
            _id: "$_id",
            message_id: { $first: "$message_id" },
            receiver: { $first: "$receiver" },
            message: { $last: "$message" },
            createdAt: { $last: "$createdAt" },
            unread: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $ne: [
                          "$msgCopy.sender",
                          mongoose.Types.ObjectId(userId),
                        ],
                      },
                      { $eq: ["$msgCopy.isRead", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "receiver",
            foreignField: "_id",
            as: "profile",
          },
        },
        { $unwind: "$profile" },
        {
          $project: {
            _id: 0,
            userId: "$profile._id",
            message: 1,
            createdAt: 1,
            displayName: "$profile.displayName",
            unread: 1,
            online: "$profile.online",
            avatar: "$profile.avatar",
          },
        },
        { $sort: { createdAt: -1 } },
      ]).exec((err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    } catch (error) {
      reject(error);
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
        resolve(true);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getMessages = (sender, receiver) =>
  new Promise((resolve, reject) => {
    try {
      Message.aggregate([
        {
          $match: {
            message_id: {
              $in: [`${sender}_${receiver}`, `${receiver}_${sender}`],
            },
          },
        },
        { $project: { messages: 1 } },
      ]).exec((err, res) => {
        if (err) return reject(err);
        resolve(res?.[0]);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getRandomUsers = (userId, page, limit, choices, baseUser) => {
  const skip = ((page || 1) - 1) * limit;
  return new Promise((resolve, reject) => {
    const stage1 = {
      _id: { $not: { $in: baseUser.viewed } },
      "gender.value": choices.gender || baseUser.gender,
      "blocked.userId": { $not: { $in: [mongoose.Types.ObjectId(userId)] } },
      "viewed.userId": { $not: { $in: [mongoose.Types.ObjectId(userId)] } },
      "friends.userId": { $not: { $in: [mongoose.Types.ObjectId(userId)] } },
      "interaction.received.userId": {
        $not: { $in: [mongoose.Types.ObjectId(userId)] },
      },
      // lastLogin: {
      //   $lte: new Date(new Date() - (choices.day || 1) * 24 * 60 * 60 * 1000),
      // },
    };

    const stage2_1 = {
      path: "$interaction.sent",
      preserveNullAndEmptyArrays: true,
    };

    const stage2_2 = {
      _id: 0,
      id: "$_id",
      likedScore: {
        $cond: [
          {
            $in: [
              "$interaction.sent.userId",
              [mongoose.Types.ObjectId(userId)],
            ],
          },
          5,
          0,
        ],
      },
      statusScore: {
        $cond: [
          { $eq: ["$relationshipStatus.value", baseUser.relationshipStatus] },
          0.5,
          0,
        ],
      },
      gender: "$gender.value",
      isProfileVerified: 1,
      dob: "$dob.value",
      hobby: "$hobby.value",
      dobDiff: { $abs: { $subtract: ["$dob.value", new Date(baseUser.dob)] } },
      dobSum: { $add: ["$dob.value", baseUser.dob] },
    };

    const stage3 = "$hobby";

    const stage4 = {
      id: 1,
      likedScore: true,
      isHobby: { $in: ["$hobby", baseUser.hobby] },
      dobSum: { $abs: { $subtract: ["$dobSum", new Date(0)] } },
      statusScore: 1,
      isProfileVerified: 1,
      dobDiff: 1,
    };

    const stage5 = {
      _id: "$id",
      likedScore: { $max: "$likedScore" },
      hobbyScore: { $sum: { $cond: ["$isHobby", 0.5, 0] } },
      dobSum: { $first: "$dobSum" },
      statusScore: { $first: "$statusScore" },
      dobDiff: { $first: "$dobDiff" },
      isProfileVerified: { $first: "$isProfileVerified" },
    };

    const stage6 = {
      _id: 0,
      id: "$_id",
      likedScore: true,
      ageScore: { $multiply: [{ $divide: ["$dobDiff", "$dobSum"] }, 0.7] },
      hobbyScore: 1,
      statusScore: 1,
      isProfileVerified: 1,
      dobDiff: 1,
      doc: "$$ROOT",
    };

    const stage7 = {
      id: "$id",
      score: {
        $multiply: [
          {
            $add: [
              "$doc.likedScore",
              "$ageScore",
              "$doc.hobbyScore",
              "$doc.statusScore",
            ],
          },
          1000,
        ],
      },
    };

    const stage8 = { score: -1 };

    const stage9 = {
      from: "users",
      localField: "id",
      foreignField: "_id",
      as: "profile",
    };

    const stage10 = "$profile";

    const stage11 = {
      data: [{ $skip: skip }, { $limit: limit }],
    };

    try {
      User.aggregate([
        { $match: stage1 },
        { $unwind: stage2_1 },
        { $project: stage2_2 },
        { $unwind: stage3 },
        { $project: stage4 },
        { $group: stage5 },
        { $project: stage6 },
        { $project: stage7 },
        { $sort: stage8 },
        { $lookup: stage9 },
        { $unwind: stage10 },
        { $facet: stage11 },
      ]).exec((err, res) => {
        if (err) {
          console.log(err);
          return reject(err);
        }
        // console.log(res);
        resolve(res);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const getMatches = (userId) =>
  new Promise((resolve, reject) => {
    User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      { $project: { _id: 0, matches: 1 } },
      { $unwind: "$matches" },
      {
        $project: {
          createdAt: "$matches.createdAt",
          userId: "$matches.userId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "profile",
        },
      },
      { $unwind: "$profile" },
      {
        $project: {
          userId: "$profile._id",
          createdAt: 1,
          displayName: "$profile.displayName",
          online: "$profile.online",
          avatar: "$profile.avatar",
        },
      },
    ]).exec((err, res) => {
      if (err) return reject(err);
      // console.log(res);
      resolve(res);
    });
  });

export const like = ({ sent, senderId, receiverId }) => {
  // console.log(sent, senderId, receiverId);
  let obj1;
  let obj2;
  if (sent) {
    obj1 = {
      "interaction.sent": {
        userId: mongoose.Types.ObjectId(receiverId),
        createdAt: new Date(),
      },
    };
    obj2 = {
      _id: mongoose.Types.ObjectId(senderId),
      "interaction.sent": {
        $not: {
          $elemMatch: {
            userId: mongoose.Types.ObjectId(receiverId),
          },
        },
      },
    };
  } else {
    obj1 = {
      "interaction.received": {
        userId: mongoose.Types.ObjectId(senderId),
        createdAt: new Date(),
      },
    };
    obj2 = {
      _id: mongoose.Types.ObjectId(receiverId),
      "interaction.received": {
        $not: {
          $elemMatch: {
            userId: mongoose.Types.ObjectId(senderId),
          },
        },
      },
    };
  }
  return new Promise((resolve, reject) => {
    try {
      User.updateOne(obj2, { $push: obj1 }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const getLikes = ({ userId }) =>
  new Promise((resolve, reject) => {
    try {
      User.findById(userId)
        .select("interaction.received")
        .then((result) => resolve(result))
        .catch((err) => reject(err));
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });

export const checkLike = ({ sent, senderId, receiverId }) => {
  let userId;
  let matchId;
  let obj;
  if (sent) {
    userId = senderId;
    matchId = receiverId;
    obj = "$interaction.received";
  } else {
    userId = receiverId;
    matchId = senderId;
    obj = "$interaction.sent";
  }
  return new Promise((resolve, reject) => {
    User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(userId) } },
      { $project: { _id: 0, interaction: obj } },
      { $unwind: "$interaction" },
      { $match: { "interaction.userId": mongoose.Types.ObjectId(matchId) } },
    ]).exec((err, res) => {
      console.log(err);
      if (err) return reject(err);
      // console.log(res);
      resolve(res[0]?.interaction.userId);
    });
  });
};

export const match = ({ senderId, receiverId }) =>
  new Promise((resolve, reject) => {
    try {
      User.updateOne(
        {
          _id: mongoose.Types.ObjectId(senderId),
          matches: {
            $not: {
              $elemMatch: {
                userId: mongoose.Types.ObjectId(receiverId),
              },
            },
          },
        },
        {
          $push: {
            matches: {
              userId: receiverId,
              createdAt: new Date(),
            },
          },
        },
        (err, res) => {
          console.log(err);
          if (err) return reject(err);
          resolve(res);
        }
      );
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });

export const changeUserOnline = ({ userId, changeToOnline }) => {
  let obj;
  if (changeToOnline) obj = { online: true };
  else obj = { online: false, lastLogin: new Date() };
  return new Promise((resolve, reject) => {
    try {
      User.findByIdAndUpdate(
        userId,
        { $set: obj },
        { new: true },
        (err, user) => {
          if (err) reject(err);
          resolve(user.id);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
};

export const makeMessageSeen = ({ _id, sender, createdAt }) =>
  new Promise((resolve, reject) => {
    try {
      Message.updateMany(
        {
          _id: mongoose.Types.ObjectId(_id),
          "messages.sender": mongoose.Types.ObjectId(sender),
        },
        { $set: { "messages.$[elem].isRead": true } },
        {
          arrayFilters: [{ "elem.createdAt": { $lte: new Date(createdAt) } }],
          upsert: true,
        },
        (err, _) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (err) {
      reject(err);
    }
  });

export const addToArray = ({ userId, receiverId, type }) => {
  let array;
  if (type === BLOCKED) array = "blocked";
  else if (type === VIEWED) array = "viewed";

  const query = { _id: mongoose.Types.ObjectId(userId) };
  const operation = {};
  query[array] = {
    $not: {
      $elemMatch: {
        userId: mongoose.Types.ObjectId(receiverId),
      },
    },
  };
  operation[array] = {
    userId: receiverId,
    createdAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    try {
      User.updateOne(
        query,
        {
          $push: operation,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};

export const removeFromArray = ({ userId, removedId, type }) => {
  let obj = {};
  switch (type) {
    case UNBLOCKED:
      obj = {
        blocked: { userId: mongoose.Types.ObjectId(removedId) },
      };
      break;
    case DELETE_NOTIFICATION:
      obj = {
        notifications: { notificationId: removedId },
      };
      break;
    default:
      break;
  }
  return new Promise((resolve, reject) => {
    try {
      User.updateOne(
        { _id: mongoose.Types.ObjectId(userId) },
        {
          $pull: obj,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
};
export const addToFriends = ({ userId, receiverId, status }) =>
  new Promise((resolve, reject) => {
    try {
      User.updateOne(
        {
          _id: mongoose.Types.ObjectId(userId),
          friends: {
            $not: {
              $elemMatch: {
                userId: mongoose.Types.ObjectId(receiverId),
              },
            },
          },
        },
        {
          $push: {
            friends: {
              userId: receiverId,
              createdAt: new Date(),
              status,
            },
          },
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      reject(error);
    }
  });

export const getFriends = (userId) =>
  new Promise((resolve, reject) => {
    try {
      User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        { $unwind: { path: "$friends", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            userId: "$friends.userId",
            status: "$friends.status",
          },
        },
      ]).exec((err, res) => {
        console.log(err);
        if (err) return reject(err);
        console.log(res);
        resolve(res);
      });
    } catch (error) {
      reject(error);
    }
  });

export const getBlocked = (userId) =>
  new Promise((resolve, reject) => {
    try {
      User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        { $unwind: { path: "$blocked", preserveNullAndEmptyArrays: true } },
        { $project: { _id: 0, userId: "$blocked.userId" } },
      ]).exec((err, res) => {
        console.log(err, "err2");
        if (err) return reject(err);
        console.log(res);
        resolve(res);
      });
    } catch (error) {
      reject(error);
    }
  });

export const addToNotifications = ({
  userId,
  receiverId,
  notificationType,
}) => {
  const obj = {
    notificationId: uuidv4(),
    userId: receiverId,
    isRead: false,
    notificationType,
    createdAt: new Date(),
  };
  return new Promise((resolve, reject) => {
    try {
      User.updateOne(
        {
          _id: mongoose.Types.ObjectId(userId),
          notifications: {
            $not: {
              $elemMatch: {
                $and: [
                  { userId: mongoose.Types.ObjectId(receiverId) },
                  { notificationType },
                ],
              },
            },
          },
        },
        {
          $push: { notifications: obj },
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(obj);
        }
      );
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const confirmFriendRequest = async ({ userId, receiverId }) =>
  new Promise((resolve, reject) => {
    try {
      User.updateOne(
        {
          _id: mongoose.Types.ObjectId(userId),
          "friends.userId": mongoose.Types.ObjectId(receiverId),
        },
        { $set: { "friends.$.status": "friends" } },
        (err, _) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      reject(error);
    }
  });

export const declineFriendRequest = async ({ userId, receiverId }) =>
  new Promise((resolve, reject) => {
    try {
      User.updateOne(
        {
          _id: mongoose.Types.ObjectId(userId),
        },
        { $pull: { friends: { userId: mongoose.Types.ObjectId(receiverId) } } },
        (err, _) => {
          if (err) return reject(err);
          resolve(true);
        }
      );
    } catch (error) {
      reject(error);
    }
  });
