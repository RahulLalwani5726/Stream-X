import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: 'https://stream-h4ys2uv7g-rahul-lalwanis-projects-8a8f6f82.vercel.app',
    credentials: true
}));


app.use(express.json(
    {
        limit: "16kb" 
    }
)) 

app.use(express.urlencoded(
    {
        extended:true,
        limit:"16kb"
    }
))

app.use(
    express.static("public")
)

app.use(cookieParser())

// +++++++++++++++++++++++ routers ++++++++++++++++++++++++++++++++++++++++++++++++++++

import userRoute from "./routes/user.routes.js";
import videoRoute from "./routes/videos.route.js";
import { tweetRoute } from "./routes/tweets.routes.js";
import { playlistRoute } from "./routes/playlist.route.js";
import { Search } from "./controllers/Search.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";

app.use("/api/v1/users",userRoute);
app.use("/api/v1/Videos",videoRoute);
app.use("/api/v1/playlist",playlistRoute);
app.use("/api/v1/tweets",tweetRoute);

app.get("/api/v1/public/search", verifyJWT , Search);

export {app};
