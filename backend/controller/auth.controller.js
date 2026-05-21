import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import redisClient from '../redis.js';
import { hashPassword, generateOTP,generateAccessToken, generateRefreshToken, sendEmail } from '../service/auth.service.js';

export const register = async (req, res) => {
    const { username, password, email, firstName, lastName } = req.body;
    try {
        const hashedPassword = hashPassword(password);
        const user = await User.create({ username, password: hashedPassword, email, firstName, lastName });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,   // Not accessible via JS
            secure: true,     // Only sent over HTTPS
            sameSite: 'strict', // Prevent CSRF (optional, recommended)
            maxAge: 15 * 60 * 1000 // Expires in 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // Expires in 7 days
        });

        redisClient.setEx(`refreshToken:${user.id}`, 604800, refreshToken); // Store the refreshToken in Redis with a 7-day expiration
        res.json({ message: 'Login successful', accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();

        await Promise.allSettled([
            sendEmail({
                to: email,
                subject: 'Your OTP Code',
                text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`
            }),
            // Store OTP in Redis with a 10-minute expiration
            redisClient.setEx(`otp:${email}`, 600, otp)
        ]);

        res.json({ message: 'OTP sent to email', otp });
    }
    catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword, repeatPassword } = req.body;
    try {
        const storedOTP = await redisClient.get(`otp:${email}`);

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (newPassword !== repeatPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (!storedOTP || storedOTP !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const hashedPassword = hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();
        await redisClient.del(`otp:${email}`);
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const storedRefreshToken = await redisClient.get(`refreshToken:${decoded.id}`);
        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newAccessToken = generateAccessToken(user);

        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,   // Not accessible via JS
            secure: true,     // Only sent over HTTPS
            sameSite: 'strict', // Prevent CSRF (optional, recommended)
            maxAge: 15 * 60 * 1000 // Expires in 15 minutes
        });

        res.json({ message: 'Token refreshed successfully'});

    } catch (error) {
        res.status(500).json({ message: 'Error refreshing token', error: error.message });
    }
};