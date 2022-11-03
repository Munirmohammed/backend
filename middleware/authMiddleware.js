import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import jwt from 'jsonwebtoken'

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token
    // console.log(token)
    if (!token) {
      res.status(401)
      throw new Error('Not authorized, please login')
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(verified.id).select('-password')

    if (!user) {
      res.status(401)
      throw new Error('User not found')
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401)
    throw new Error('Not authorized, please Login')
  }
})
