import Users from "../models/UserSchema.js"
import bcrypt from "bcrypt"

export const AuthController = async (req, res) => {
  const { type, name, email, password } = req.body

  try {
    if (type === 'signup') {
      const existingUser = await Users.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await Users.create({
        name,
        email,
        password: hashedPassword,
      })

      return res.status(201).json({ message: 'Account created successfully!', userId: newUser._id , url : `/flowers/${newUser._id}`})
    }

    else if (type === 'login') {
      const user = await Users.findOne({ email })
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }

      return res.status(200).json({
        message: 'Login successful',
        userId: user._id,
        email: user.email,
        url : `/flowers/${user._id}`
      })
    }

    else {
      return res.status(400).json({ message: 'Invalid request type' })
    }
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
