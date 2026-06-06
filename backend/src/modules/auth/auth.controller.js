import { loginUser, sendOTPEmail, resetPassword, refreshToken, deleteToken } from './auth.service.js';

export const loginHandler = async (req, res) => {
    try {
        const tokens = await loginUser(req.body);
        res.status(200).json({ message: 'Login successful', ...tokens });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const sendOTPEmailHandler = async (req, res) => {
    try {
        await sendOTPEmail(req.body.email);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending OTP', error: error.message });
    }
};


export const resetPasswordHandler = async (req, res) => {
    try {
        await resetPassword(req, res, req.body);
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

export const refreshTokenHandler = async (req, res) => {
    try {
        const token = await refreshToken(req, res);
        res.status(200).json({ message: 'Token refreshed successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Error refreshing token', error: error.message });
    }
};

export const logoutHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        await deleteToken(token);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
}

        

