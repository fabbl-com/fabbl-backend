import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import passportLocalMongoose from "passport-local-mongoose";

// 1===only me, 2===public, 3===friends
const SALT_WORK_FACTOR = 12;

const Session = new mongoose.Schema({
  refreshToken: { type: String, default: "" },
});

const userSchema = mongoose.Schema(
  {
    uuid: { type: String, default: uuidv4() },
    socketID: { type: String, default: "" },
    online: { type: Boolean, default: false },
    displayName: {
      value: { type: String, unique: false, default: "" },
      status: { type: Number, default: 3 },
    },
    email: { type: String, unique: true },
    isEmailVerified: { type: Boolean, default: false },
    password: { type: String, default: "" },
    avatar: {
      value: { type: String, default: "" },
      status: { type: Number, default: 3 },
    },
    facebook: { type: String, default: "" },
    google: { type: String, default: "" },
    fbTokens: Array,
    interaction: {
      sent: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      received: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    matches: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    friends: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        status: String, // sent, received, friends
        _id: false,
      },
    ],
    blocked: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    viewed: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notifications: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        notificationId: String,
        notificationType: String, // liked, matched, got-friend-request, confirmed-friend-request, blocked, unblocked,
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    headline: {
      value: { type: String, default: "" },
      status: { type: String, default: 2 },
    },
    gender: {
      value: Number, // ["male", "female", "others"]
      status: { type: Number, default: 2 },
    },
    isProfileVerified: { type: Boolean, default: false },
    dob: {
      value: Date,
      status: { type: Number, default: 2 },
    },
    hobby: {
      status: { type: Number, default: 2 },
      value: Array,
    },
    relationshipStatus: {
      status: { type: Number, default: 2 },
      value: { type: Number, default: 0 }, // ["single", "commited", "married", "heart-broken"];
    },
    location: {
      value: { type: String, default: "" },
      status: { type: Number, default: 2 },
    },
    settings: {
      theme: { type: Number, default: 1 }, // 1===dark, 0===light
      autoDelete: { type: Number, default: 10 }, // [10, 20, 15, 5]
    },
    publicKey: String,
    privateKey: String,
    lastLogin: { type: Date, default: Date.now },
    isProfileCompleted: { type: Boolean, default: false },
    isTestUser: { type: Boolean, default: false },
    refreshToken: { type: [Session] },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
      if (err) return next(err);

      bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) return next(err);

        this.password = hash;
        next();
      });
    });
  }
});

userSchema.methods.comparePassword = async function (password, next) {
  return bcrypt.compare(password, this.password, (err, isMatched) => {
    if (err) next(err);
    else next(null, isMatched);
  });
};

userSchema.set("toJSON", {
  transform(doc, ret, options) {
    delete ret.refreshToken;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);
export default User;
