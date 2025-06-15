import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import connectDB from "./utils/connectDb.js"
import authRouter from "./routers/authRouter.js"
import communityRouter from "./routers/communityRouter.js"

// Load environment variables
dotenv.config();

const app = express()

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRouter)
app.use("/api/community", communityRouter)

connectDB()

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