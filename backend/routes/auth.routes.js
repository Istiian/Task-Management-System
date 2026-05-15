import { register,login, sendOTP, resetPassword } from "../controller/auth.controller.js";
import express from "express";
import { validateForm } from "../middleware/validateForm.js";
import { registerSchema } from "../validator/userSchema.js";

const router = express.Router();

router.post('/register',  register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.post('/reset-password', resetPassword);


export default router;