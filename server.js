import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import cors from 'cors'
import userRoute from './routes/userRoutes.js'
import errorHandler from './middleware/errorMiddleware.js'
import cookieParser from 'cookie-parser'
dotenv.config()

const app = express()

//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Routes Middleware
app.use('/api/users', userRoute)

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
