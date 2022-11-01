import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import bcrpt from 'bcryptjs'

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
    secure: false,
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
    secure: false,
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
    secure: false,
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
  res.send('User Update')
})
