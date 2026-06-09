import {
    loginUser,
    sendOTPEmail,
    resetPassword,
    refreshAccessToken,
} from './auth.service.js';
import {
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
    getRefreshTokenFromRequest,
} from '../../util/authCookie.js';

export const createSessionHandler = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const { accessToken, refreshToken } = await loginUser({ username, password });

        setRefreshTokenCookie(res, refreshToken);
        res.status(201).json({
            message: 'Login successful',
            accessToken,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSessionHandler = async (req, res, next) => {
    try {
        clearRefreshTokenCookie(res);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const createAccessTokenHandler = async (req, res, next) => {
    try {
        const refreshToken = getRefreshTokenFromRequest(req);
        const tokens = await refreshAccessToken(refreshToken);

        setRefreshTokenCookie(res, tokens.refreshToken);
        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: tokens.accessToken,
        });
    } catch (error) {
        next(error);
    }
};

export const createPasswordResetRequestHandler = async (req, res, next) => {
    try {
        const { email } = req.body;
        await sendOTPEmail(email);
        res.status(202).json({ message: 'OTP sent successfully' });
    } catch (error) {
        next(error);
    }
};

export const resetPasswordHandler = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        await resetPassword({ email, otp, newPassword });
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};
