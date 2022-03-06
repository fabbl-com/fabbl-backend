import jwt from "jsonwebtoken";
import { changeUserOnline, addSocketID } from "../socket/socketControllers.js";
import ErrorMessage from "../utils/errorMessage.js";

export const initializeSocket = async (socket, next) => {
  try {
    const { accessToken } = socket.handshake.auth;
    if (accessToken) {
      const payload = jwt.verify(accessToken, process.env.JWT_SECRET);
      const userId = payload._id;
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
    }
    next();
  } catch (error) {
    next(error || new ErrorMessage("Error", 400));
  }
};

export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
