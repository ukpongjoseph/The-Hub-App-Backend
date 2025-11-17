const express = require("express")
const router = express.Router()
const {register, login, verifyWelcomeMail} = require("../Controllers/authController")

router.post("/register", register)
router.post("/login", login)
router.post("/verify_welcome_mail/:regToken", verifyWelcomeMail)

module.exports = router