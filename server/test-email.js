require('dotenv').config();
const { sendPasswordResetEmail } = require('./src/utils/emailService');

(async () => {
  console.log("Testing email configuration...");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "****" : "NOT SET");
  
  const success = await sendPasswordResetEmail('test@example.com', 'dummy_token', 'http://localhost');
  if (success) {
    console.log("Email sent successfully!");
  } else {
    console.log("Email failed to send.");
  }
})();
