require('dotenv').config();
const { forgotPassword } = require('./src/controllers/authController');

const req = { body: { email: 'itshannahhanson@gmail.com' } };
const res = {
  status: (code) => {
    console.log("Status:", code);
    return {
      json: (data) => console.log("JSON:", data)
    };
  }
};

(async () => {
  try {
    await forgotPassword(req, res);
  } catch (error) {
    console.error("Uncaught exception:", error);
  }
})();
