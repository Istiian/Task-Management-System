import crypto from 'crypto';
import User from '../../models/user.js';
import { hashPassword, comparePassword } from '../../lib/bcrypt.js';
import { sendEmail } from '../../lib/nodemailer.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../lib/jwt.js';
import redisClient from '../../../redis.js';
import { ApiError } from '../../util/apiError.js';

export const loginUser = async (loginData) => {
    const user = await User.findOne({ where: { username: loginData.username } });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await comparePassword(loginData.password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid password');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
};

export const sendOTPEmail = async (email) => {
    const isUserExist = await User.findOne({ where: { email } });
    if (!isUserExist) {
        throw new ApiError(404, 'User with this email does not exist');
    }

    // Prevent OTP spam — only one active OTP is allowed per email at a time
    const isOTPExist = await redisClient.get(`otp:${email}`);
    if (isOTPExist) {
        throw new ApiError(429, 'OTP already sent. Please wait before requesting a new one.');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    await sendEmail(email, 'Your OTP Code', `Your OTP code is: ${otp}`);
    await redisClient.setEx(`otp:${email}`, 300, otp); // OTP expires in 5 minutes
};

export const resetPassword = async (resetData) => {
    const user = await User.findOne({ where: { email: resetData.email } });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const storedOTP = await redisClient.get(`otp:${resetData.email}`);
    if (!storedOTP || storedOTP !== resetData.otp) {
        throw new ApiError(400, 'Invalid or expired OTP');
    }

    const hashedPassword = await hashPassword(resetData.newPassword);
    user.password = hashedPassword;
    await user.save();

    await redisClient.del(`otp:${resetData.email}`); // invalidate OTP after use
};

export const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token is required');
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Issue a new pair so the refresh token rotates on every use
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken: newRefreshToken };
};
