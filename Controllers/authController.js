const mongoose = require("mongoose")
const User = require("../Models/authModel")
const Post = require("../Models/postModel")
const customError = require("../Utils/customeError")
const generateToken = require("../Utils/generateToken")
const {sendResetMail, sendWelcomeMail} = require("../Email/sendEmail")
require("dotenv").config()

const register = async (req, res, next) => {
    try {
        const {firstName, lastName, email, password, role, phoneNumber} = req.body
        if(!firstName || !lastName || !email || !password){
            throw new customError("Please provide the necessary details", 400)
        }
        const existingUser = await User.findOne({email : email})
        if (existingUser){
            throw new customError("Account already exist, please login to continue", 400)
        }
        const verificationToken = generateToken()
        const verificationTokenExpiration = Date.now() + 1000 *  60 * 5
        const clientUrl = `${process.env.FRONTEND_URL}/welcome/${verificationToken}`
        const user = await User.create({
            firstName : firstName,
            lastName : lastName,
            email : email,
            password : password,
            verificationToken : verificationToken,
            verificationTokenExpiration : verificationTokenExpiration,
            role : req.body.role? req.body.role : "user",
            phoneNumber : req.body.phoneNumber? phoneNumber : undefined
        })
        await sendWelcomeMail({
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            clientUrl
        })
        res.status(200).json({
            success : true,
            msg : "Account created successfully",
            user
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}
const login = async (req, res, next) => {
    try {
        const {email, password} = req.body
        if(!email || !password){
            throw new customError("Please provide the necessary details", 400)
        }
        const existingUser = await User.findOne({email : email})
        if(!existingUser){
            throw new customError("No Account found", 404)
        }
        const isPasswordCorrect = await existingUser.confirmPassword(password)
        if(!isPasswordCorrect){
            throw new customError("Invalid Login Credential", 400)
        }
        if(!existingUser.isVerified){
            throw new customError("Account is not verified", 403)
        }
        const token = existingUser.generateJwtToken()
        const body = {
            userId : existingUser._id,
            firstName : existingUser.firstName,
            lastName : existingUser.lastName,
            email : existingUser.email,
            role : existingUser.role,
            phoneNumber : existingUser.phoneNumber,
            bio : existingUser.bio,
            profilePic : existingUser.avatar,
            token
        }
        res.status(200).json({
            success : true,
            msg : "Logged In successfully",
            body
        })
    } catch (error) {
        next(error)
    }
}

const verifyWelcomeMail = async (req, res, next) => {
    try {
        const {regToken} = req.params
        if(!regToken){
            throw new customError("Token Not found", 404)
        }
        const user = await User.findOne({verificationToken : regToken})
        if(!user){
            throw new customError("User Not Found", 404)
        }
        if(user.verificationTokenExpiration < Date.now()){
            throw new customError("Token has expired and has been revoked", 401)
        }
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiration = undefined
        await user.save()
        res.status(200).json({
            success : true,
            msg : "E-mail verification successful"
        })
    } catch (error) {
        next(error)
    }
}

const forgotpassword = async (req, res, next) => {
    try {
        const {email} = req.body
        if(!email){
            throw new customError("Please provide your email address", 400)
        }
        const user = await User.findOne({email : email})
        if(!user){
            throw new customError("Account Not Found", 404)
        }
        const verificationToken = generateToken()
        const clientUrl = `${process.env.FRONTEND_URL}/forgot-password/${verificationToken}`
        const verificationTokenExpiration = Date.now() + 1000 * 60 * 5
        user.verificationToken = verificationToken
        user.verificationTokenExpiration = verificationTokenExpiration
        await user.save()
        await sendResetMail({
            firstName : user.firstName,
            lastName : user.lastName,
            email,
            clientUrl
        })
        res.status(200).json({
            success : true,
            msg : "Forgot Password mail sent successfully"
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {register, login, verifyWelcomeMail}