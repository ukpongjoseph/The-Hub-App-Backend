const express = require("express")
const app = express()
const PORT = 5000 || process.env.PORT
const mongoose = require("mongoose")
require("dotenv").config()




const startServer = async () => {
    try {
        const connect = await mongoose.connect(process.env.dbURL, {dbName :"Hub_App"})
        console.log(`Database is connected, dbName : ${connect.connections[0].name}`)
        console.log(connect.connections[0].port)
        return true
    } catch (error) {
        console.log("Unable to connect to the server, try again later")
        console.log(error.message)
        process.exit(1)
    }
}


module.exports = startServer