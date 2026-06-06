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

const router = express.Router();

router.post('/login', validateForm(loginSchema), loginHandler);
router.post('/send-otp', validateForm(otpSchema), sendOTPEmailHandler);
router.post('/reset-password', validateForm(resetPasswordSchema), resetPasswordHandler);
router.post('/refresh-token', refreshTokenHandler);
router.post('/logout', logoutHandler);

export default router;
