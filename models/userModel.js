import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
})

const User = mongoose.model('User', userSchema)

export default User
