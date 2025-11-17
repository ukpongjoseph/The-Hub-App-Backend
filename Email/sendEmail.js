const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()
const customError = require("../Utils/customeError")
const {welcomeMail, resetMail} = require("./emailTemplate")

const mailSender = async ({to, subject, html}) => {
    const transporter = nodemailer.createTransport({
        service : "gmail",
        secure : true,
        auth : {
            user : process.env.EMAIL,
            pass : process.env.PASSWORD
        }
    })

    const mailOption = {
        from : process.env.EMAIL,
        to : to,
        html : html,
        subject : subject
    }

    try {
        const sendMailMethod = await transporter.sendMail(mailOption)
    } catch (error) {
        nextTick(error)
    }
}

const sendWelcomeMail = async ({firstName, lastName, email, clientUrl})=>{
    const subject = "WELCOME TO THE HUB APP"
    const html = welcomeMail({firstName, lastName, clientUrl})
    await mailSender({to : email, subject, html})
}

const sendResetMail = async ({firstName, lastName, email, clientUrl})=>{
    const subject = "WELCOME TO THE HUB APP"
    const html = resetMail({firstName, lastName, clientUrl})
    await mailSender({to : email, subject, html})
}

module.exports = {sendResetMail, sendWelcomeMail}