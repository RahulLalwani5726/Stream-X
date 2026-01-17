import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Get frontend URL from environment variable (default to localhost for dev)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = [
  FRONTEND_URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ------------------ Routers -------------------

import userRoute from "./routes/user.routes.js";
import videoRoute from "./routes/videos.route.js";
import { tweetRoute } from "./routes/tweets.routes.js";
import { playlistRoute } from "./routes/playlist.route.js";
import { Search } from "./controllers/Search.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";

app.use("/api/v1/users", userRoute);
app.use("/api/v1/Videos", videoRoute);
app.use("/api/v1/playlist", playlistRoute);
app.use("/api/v1/tweets", tweetRoute);

app.get("/api/v1/public/search", verifyJWT, Search);

export { app };
