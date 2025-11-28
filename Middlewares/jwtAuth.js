const jwt = require("jsonwebtoken")
const customError = require("../Utils/customeError")
require("dotenv").config()


const jwtAuth = async (req, res, next) => {
    try {
        const webToken = req.headers.auhtorization
        if(!webTokenoken || !webToken.startsWith("Bearer ")){
            throw new customError("Token not found", 404)
        }
        const token = webToken.split(" ")[1]
        const decoded = jwt.verify(token, process.env.jwt_secret)
        if(!decoded){
            throw new customError("Access Denied", 401)
        }
        req.user = decoded
        next()
    } catch (error) {
        // if statement is to re-write the error message for better user readability
        if(error.message === "jwt expired"){
            res.status(401).json({succes : false, msg : "Your Token has Expired, LogIn Back to gain access"})
        }
        // this line re-writes the status code to 403 instead of 500 (due to the errorHandler middleware)
        if(error.message === "invalid token"){
            res.status(401).json({success : false, msg : "invalid token"})
        }
        // this line re-writes the status code to 403 instead of 500 (due to the errorHandler middleware)
        if(error.message === "jwt must be provided"){
            res.status(401).json({success : false, msg : "Please provide a valid token"})
        }
        next(error)
    }
}

module.exports = jwtAuth