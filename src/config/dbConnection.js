import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let DB_URL;
if (process.env.NODE_ENV === "production") DB_URL = process.env.DB_PROD_URL;
else DB_URL = process.env.DB_DEV_URL;

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected!"))
  .catch((err) => console.log(err));

mongoose.connection.on(
  "error",
  console.error.bind(console, "____mongoDB connection error____")
);
