"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config/config"));
const services_1 = require("../../services");
const sendEmail = async (userId, email, resetToken, resetTokenExpiration) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: config_1.default.EMAIL,
            pass: config_1.default.APP_PASSWORD,
        },
    });
    const user = await services_1.userService.getUserById(userId);
    const userName = user?.name;
    const logoUrl = "D:Book.D\backendsrcpublicsiteLogo.png";
    const resetLink = `${config_1.default.API_URL}/reset-password?token=${resetToken}&email=${email}&expires=${resetTokenExpiration}`;
    const info = await transporter.sendMail({
        from: '"Book.D" <krishnamidhuna850@gmail.com>',
        to: email,
        subject: "Important: Reset Your Book.D Account Password",
        html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <div style="max-width: 600px; margin: auto; border: 1px solid #dddddd; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
             
              <h2 style="color: #333333;">Reset Your Book.D Account Password</h2>
              <p style="color: #666666;">
                  Hello, <strong style="font-size: 16px;">${userName}</strong>.
              </p>
              <p style="color: #666666;">
                  We received a request to reset the password for your Book.D account. Please note that the password reset link is only valid for the next two hours.
              </p>
              <p style="color: #666666;">
                  To reset your password and regain access to your account, please click the link below:
              </p>
              <a href="${resetLink}" target="_blank" style="display: inline-block; margin: 20px 0; padding: 10px 20px; color: white; background-color: green; border-radius: 5px; text-decoration: none;">Reset Password</a>
              <p style="color: #666666;">
                  If you did not request this password reset, please ignore this email. Your password will remain unchanged, and your account will stay secure.
              </p>
              <p style="color: #666666;">
                  Thank you for using Book.D, your go-to platform for sharing, renting, and discovering books!
              </p>
              <hr style="border: none; border-top: 1px solid #dddddd; margin: 20px 0;" />
              <p style="color: #999999;">
                  This message was sent from Book.D.
              </p>
          </div>
      </div>
      `,
    });
    return info;
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=sendEmail.js.map