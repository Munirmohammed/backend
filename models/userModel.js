import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a name'],
    },
    email: {
      type: String,
      required: [true, 'Please enter an email'],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please enter a Password'],
      minLength: [6, 'Password must be at least 6 characters'],
      // maxLength: [23, 'Password must not be more than 23 characters'],
    },
    photo: {
      type: String,
      required: [true, 'Please add a photo'],
      default:
        'https://www.google.com/imgres?imgurl=https%3A%2F%2Ft4.ftcdn.net%2Fjpg%2F01%2F97%2F15%2F87%2F360_F_197158744_1NBB1dEAHV2j9xETSUClYqZo7SEadToU.jpg&imgrefurl=https%3A%2F%2Fstock.adobe.com%2Fsi%2Fsearch%3Fk%3Davatar%2520unisex&tbnid=T1ifWjO0TMKudM&vet=12ahUKEwjZoNXex4L7AhXzhM4BHZDiBU8QMygGegUIARDeAQ..i&docid=JemXPkJbgrtzNM&w=461&h=360&q=avatar%20image%20genderless&ved=2ahUKEwjZoNXex4L7AhXzhM4BHZDiBU8QMygGegUIARDeAQ',
    },
    phone: {
      type: String,
      default: '+251',
    },
    bio: {
      type: String,
      default: 'bio',
      maxLength: [300, 'Bio must not exceed 300 characters'],
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(this.password, salt)
  this.password = hashedPassword
  next()
})

const User = mongoose.model('User', userSchema)

export default User
