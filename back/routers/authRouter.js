import express from "express"
import { AuthController } from "../controllers/authController.js"

const authRouter = express.Router()


authRouter.post("/auth", AuthController)

export default authRouter
