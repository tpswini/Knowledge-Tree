const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (toEmail, resetToken, clientUrl) => {
  try {
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
      },
      // Force IPv4 because Render sometimes has issues routing IPv6 to Gmail
      family: 4 
    });

    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Knowledge Tree" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Password Reset Request - Knowledge Tree',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #1a472a; text-align: center;">Knowledge Tree</h2>
          <h3 style="color: #333;">Password Reset</h3>
          <p style="color: #555; line-height: 1.5;">
            You requested a password reset for your Knowledge Tree account. Click the button below to reset your password. This link is valid for 15 minutes.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #1a472a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #777; font-size: 12px; margin-top: 30px; text-align: center;">
            If you did not request a password reset, please ignore this email.
          </p>
          <p style="color: #777; font-size: 12px; text-align: center;">
            Alternatively, copy and paste this link in your browser: <br/>
            <a href="${resetLink}" style="color: #1a472a;">${resetLink}</a>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${toEmail}: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message || 'Configuration error' };
  }
};

module.exports = { sendPasswordResetEmail };
