import { register,login, sendOTP, resetPassword, refreshToken} from "../controller/auth.controller.js";
import express from "express";
import { validateForm } from "../middleware/validateForm.js";
import { registerSchema, loginSchema,otpSchema,resetPasswordSchema  } from "../validator/userSchema.js";

const router = express.Router();

router.post('/register', validateForm(registerSchema), register);
router.post('/login',validateForm(loginSchema), login);
router.post('/send-otp',validateForm(otpSchema), sendOTP);
router.post('/reset-password', validateForm(resetPasswordSchema), resetPassword);
router.post('/refresh-token', refreshToken);

export default router;