import { loginUser, sendOTPEmail, resetPassword, refreshToken, deleteToken } from './auth.service.js';

export const loginHandler = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        const tokens = await loginUser({username, password});
        
        res.status(200).json({ message: 'Login successful', ...tokens });
    } catch (error) {
        next(error);
    }
};

export const sendOTPEmailHandler = async (req, res, next) => {
    try {
        const { email } = req.body;
        await sendOTPEmail(email);
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
};


export const resetPasswordHandler = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        await resetPassword({ email, otp, newPassword });
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};

export const refreshTokenHandler = async (req, res) => {
    try {
        const headerToken = req.headers.authorization.split(' ')[1];
        console.log('Received refresh token:', headerToken);
        const token = await refreshToken(headerToken);
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

        

