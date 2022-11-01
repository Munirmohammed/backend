import express from 'express'
import {
  getUser,
  loginStatus,
  loginUser,
  logout,
  registerUser,
  updateUser,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'
const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/logout', logout)
router.post('/getuser', protect, getUser)
router.get('/loggedin', loginStatus)
router.patch('/updateuser', updateUser)

export default router
