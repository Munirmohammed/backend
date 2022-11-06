import expressAsyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import { sendEmail } from '../utils/sendEmail.js'

export const contactUs = expressAsyncHandler(async (req, res) => {
  const { subject, message } = req.body
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(400)
    throw new Error('User not found, Please Sign Up')
  }

  if (!subject || !message) {
    res.status(400)
    throw new Error('Please add a subject and a message')
  }

  const send_to = process.env.EMAIL_USER
  const sent_from = user.email
  const reply_to = user.email
  try {
    await sendEmail(subject, message, send_to, sent_from, reply_to)
    res.status(200).json({ success: true, message: 'Email Sent' })
  } catch (error) {
    console.log(error)
    res.status(500)
    throw new Error('Email not sent, Please try again! ')
  }
})
