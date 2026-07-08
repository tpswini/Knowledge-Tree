const axios = require('axios');

const sendPasswordResetEmail = async (toEmail, resetToken, clientUrl) => {
  try {
    const resetLink = `${clientUrl}/reset-password/${resetToken}`;

    const mailOptions = {
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
        </div>
      `,
    };

    if (!process.env.GMAIL_WEBHOOK_URL) {
      console.error('ERROR: GMAIL_WEBHOOK_URL is not defined in .env');
      return { success: false, error: 'Email service is not configured.' };
    }

    await axios.post(process.env.GMAIL_WEBHOOK_URL, {
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    });
    
    console.log(`Password reset email sent to ${toEmail} via Webhook`);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email via webhook:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

module.exports = { sendPasswordResetEmail };
