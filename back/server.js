import express from "express"
import cors from "cors"


import connectDB from "./utils/connectDb.js"
import authRouter from "./routers/authRouter.js"
import communityRouter from "./routers/communityRouter.js"

const app = express()


app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173', // Vite's default port
  credentials: true
}))

connectDB()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use("/api/auth", authRouter)
app.use("/api/community", communityRouter)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/api/health`)
})