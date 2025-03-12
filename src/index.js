import connectDB from "./db/index.js";
import dotenv from "dotenv"
import express from "express"

const app = express()

dotenv.config()





connectDB() // DB connect ho chuka h toh promise bhi return karega toh 
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("DB connection Failed", error)
})




























// YEH BHI EK TARIKA H DB CONNECT KRNE KE LIYE
/*
// IFEE likho
( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error occured", error)
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is running on port ${process.env.PORT}`)
        })
    } catch {
        console.error("Error:", error)
        throw error
    }
})()
    */