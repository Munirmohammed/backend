import asyncHandler from 'express-async-handler'
import Product from '../models/productModel.js'
import { fileSizeFormatter } from '../utils/fileUpload.js'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
})

export const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body

  if (!name || !category || !quantity || !price || !description) {
    res.status(404)
    throw new Error('Please fill in all fields')
  }

  let fileData = {}
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: 'MunInvent',
        resource_type: 'image',
      })
    } catch (error) {
      res.status(500)
      throw new Error('Image could not be uploaded')
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    }
  }

  // Create Product
  const product = await Product.create({
    user: req.user.id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: fileData,
  })
  res.status(201).json(product)
})

export const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.user.id }).sort('-createdAt')
  res.status(200).json(products)
})

export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('User not Authorized')
  }
  res.status(200).json(product)
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('User not Authorized')
  }
  await product.remove()
  res.status(200).json({ message: 'Product Deleted Successfully' })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, category, quantity, price, description } = req.body

  const product = await Product.findById(req.params.id)

  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  if (product.user.toString() !== req.user.id) {
    res.status(401)
    throw new Error('User not Authorized')
  }

  let fileData = {}
  if (req.file) {
    // Save image to cloudinary
    let uploadedFile
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: 'MunInvent',
        resource_type: 'image',
      })
    } catch (error) {
      res.status(500)
      throw new Error('Image could not be uploaded')
    }

    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: req.params.id },
    {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    { new: true, runValidators: true }
  )

  res.status(200).json(updatedProduct)
})
