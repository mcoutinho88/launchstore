const nodemailer = require('nodemailer')

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "f4a2cf2d009269",
      pass: "8bfaf7882ddd63"
    }
  });

