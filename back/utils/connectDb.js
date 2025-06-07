import mongoose from "mongoose"

export default function connectDB(){

    mongoose.connect("mongodb://localhost:27017/flowers")
    .then(() => console.log("Conected to DB"))
    .catch(err => console.log(err))

}