import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config({
    path: "./.env"
});

const app = express();

// Enable this for operation ->
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// Middlewares
// -----------------------------------------------------------------------------------------------------------------
// Middleware for express to get items in JSON format
app.use(express.json({ limit: "16kb" }));
// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// Serve static files from the "public" folder
app.use(express.static("public"));
// Cookie parser middleware
app.use(cookieParser());

// -----------------------------------------------------------------------------------------------------------------

// Routes Import
import authRouter from "./routes/auth.route.js";

// Routes Declaration
app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/auth/google", authRouter); // Google OAuth route
// app.use("/api/v1/dashboard",dashboardRoutes)
// Root endpoint to list all available endpoints
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to the API!",
        endpoints: {
            auth: "/api/v1/auth",
        //     content: "/api/v1/content",
        //     tags: "/api/v1/tags",
        //     links: "/api/v1/links",
        },
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});


export default app;