import express from "express"
import cors from "cors"


import connectDB from "./utils/connectDb.js"
import authRouter from "./routers/authRouter.js"

const app = express()


app.use(express.json())
app.use(cors())

connectDB()

app.use("/", authRouter)




app.listen(3000, () => console.log("app is listening on port 3000"))