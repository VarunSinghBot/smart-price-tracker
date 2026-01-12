import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../utils/prisma.js";
import { generateTokens } from "../utils/tokenGenerator.js";

// Validation schemas
const signupSchema = z.object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    name: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

const loginSchema = z.object({
    emailOrUsername: z.string().min(1, "Email or username is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional()
});

// Cookie options
const getCookieOptions = (rememberMe = false) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 30 days or 7 days
});

// Signup controller
export const signup = async (req, res) => {
    try {
        // Validate request body
        const validatedData = signupSchema.parse(req.body);
        // console.log("Validated signup data:", validatedData);

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.email },
                    { username: validatedData.username }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === validatedData.email) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered"
                });
            }
            if (existingUser.username === validatedData.username) {
                return res.status(400).json({
                    success: false,
                    message: "Username already taken"
                });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: validatedData.email,
                username: validatedData.username,
                password: hashedPassword,
                name: validatedData.name || validatedData.username
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                createdAt: true
            }
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Set cookies
        res.cookie("accessToken", accessToken, getCookieOptions());
        res.cookie("refreshToken", refreshToken, getCookieOptions(true));

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            data: {
                user,
                accessToken
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.errors
            });
        }

        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Login controller
export const login = async (req, res) => {
    try {
        // Validate request body
        const validatedData = loginSchema.parse(req.body);

        // Find user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: validatedData.emailOrUsername },
                    { username: validatedData.emailOrUsername }
                ]
            }
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Set cookies
        res.cookie("accessToken", accessToken, getCookieOptions(validatedData.rememberMe));
        res.cookie("refreshToken", refreshToken, getCookieOptions(true));

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userWithoutPassword,
                accessToken
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: error.errors
            });
        }

        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Logout controller
export const logout = async (req, res) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get current user controller
export const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Google OAuth controller (placeholder for future implementation)
export const googleAuth = async (req, res) => {
    try {
        const { googleToken } = req.body;

        // TODO: Implement Google OAuth verification
        // 1. Verify Google token
        // 2. Get user info from Google
        // 3. Check if user exists with googleId
        // 4. If not, create new user
        // 5. Generate JWT tokens
        // 6. Return user data and tokens

        return res.status(501).json({
            success: false,
            message: "Google authentication not yet implemented"
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
