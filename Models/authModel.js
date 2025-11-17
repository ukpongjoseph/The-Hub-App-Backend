const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const schemaConstructor = mongoose.Schema
const authSchema = new schemaConstructor({
    firstName : {
        type : String,
        required : [true, "please provide your first name"]
    },
    lastName : {
        type : String,
        required : [true, "please provide your last name"]
    },
    email : {
        type : String,
        required : [true, "please provide an email address"],
        match : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        unique : true,
        index : true
    },
    phoneNumber : {
        type : Number,
        unique : true
    },
    googleId : {
        type : String,
        unique : true
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    password : {
        type : String
    },
    verificationToken : {
        type : String
    },
    verificationTokenExpiration : {
        type : Date
    },
    OTP : {
        type : String
    },
    OTPExpiration : {
        type : Date
    },
    role : {
        type : String,
        required : [true, "You are unauthorized until assigned a role"],
        default : "user",
        enum : ["user", "admin", "superAdmin"]
    },
    bio : {
        type : String,
        required : [true, "Please provide a short description"],
        default : "Active"
    },
    avatar : {
        type : String,
        default : "https://thumbs.dreamstime.com/b/user-profile-d-icon-avatar-person-button-picture-portrait-symbol-vector-neutral-gender-silhouette-circle-photo-blank-272643248.jpg?w=768"
    }
},
    {timestamps : true}
)

authSchema.pre("save", async function(next){
    if(this.isModified("password"))return next()
        const Salt = await bcrypt.genSalt()
        this.password = await bcrypt.hash(this.password, Salt)
        next()
})
authSchema.methods.confirmPassword = async function (userPassword){
    const isCorrect = await bcrypt.compare(userPassword, this.password)
    return isCorrect
}
authSchema.methods.generateToken = function (){
    return (jwt.sign(
        {
            userId : this._id,
            role : this.role,
            firstName : this.firstName,
            lastName : this.lastName,
            email : this.email
        },
        process.env.jwt_secret,
        {
            expiresIn : "30m"
        }
    ))
}

module.exports = mongoose.model("user", authSchema)