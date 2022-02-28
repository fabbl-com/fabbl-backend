import Message from "../models/messageModel.js";
import ErrorMessage from "../utils/errorMessage.js";

export const deleteMessage = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    if (!messageId)
      return next(new ErrorMessage("Cannot delete messages", 400));
    const result = await Message.deleteOne({ message_id: messageId });
    console.log(result);
    res
      .status(200)
      .json({ success: true, messageId, messages: [], isDeleted: true });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
