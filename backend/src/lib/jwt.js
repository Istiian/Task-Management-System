import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_SECRET, { expiresIn: '15m' });
}
export const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username }, process.env.TOKEN_SECRET, { expiresIn: '7d' });
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (error) {
        return null;
    }
}
