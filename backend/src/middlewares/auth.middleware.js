import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

const getAccessTokenSecret = () => {
    return process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
};

const getRequestToken = (req) => {
    const authHeader = req.header("Authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    return req.cookies?.accessToken || bearerToken || null;
};

// Middleware to verify JWT token
export const verifyJWT = async (req, res, next) => {
    try {
        const token = getRequestToken(req);
        const secret = getAccessTokenSecret();

        if (!secret) {
            return res.status(500).json({
                success: false,
                message: "Server auth misconfiguration: missing access token secret"
            });
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Unauthorized request - No token provided" 
            });
        }

        const decodedToken = jwt.verify(token, secret);

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
        const token = getRequestToken(req);
        const secret = getAccessTokenSecret();

        if (token && secret) {
            const decodedToken = jwt.verify(token, secret);
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
