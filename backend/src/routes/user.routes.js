import express from 'express';
import { validateForm } from '../middleware/validateForm.js';
import {
  changeInfoHandler as changeInfo,
  changePasswordHandler as changePassword,
} from '../modules/user/user.controller.js';
import { changeInfoSchema, changePasswordSchema } from '../validator/userSchema.js'; 

const router = express.Router();
router.put('/change-info/:id', validateForm(changeInfoSchema), changeInfo);
router.put('/change-password/:id', validateForm(changePasswordSchema), changePassword);



export default router;



