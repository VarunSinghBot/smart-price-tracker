import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

// Middleware to verify JWT token
export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized request - No token provided" 
            });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.id },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                googleId: true
            }
        });

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid access token" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: error?.message || "Invalid access token" 
        });
    }
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decodedToken.id },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    googleId: true
                }
            });

            if (user) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};
