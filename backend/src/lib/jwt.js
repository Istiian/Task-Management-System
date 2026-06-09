import jwt from 'jsonwebtoken';

// Short-lived token (15 min) sent in the Authorization header on every request
export const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_SECRET, { expiresIn: '15m' });
};

// Long-lived token (7 days) stored in an httpOnly cookie for silent token refresh
export const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
};

// Returns the decoded payload, or null if the token is invalid or expired
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
        return null;
    }
};
