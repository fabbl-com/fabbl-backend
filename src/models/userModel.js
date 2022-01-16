import mongoose from "mongoose";
import bcrypt from "bcrypt";

// 1===only me, 2===public, 3===friends
const SALT_WORK_FACTOR = 12;

const userSchema = mongoose.Schema(
  {
    uuid: { type: String, unique: true },
    displayName: {
      value: { type: String, unique: false, default: "" },
      status: { type: Number, default: 3 },
    },
    email: { type: String, unique: true },
    isEmailVerifed: { type: Boolean, default: false },
    password: { type: String, default: "", selected: false },
    avatar: {
      value: { type: String, default: "defaultPic.png" },
      status: { type: Number, default: 3 },
    },
    facebook: { type: String, default: "" },
    google: { type: String, default: "" },
    fbTokens: Array,
    sentRequest: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    receivedRequest: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    friendsList: [
      {
        friendId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    blocked: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    headline: {
      value: { type: String, default: "" },
      status: { type: String, default: 2 },
    },
    gender: {
      value: String,
      status: { type: String, default: 2 },
    },
    isProfileVerified: { type: Boolean, default: false },
    dob: {
      value: Date,
      status: { type: String, default: 2 },
    },
    hobby: {
      status: { type: Number, default: 2 },
      value: Array,
    },
    relationshipStatus: {
      status: { type: Number, default: 2 },
      value: { type: String, default: "" },
    },
    city: {
      value: { type: String, default: "" },
      status: { type: Number, default: 3 },
    },
    country: {
      value: { type: String, default: "" },
      status: { type: Number, default: 3 },
    },
    settings: {
      theme: { type: Number, default: 1 }, // 1===dark, 0===light
      autoDelete: { type: Number, default: 10 }, // [10, 20, 15, 5]
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password") || this.isNew) {
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

const User = mongoose.model("User", userSchema);
export default User;