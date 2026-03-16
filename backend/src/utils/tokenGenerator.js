import jwt from "jsonwebtoken";

const getAccessTokenSecret = () => {
    return process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
};

const getRefreshTokenSecret = () => {
    return process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET || getAccessTokenSecret();
};

const getAccessTokenExpiry = () => {
    return process.env.ACCESS_TOKEN_EXPIRY || process.env.JWT_EXPIRES_IN || "7d";
};

const getRefreshTokenExpiry = () => {
    return process.env.REFRESH_TOKEN_EXPIRY || process.env.JWT_REFRESH_EXPIRES_IN || "30d";
};

// Generate JWT access token
export const generateAccessToken = (userId) => {
    const secret = getAccessTokenSecret();
    if (!secret) {
        throw new Error("Missing access token secret. Set ACCESS_TOKEN_SECRET (or JWT_SECRET).");
    }

    return jwt.sign(
        { id: userId },
        secret,
        { expiresIn: getAccessTokenExpiry() }
    );
};

// Generate JWT refresh token
export const generateRefreshToken = (userId) => {
    const secret = getRefreshTokenSecret();
    if (!secret) {
        throw new Error("Missing refresh token secret. Set REFRESH_TOKEN_SECRET (or JWT_REFRESH_SECRET)." );
    }

    return jwt.sign(
        { id: userId },
        secret,
        { expiresIn: getRefreshTokenExpiry() }
    );
};

// Generate both tokens
export const generateTokens = (userId) => {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);
    
    return { accessToken, refreshToken };
};
