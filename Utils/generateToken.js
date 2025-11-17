const crypto = require("crypto")

const generateToken = () => {
    return crypto.randomBytes(12).toString("hex")
}

module.exports = generateToken