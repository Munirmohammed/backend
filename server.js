import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'
import userRoute from './routes/userRoutes.js'
import productRoute from './routes/productRoute.js'
import contactRoute from './routes/contactRoute.js'
import errorHandler from './middleware/errorMiddleware.js'
import cookieParser from 'cookie-parser'
import path from 'path'
dotenv.config()

const __dirname = path.resolve()
const app = express()

//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

//Routes Middleware
app.use('/api/users', userRoute)
app.use('/api/products', productRoute)
app.use('/api/contactus', contactRoute)

app.get('/', (req, res) => {
  res.send('Home Page')
})

//Error Middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`)
    })
  })
  .catch((err) => console.log(err))
