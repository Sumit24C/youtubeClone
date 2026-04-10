import 'dotenv/config';
import "./utils/passport.js";
import connectDB from "./db/index.js";
import { app } from './app.js';

const port = Number(process.env.PORT) || 8000
connectDB()
    .then(() => {
        const server = app.listen(port, () => {
            console.log(`server listening on ${port}`)
        });
        server.on('error', (error: Error) => {
            console.log('server error: ', error);
        });
    })
    .catch((err: Error) => {
        console.log("MONGO db connection failed", err);
        process.exit(1);
    })