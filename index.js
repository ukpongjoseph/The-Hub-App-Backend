const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const PORT = 5000 || process.env.PORT
const app = express()
const cors = require("cors")
const expressFileUpload = require("express-fileupload")
const cloudinary = require('./Config/cloudinary')
const startServer = require('./Config/mongoDB')
const globalErrorHandler = require("./Middlewares/errorHandler")
const routeNotFound = require("./Utils/routeNotFound")

app.use(express.json())
app.use(cors())
app.use(expressFileUpload({useTempFiles : true}))
app.get("/", (req, res)=>{
    return res.status(200).json({
        success : true,
        msg : "Server is live and listening"
    })
})
app.use(routeNotFound)
app.use(globalErrorHandler)