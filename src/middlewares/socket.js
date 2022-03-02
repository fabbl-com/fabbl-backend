import { changeUserOnline, addSocketID } from "../socket/socketControllers.js";
import ErrorMessage from "../utils/errorMessage.js";

export const initializeSocket = async (socket, next) => {
  try {
    const { userId } = await socket.request._query;
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
    if (res1 && res2) return next();
  } catch (error) {
    next(error || new ErrorMessage("Error", 400));
  }
};

export const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);
