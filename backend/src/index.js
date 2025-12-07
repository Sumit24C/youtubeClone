import 'dotenv/config';
import passport from "./utils/passport.js";
import connectDB from "./db/index.js";
import { app } from './app.js';

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