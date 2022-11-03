import nodemailer from 'nodemailer'

export const sendEmail = async (
  subject,
  message,
  send_to,
  sent_from,
  reply_to
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 587, false for other ports
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  // const transporter = nodemailer.createTransport({
  //   service: process.env.EMAIL_HOST,
  //   // port: 587,
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  //   tls: {
  //     rejectUnauthorized: false,
  //   },
  // })

  const optiions = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: message,
  }

  transporter.sendMail(optiions, function (err, info) {
    if (err) {
      console.log(err)
    } else {
      console.log(info)
    }
  })
}
