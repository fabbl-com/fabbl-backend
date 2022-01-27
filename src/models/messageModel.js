import mongoose from "mongoose";

// const messageSchema = mongoose.Schema({
//   text: { type: String },
//   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   isRead: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now },
// });

const messageSchema = mongoose.Schema({
  clients: [mongoose.Types.ObjectId],
  message_id: String,
  messages: [
    {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

messageSchema.pre("save", (next) => {
  // encrypt msg
  next();
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
