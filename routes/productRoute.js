import express from 'express'
import {
  createProduct,
  deleteProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
} from '../controllers/productController.js'
import { protect } from '../middleware/authMiddleware.js'
const router = express.Router()
import { upload } from '../utils/fileUpload.js'

router.post('/', protect, upload.single('image'), createProduct) // multiple sihon upload.array()
router.get('/', protect, getProducts)
router.get('/:id', protect, getSingleProduct)
router.delete('/:id', protect, deleteProduct)
router.patch('/:id', protect, upload.single('image'), updateProduct)

export default router
