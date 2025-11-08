import dotenv from 'dotenv/config'
import connectDB from "./db/index.js";
import { app } from './app.js';

// dotenv.config({
//     path: './.env'
// })

const port = process.env.PORT || 8000
connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log('server error: ', error)
        })
        app.listen(port, () => {
            console.log(`server listening on ${port}`)
        })
    })
    .catch((err) => console.log("MONGO db connection failed", err))