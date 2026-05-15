import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import redisClient from '../redis.js';
import { hashPassword, generateToken, generateResetToken, generateOTP, sendEmail } from '../service/auth.service.js';



export const register = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const hashedPassword = hashPassword(password);
        const user = await User.create({ username, password: hashedPassword, email });
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

        const token = generateToken(user);
        res.json({ message: 'Login successful', token });
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
    const { email, otp, newPassword } = req.body;
    try {
        const storedOTP = await redisClient.get(`otp:${email}`);
        if (!storedOTP || storedOTP !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
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