import dotenv from 'dotenv'
import connectDB from './src/db/index.js'
import { app } from './src/app1.js'

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("Established connection through PORT", process.env.PORT)
    })
})
.catch((e)=>{
    app.on("error",(e)=>{
        console.log("Error:" ,e)
    })
    console.log("MongoDb connection has failed", e)
})