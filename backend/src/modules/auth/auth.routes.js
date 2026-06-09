import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    createSessionHandler,
    deleteSessionHandler,
    createAccessTokenHandler,
    createPasswordResetRequestHandler,
    resetPasswordHandler,
} from './auth.controller.js';
import {
    loginSchema,
    otpSchema,
    resetPasswordSchema,
} from './auth.validator.js';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, 
    message: 'Too many requests, please try again after 5 minutes',
});

const router = express.Router();

// Login 
router.post('/sessions',
    limiter,
    validateForm(loginSchema), 
    createSessionHandler);

// Logout
router.delete('/sessions', 
    deleteSessionHandler);

// Refresh Access Token
router.post('/tokens', 
    createAccessTokenHandler);

// Password Reset
router.post('/password/reset-requests', 
    validateForm(otpSchema), 
    createPasswordResetRequestHandler);

// Reset Password
router.put('/password', 
    validateForm(resetPasswordSchema),
    resetPasswordHandler);

export default router;
