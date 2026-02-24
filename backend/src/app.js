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
import productRouter from "./routes/product.route.js";
import scraperRouter from "./routes/scraper.route.js";
import alertRouter from "./routes/alert.route.js";

// Middleware Import
import { errorHandler } from "./middlewares/error.middleware.js";

// Routes Declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/scraper", scraperRouter);
app.use("/api/v1/alerts", alertRouter);

// Root endpoint to list all available endpoints
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Smart Price Tracker API!",
        version: "1.0.0",
        endpoints: {
            auth: "/api/v1/auth",
            products: "/api/v1/products",
            scraper: "/api/v1/scraper",
            alerts: "/api/v1/alerts",
            health: "/health"
        },
        documentation: "For detailed API documentation, visit /api/docs (coming soon)"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;