const keys = {
  google: {
    clientID:
      "530928137960-56f38c22fehk4jjrh6ehqprq1v72h03q.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback",
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
  },
  facebook: {
    clientID: "328135139191854",
    clientSecret: "482736380af34c4f2bfad7e0c649570e",
    callbackURL: "/auth/facebook/callback/",
  },
  cloudinary: {
    cloud_name: "f-12",
    api_key: "563924833231284",
    api_secret: "uwRndvuI9gptLSdIbHdF7SoCHKc",
    PROFILE_URL:
      "https://res.cloudinary.com/f-12/image/upload/v1644833076/fabbl",
  },
  mailingService: {
    refreshToken:
      "1//04SmO6qApIJGBCgYIARAAGAQSNwF-L9IrkmJvfKBF8KtobNU5MCLWtJPBE5fFvdd7n-7wpx-HWf3nbW_EJZ8Ba5dLqegiLxtaSjs",
    accessToken:
      "ya29.A0ARrdaM95I-3cPYZsJnqoLPjrfNzSKIHlsXcn3kBuVxmgnBDKDbo4kmJo5uQyegzXMfGKlx0lOj3cdlvJMomscwZsKdu68DSPVOtUmBszl5jbLENT8ZW9Uz5WQ7Fv5guP0lKbN6qKZhipj8lYwd_qupLBiTGm",
    senderEmail: "ichankabir@gmail.com",
    redirectURL: "https://developers.google.com/oauthplayground",
  },
  clientURL: "http://localhost:3000",
};

export default keys;
