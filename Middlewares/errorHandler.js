const errorhandler = async(err, req, res, next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Server is down at the moment, check back later"
    return res.status(statusCode).json({
        success : false,
        msg : message
    })
}

module.exports = errorhandler