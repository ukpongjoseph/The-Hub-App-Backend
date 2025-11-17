const customError = require("./customeError")

const routeNotFound = (req, res) => {
    throw new customError("Route Not Found", 404)
}

module.exports = routeNotFound