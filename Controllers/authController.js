const mongoose = require("mongoose")
const User = require("../Models/authModel")
const Post = require("../Models/postModel")
const customError = require("../Utils/customeError")
const generateToken = require("../Utils/generateToken")
const {sendResetMail, sendWelcomeMail} = require("../Email/sendEmail")
require("dotenv").config()
const cloudinary = require("cloudinary").v2
const fs = require("fs")

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

const forgotPassword = async (req, res, next) => {
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

const updateProfile = async (req, res, next) => {
    try {
        const {firstName, lastName, email, phoneNumber, bio} = req.body
        const {avatar} = req.files
        const {userId} = req.user
        const user = await User.findById(userId)
        if(!user){
            throw new customError("User not found", 404)
        }
        if(firstName){
            user.firstName = firstName
        }
        if(lastName){
            user.lastName = lastName
        }
        // This aspect of email update will require an OTP but for now, it would run without OTP until OTP integration is done on the project
        if(email){
            user.email = email
        }
        // This aspect of phone Number update will require an OTP but for now, it would run without OTP until OTP integration is done on the project
        if(phoneNumber){
            user.phoneNumber = phoneNumber
        }
        if(bio){
            user.bio = bio
        }
        if(avatar){
            const ImageObject = cloudinary.uploader.upload(
                req.files.avatar.tempFilePath,
                {
                    use_filename : true,
                    folder : "THE-HUB-APP-GALLERY",
                    resource_type : "image"
                }
            )
            const ImageUrl = (await ImageObject).secure_url
            fs.unlink(req.files.avatar.tempFilePath, (err) => {
                if(err){
                    throw new customError(`Error Uploading media, try again later : ${err.message}`, 503)
                }
            })
            user.avatar = ImageUrl

        }
        user.save()
        res.status(200).json({
            success : true,
            msg : "User profile Updated successfully",
            userId : user._id,
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            role : user.role,
            phoneNumber : user.phoneNumber,
            bio : user.bio,
            profilePic : user.avatar,
        })
    } catch (error) {
        next(error)
    }
}

const resetPasswordMail = async (req, res, next) => {
    try {
        const {resetToken} = req.params
        const {password} = req.body
        const user = await User.findOne({verificationToken : resetToken})
        if(!user){
            throw new customError("User Not Found", 404)
        }
        if(user.verificationTokenExpiration < Date.now()){
            throw new customError("Your reset password Token is expired", 401)
        }
        if(!password){
            throw new customError("Please provide your password", 400)
        }
        user.password = password
        user.verificationToken = undefined
        user.verificationTokenExpiration = undefined
        user.save()
        return res.status(200).json({
            success : true,
            msg : "Password reset Successful, go back to login"
        })
    } catch (error) {
        next(error)
    }
}

const deleteAUser = async (req, res, next) => {
    try {
        const {userId} = req.params
        if(!userId){
            throw new customError("Provide User Id", 400)
        }
        const userToBeDeleted = await User.findById(userId)
        if(!userToBeDeleted){
            throw new customError("User Not Found", 404)
        }
        await User.findByIdAndDelete(userId)
        res.status(200).json({
            success : true,
            msg : "User deleted successfully"
        })
    } catch (error) {
        next(error)
    }
}

const getAUser = async (req, res , next) => {
    try {
        const {userId} = req.params
        const user = await User.findById(userId)
        if(!user){
            throw new customError("User Not Found", 404)
        }
        res.status(200).json({
            success : true,
            msg : "User Found",
            user
        })
    } catch (error) {
        next(error)
    }
}

const getAllUsers = async (req, res, next) => {
    try {

        const totalNumberOfAllUsers = await User.countDocuments()
        const limit = parseInt(req.query.limit) || 10
        const totalNumberOfpages = Math.ceil(totalNumberOfAllUsers/limit)
        let page = parseInt(req.query.page) || 1
        if(page > totalNumberOfpages){
            page = ((page - 1) % totalNumberOfpages) + 1
        }else if(page == 0){
            page = totalNumberOfpages
        }
        else if(page < 1){
            page = (page % totalNumberOfpages) + totalNumberOfpages + 1
        }
        const pagesToSkip = page - 1 

        // The idea for the skip also called as offset is that if i have 10 document per page and i want document number 45. i know that what is want is beyond 10, 20, 10, 40...all this makes it 4 skips showing that the document is on page 5. Note that page is 5, and we skipped 4 pages which are the pagesToSkip...so we are ignoring the first 40 documents making the search faster 
        const skip = pagesToSkip * limit

        const allUsers = await User
        .find()
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .exec()
        res.status(200).json({
            success : true,
            msg : "Users fetched successfully",
            allUsers
        })
    } catch (error) {
        next(error)
    }
}

const getUsersAllPost = async (req, res, next) => {
    try {
        const {userId} = req.user
        let page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const totalNumberOfUsersPosts = await Post.countDocuments({author : userId})
        const totalNumberOfpages = Math.ceil(totalNumberOfUsersPosts/limit)
        if(totalNumberOfpages == 0){
            res.status(200).json({
                success : true,
                msg : "No Post Found"
            })
        }
        if(page > totalNumberOfpages){
            page = ((page - 1) % totalNumberOfpages) + 1
        }else if (page == 0){
            page = totalNumberOfpages
        }
        else if(page < 1){
            page = (page % totalNumberOfpages) + totalNumberOfpages + 1
        }
        const pagesToSkip = page - 1
        const skip = pagesToSkip * limit
        const allPostByUser = await Post
        .find({author : userId})
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .exec()
        res.status(200).json({
            success : true,
            msg : "All Post fetched successfully",
            allPostByUser
        })
    } catch (error) {
        next(error)
    }
}

const getAllPostsLikedByUser = async (req, res, next) => {
    try {
        const {userId} = req.user
        const user = await User.findById(userId)
        if(!user){
            throw new customError("User Not Found", 404)
        }
        const allLikedPosts = user.likedPosts
        if(allLikedPosts.length < 1){
            res.status(200).json({
                success : true,
                msg : "You do not have nay liked post"
            })
        }
        res.status(200).json({
            success : true,
            msg : "All liked post fetched successfully",
            allLikedPosts
        })
    } catch (error) {
        next(error)
    }
}

const getAllPostsCommentedOnByUser = async (req, res, next) => {
    try {
        // const {postId, commentId} = req.params
        const {userId} = req.user
        const user = await User.findById(userId)
        if(!user){
            throw new customError("User Not Found", 404)
        }
        const allPostsCommentedOn = user.getAllPostsCommentedOnByUser
        if(allPostsCommentedOn.length < 1){
            res.status(200).json({
                success : true,
                msg : "All Post commented on by the user fetched successfully",
                allPostsCommentedOn
            })
        }
    } catch (error) {
        next(error)
    }
}

const getAPostCreatedByUser =async (req, res, next) => {
    try {
        const {userId} = req.user
        const {postId} = req.params
        const post = await Post.findOne({author : userId, _id : postId})
        if(!post){
            throw new customError("Post Not Found", 404)
        }
        res.status(200).json({
            success : true,
            msg : "Post Fetched successfully",
            post
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {register, login, verifyWelcomeMail, forgotPassword, updateProfile, resetPasswordMail, deleteAUser, getAllUsers, getAUser, getAllPostsCommentedOnByUser, getAPostCreatedByUser, getAllPostsLikedByUser, getUsersAllPost}