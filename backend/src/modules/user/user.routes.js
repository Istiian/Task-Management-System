import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    registerUserHandler,
    changeInfoHandler,
    changePasswordHandler,
} from './user.controller.js';
import {
    registerSchema,
    changeInfoSchema,
    changePasswordSchema,
} from './user.validator.js';

const router = express.Router();

router.post('/register', validateForm(registerSchema), registerUserHandler);
router.put('/change-info/:id', validateForm(changeInfoSchema), changeInfoHandler);
router.put('/change-password/:id', validateForm(changePasswordSchema), changePasswordHandler);

export default router;
