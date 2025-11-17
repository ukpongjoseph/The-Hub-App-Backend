const express = require("express")
const app = express()
const PORT = 5000 || process.env.PORT
const mongoose = require("mongoose")




const startServer = async () => {
    try {
        const connect = await mongoose.connect(process.env.dbURL, {dbName :"Hub_App"})
        app.listen(PORT, ()=>{
            console.log(`DataBase is connected and server is listening at PORT : ${PORT}`)
            console.log(connect.connections[0].name)
            console.log(connect.connections[0].port)
        })
    } catch (error) {
        console.log("Unable to connect to the server, try again later")
        console.log(error.code)
    }
}

startServer()

module.exports = startServer