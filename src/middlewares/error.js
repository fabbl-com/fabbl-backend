import ErrorMessage from "../utils/errorMessage.js";

const handleError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  if (err.code === 11000) {
    const message = "Duplicate Field Value Entered";
    error = new ErrorMessage(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorMessage(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, message: error.message || "something went wrong" });
};

export default handleError;
