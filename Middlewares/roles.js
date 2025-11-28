const customError = require("../Utils/customeError")


const verifyRole = async (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            throw new customError("You are unathorized to perform this action", 403)
        }
        next()
    }
    
}

module.exports = verifyRole