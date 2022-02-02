import nodemailer from "nodemailer";
import { google } from "googleapis";
import keys from "../config/keys.js";

const { OAuth2 } = google.auth;

const { refreshToken, senderEmail, redirectURL } = keys.mailingService;

const oauth2Client = new OAuth2(
  keys.google.clientID,
  keys.google.clientSecret,
  refreshToken,
  redirectURL
);

const sendMail = (to, url, mailType) =>
  new Promise((resolve, reject) => {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const accessToken = oauth2Client.getAccessToken();

    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: senderEmail,
        clientId: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        refreshToken,
        accessToken,
      },
    });

    const mailContents = {
      activate: {
        msg1: "validate your email address",
        msg2: "Verify Email",
      },
      reset: {
        msg1: "reset your password",
        msg2: "Reset Password",
      },
    };

    const mailOptions = {
      from: senderEmail,
      to,
      subject: "Verify Email",
      html: `
							<div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
								<h2 style="text-align: center; text-transform: uppercase;color: teal;">
									thank you for being a part of Fabbl
								</h2>
								<p>
									Congratulations! You're almost set to start using Fabbl. Just click the button below to ${mailContents[mailType].msg1}. 
								</p>
							
								<a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">
									${mailContents[mailType].msg2}
								</a>
					
								<p>
									If the button doesn't work for any reason, you can  &nbsp;
									<a href=${url} target="_blank" style="background: #11324D; color: #eee; text-decoration: none ">
										Click here
									</a>
								</p>
							</div>
					`,
      text: `Click here to verify your account ${url}`,
    };

    smtpTransport.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      if (!info) return resolve(false);
      console.log(`Email sent: ${info.response}`);
      resolve(true);
    });
  });

export default sendMail;
