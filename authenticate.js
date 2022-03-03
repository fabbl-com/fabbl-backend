import jwt from "jsonwebtoken";

const dev = process.env.NODE_ENV !== "production";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev,
  signed: true,
  maxAge: 1000 * 60 * 60 * 24,
  sameSite: "none",
};

export const getToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

export const getRefreshToken = (user) => {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
  return refreshToken;
};
