import bcrypt from "bcrypt";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import prisma from "../utils/prisma.js";
import { generateTokens } from "../utils/tokenGenerator.js";

// Validation schemas
const signupSchema = z.object({
    email: z.email("Invalid email address"),
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

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Google OAuth - Initiate authentication
export const googleAuth = async (req, res) => {
    try {
        const authUrl = googleClient.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            prompt: 'consent'
        });

        return res.status(200).json({
            success: true,
            data: {
                authUrl
            }
        });
    } catch (error) {
        console.error("Google auth initiation error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to initiate Google authentication"
        });
    }
};

// Google OAuth - Callback handler
export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Authorization code is required"
            });
        }

        // Exchange authorization code for tokens
        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        // Verify the ID token and get user info
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user exists with this Google ID
        let user = await prisma.user.findUnique({
            where: { googleId }
        });

        if (!user) {
            // Check if user exists with this email
            user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                // Link Google account to existing user
                user = await prisma.user.update({
                    where: { email },
                    data: { googleId }
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email,
                        googleId,
                        name: name || email.split('@')[0],
                        username: email.split('@')[0] + '_' + Date.now()
                    }
                });
            }
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Set cookies
        res.cookie("accessToken", accessToken, getCookieOptions());
        res.cookie("refreshToken", refreshToken, getCookieOptions(true));

        // Remove password from user object
        const { password, ...userWithoutPassword } = user;

        // Encode user data for URL (we'll pass it to frontend)
        const userData = encodeURIComponent(JSON.stringify(userWithoutPassword));

        // Redirect to frontend with success
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?success=true&token=${accessToken}&user=${userData}`);
    } catch (error) {
        console.error("Google callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}/auth/callback?success=false&error=${encodeURIComponent(error.message)}`);
    }
};

// Google OAuth - Token verification (for frontend)
export const googleTokenAuth = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "ID token is required"
            });
        }

        // Verify the ID token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // Check if user exists with this Google ID
        let user = await prisma.user.findUnique({
            where: { googleId }
        });

        if (!user) {
            // Check if user exists with this email
            user = await prisma.user.findUnique({
                where: { email }
            });

            if (user) {
                // Link Google account to existing user
                user = await prisma.user.update({
                    where: { email },
                    data: { googleId }
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email,
                        googleId,
                        name: name || email.split('@')[0],
                        username: email.split('@')[0] + '_' + Date.now()
                    }
                });
            }
        }

        // Generate JWT tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Set cookies
        res.cookie("accessToken", accessToken, getCookieOptions());
        res.cookie("refreshToken", refreshToken, getCookieOptions(true));

        // Remove sensitive data
        const { password, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            message: "Google authentication successful",
            data: {
                user: userWithoutPassword,
                accessToken
            }
        });
    } catch (error) {
        console.error("Google token auth error:", error);
        return res.status(500).json({
            success: false,
            message: "Google authentication failed"
        });
    }
};
