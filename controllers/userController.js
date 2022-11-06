import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrpt from 'bcryptjs'
import Token from '../models/tokenModel.js'
import crypto from 'crypto'
import { sendEmail } from '../utils/sendEmail.js'

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

//REGISTER USER

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  //validation
  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Please fill in all required fields')
  }
  if (password.length < 6) {
    res.status(400)
    throw new Error('Please password must be at least 6 characters')
  }

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  //create new User
  const user = await User.create({
    name,
    email,
    password,
  })

  const token = generateToken(user._id)

  //send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    // secure: false,
  })

  if (user) {
    const { _id, name, email, photo, phone, bio } = user
    res.status(201).json({ _id, name, email, photo, phone, bio, token })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

//LOGIN USER

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Please enter email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    res.status(400)
    throw new Error('User not found, Please Sign up')
  }

  const passwordIsCorrect = await bcrpt.compare(password, user.password)

  const token = generateToken(user._id)

  //send HTTP-only cookie
  res.cookie('token', token, {
    path: '/',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: 'none',
    // secure: false,
  })

  if (user && passwordIsCorrect) {
    const { _id, name, email, photo, phone, bio } = user
    res.status(200).json({ _id, name, email, photo, phone, bio, token })
  } else {
    res.status(400)
    throw new Error('Invalid email or password')
  }
})

//LOGOUT USER
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    // secure: false,
  })
  return res.status(200).json({ message: 'Successfully Logged Out' })
})

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { _id, name, email, photo, phone, bio } = user
    res.status(200).json({ _id, name, email, photo, phone, bio })
  } else {
    res.status(400)
    throw new Error('User not found')
  }
})

export const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token

  if (!token) {
    return res.json(false)
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET)
  if (verified) {
    return res.json(true)
  }
  return res.json(true)
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    const { name, email, photo, phone, bio } = user
    user.email = email
    user.name = req.body.name || name
    user.phone = req.body.phone || phone
    user.bio = req.body.bio || bio
    user.photo = req.body.photo || photo

    const updatedUser = await user.save()

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  const { oldPassword, newPassword } = req.body

  if (!user) {
    res.status(400)
    throw new Error('User not found, Please Sign Up')
  }

  if (!oldPassword || !newPassword) {
    res.status(400)
    throw new Error('Please enter old and new password')
  }

  const correctPassword = await bcrpt.compare(oldPassword, user.password)

  if (user && correctPassword) {
    user.password = newPassword
    await user.save()
    res.status(200).send('Password updated successfully')
  } else {
    res.status(400)
    throw new Error('Old Password is incorrect')
  }
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User does not exist')
  }

  let token = await Token.findOne({ userId: user._id })
  if (token) {
    await token.deleteOne()
  }

  let resetToken = crypto.randomBytes(32).toString('hex') + user._id
  console.log(resetToken)

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), //30 mins
  }).save()

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

  const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>
    <p>This reset link is valid for only <b>30 minutes</b></p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    <p>Regards ...</p>
    <p>MunInvent Munir Corporations</p>
    `
  const subject = 'Password reset request'
  const send_to = user.email
  const sent_from = process.env.EMAIL_USER

  try {
    await sendEmail(subject, message, send_to, sent_from)
    res.status(200).json({ success: true, message: 'Reset Email Sent' })
  } catch (error) {
    console.log(error)
    res.status(500)
    throw new Error('Email not sent, Please try again! ')
  }
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body
  const { resetToken } = req.params

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  })

  if (!userToken) {
    res.status(404)
    throw new Error('Invalid or Expired Token')
  }

  const user = await User.findOne({ _id: userToken.userId })
  user.password = password
  await user.save()
  res.status(200).json({ message: 'Password reset Successful, Please Login' })
})
