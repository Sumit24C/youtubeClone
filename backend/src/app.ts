import path from "path"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";

const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
    app.use("/api", morgan("dev"));
}

const limiter = rateLimit({
    limit: 300,
    windowMs: 30 * 60 * 1000,
    message: "We have recieved too many requests. please try after one hour."
});

//routes import
import userRouter from './routes/user.route.js'
import oauthRouter from "./routes/oauth.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import uploadRouter from "./routes/upload.route.js"
import commentRouter from "./routes/comment.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import viewRouter from "./routes/view.route.js"

//routes declaration

app.use("/api", limiter);
app.use("/api/v1/users", userRouter)
app.use("/api/v1/auth", oauthRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/upload", uploadRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/views", viewRouter)

app.get("/", (req, res) => {
    res.send({ message: "server working" })
});

import errorHandler from "./middlewares/error.middleware.js"
app.use(errorHandler)

export { app }