/* eslint-disable no-eval */
import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev,
  signed: true,
  maxAge: 1000 * 60 * 60 * 30,
  sameSite: "none",
};

export const getTokens = ({ _id, rememberMe }) => {
  const refreshToken = jwt.sign({ _id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: rememberMe ? "7d" : eval(process.env.REFRESH_TOKEN_EXPIRY),
  });
  const accessToken = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? "30d" : eval(process.env.ACCESS_TOKEN_EXPIRY),
  });

  return { accessToken, refreshToken };
};
