import crypto from 'crypto';
import User from '../../models/user.js';
import { hashPassword, comparePassword } from '../../lib/bcrypt.js';
import { sendEmail } from '../../lib/nodemailer.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../lib/jwt.js';
import redisClient from '../../../redis.js';

export const loginUser = async (loginData) => {
    try {
        const user = await User.findOne({ where: { username: loginData.username } });

        if (!user) {
            throw new Error('User not found');
        }
        const isPasswordValid = comparePassword(loginData.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        redisClient.setEx(`refreshToken:${user.id}`, 604800, refreshToken); // Store the refreshToken in Redis with a 7-day expiration
        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error('Error logging in');
    }
}

export const sendOTPEmail = async (email) => {
    try {
        const isUserExist = await User.findOne({ where: { email } });
        console.log('User existence check for email:', email, 'Result:', !!isUserExist);
        if (!isUserExist) {
            throw new Error('User with this email does not exist');
        }
        
        const isOTPExist = await redisClient.get(`otp:${email}`);
        console.log('OTP existence check for email:', email, 'Result:', !!isOTPExist);
        if (isOTPExist) {
            throw new Error('OTP already sent. Please wait before requesting a new one.');
        }
        const otp = crypto.randomInt(100000, 999999).toString();
        await sendEmail(email, 'Your OTP Code', `Your OTP code is: ${otp}`);
        redisClient.setEx(`otp:${email}`, 300, otp); // Store OTP in Redis with a 5-minute expiration
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Error sending OTP');
    }
}

export const resetPassword = async ( resetData) => {
    try {
        const user = await User.findOne({ where: { email: resetData.email } });
        if (!user) {
            throw new Error('User not found');
        }
        const storedOTP = await redisClient.get(`otp:${resetData.email}`);

        if (!storedOTP || storedOTP !== resetData.otp) {
            throw new Error('Invalid or expired OTP');
        }

        const hashedPassword = hashPassword(resetData.newPassword);
        user.password = hashedPassword;
        await user.save();
        await redisClient.del(`otp:${resetData.email}`);
    } catch (error) {
        throw new Error('Error resetting password');
    }
}

export const refreshToken = async (refreshToken) => {
    
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    try {
        const isVerified = verifyToken(refreshToken);
        if (!isVerified) {
            throw new Error('Invalid refresh token');
        }
        const userId = isVerified.id;
        const storedRefreshToken = await redisClient.get(`refreshToken:${userId}`);
        
        if (storedRefreshToken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        await redisClient.setEx(`refreshToken:${userId}`, 604800, newRefreshToken);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

export const deleteToken = async (token) => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            throw new Error('Invalid token');
        }
        await redisClient.del(`refreshToken:${decoded.id}`);
        return { message: 'Token deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting token');
    }
}

