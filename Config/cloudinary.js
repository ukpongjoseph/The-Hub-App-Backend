const dotenv = require("dotenv")
dotenv.config()
const cloudinary = require("cloudinary").v2

cloudinary.config({
    api_secret: process.env.API_SECRET,
    api_key: process.env.API_KEY,
    cloud_name : process.env.CLOUD_NAME
})

module.exports = cloudinary