import User from "../models/userModel.js";

const makeUserOnline = (id) =>
  new Promise((resolve, reject) => {
    try {
      User.findByIdAndUpdate(
        id,
        { online: true },
        { upsert: true, new: true },
        (err, user) => {
          if (err) reject(err);
          resolve(user.id);
        }
      );
    } catch (err) {
      reject(err);
    }
  });

export default makeUserOnline;
