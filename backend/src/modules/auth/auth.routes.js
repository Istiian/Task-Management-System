import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    createSessionHandler,
    deleteSessionHandler,
    createAccessTokenHandler,
    createPasswordResetRequestHandler,
    resetPasswordHandler,
} from './auth.controller.js';
import { loginSchema, otpSchema, resetPasswordSchema } from './auth.validator.js';
import rateLimit from 'express-rate-limit';

// Tighter rate limit on login to slow down brute-force attempts
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    message: 'Too many requests, please try again after 5 minutes',
});

const router = express.Router();

router.post('/sessions', limiter, validateForm(loginSchema), createSessionHandler);       // Login
router.delete('/sessions', deleteSessionHandler);                                         // Logout
router.post('/tokens', createAccessTokenHandler);                                         // Refresh access token
router.post('/password/reset-requests', validateForm(otpSchema), createPasswordResetRequestHandler); // Request OTP
router.put('/password', validateForm(resetPasswordSchema), resetPasswordHandler);         // Reset password with OTP

export default router;
