import passport from "passport";
import Message from "../models/messageModel.js";
import ErrorMessage from "../utils/errorMessage.js";

export const register = (req, res, next) => {
  passport.authenticate("local.register", (err, user, info) => {
    console.log(err, user, info);
    if (err) return next(err);
    if (info && !info.success) return res.status(401).json(info);
    req.login(user, (err) => {
      if (err) return next(err);
      res.status(200).json({ success: true, userId: user });
    });
  })(req, res, next);
};

export const login = (req, res, next) => {
  passport.authenticate("local.login", (err, user, info) => {
    console.log(user);
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ success: true, userId: user });
    });
  })(req, res, next);
};

export const getMessages = async (req, res, next) => {
  try {
    const { sender, receiver } = req.body;
    if (!sender || !receiver)
      return next(new ErrorMessage("User Id required!", 400));
    const messages = await Message.find({
      $or: [
        {
          $and: [{ sender }, { receiver }],
        },
        {
          $and: [{ sender: receiver }, { receiver: sender }],
        },
      ],
    });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};
