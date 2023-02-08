const  mongoose = require('mongoose')
// const MongoClient = require('mongoose')
require("dotenv").config();

let URL = process.env.DBURI

const start = ()=>{
    mongoose.connect(URL)
    mongoose.connection.on(
        "error",()=>{
            console.log("Error Connecting DB")
        }
    )
    mongoose.connection.once(
        "Connection_OK",()=>{
            console.log('DB Connnected')
        }
    )
}

module.exports = {start}