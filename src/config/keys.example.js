const keys = {
  google: {
    clientID: "GOOGLE_CLIENT_ID",
    clientSecret: "GOOGLE_CLIENT_SECRET",
    callbackURL: "/auth/google/callback",
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  },
  facebook: {
    clientID: "FB_CLIENT_ID",
    clientSecret: "FB_CLIENT_SECRET",
    callbackURL: "/auth/facebook/callback/",
  },
  cloudinary: {
    cloud_name: "CLOUDINARY_CLOUD_NAME",
    api_key: "CLOUDINARY_API_KEY",
    api_secret: "CLOUDINARY_API_SECRET",
    PROFILE_URL:
      "https://res.cloudinary.com/CLOUDINARY_CLOUD_NAME/image/upload/v1644833076/fabbl",
  },
  mailingService: {
    refreshToken: "GOOGLE_REFRESH_TOKEN",
    accessToken: "GOOGLE_ACCESS_TOKEN",
    senderEmail: "SENDER_EMAIL",
    redirectURL: "https://developers.google.com/oauthplayground",
  },
  clientURL: "http://localhost:3000",
};

export default keys;
