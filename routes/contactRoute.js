import express from 'express'
import { contactUs } from '../controllers/contactController.js'
import { protect } from '../middleware/authMiddleware.js'
const router = express.Router()

router.post('/', protect, contactUs)

export default router
