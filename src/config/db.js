import mongoose from "mongoose";

const connectDB = (DB_URL) => {
  const connect = mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connect
    .then(() => console.log("connected to db"))
    .catch((err) => console.log(err));
};

export default connectDB;
