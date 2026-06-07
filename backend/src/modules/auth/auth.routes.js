import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    loginHandler,
    sendOTPEmailHandler,
    resetPasswordHandler,
    refreshTokenHandler,
    logoutHandler,
} from './auth.controller.js';
import {
    loginSchema,
    otpSchema,
    resetPasswordSchema,
    refreshTokenSchema,
} from './auth.validator.js';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: 'Too many requests, please try again after 15 minutes' 
});

const router = express.Router();

router.post('/login', validateForm(loginSchema), limiter, loginHandler);
router.post('/send-otp', validateForm(otpSchema), sendOTPEmailHandler);
router.post('/reset-password', validateForm(resetPasswordSchema), resetPasswordHandler);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutHandler);

export default router;
