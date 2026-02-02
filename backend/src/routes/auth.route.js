import express from "express";
import { 
    signup, 
    login, 
    logout, 
    getCurrentUser, 
    googleAuth,
    googleCallback,
    googleTokenAuth
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Google OAuth routes
router.get("/google", googleAuth); // Initiate Google OAuth
router.get("/google/callback", googleCallback); // OAuth callback
router.post("/google/token", googleTokenAuth); // Verify Google token from frontend

// Protected routes
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
