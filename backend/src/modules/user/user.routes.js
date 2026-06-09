import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    registerUserHandler,
    changeInfoHandler,
    changePasswordHandler,
    getAllProjectsController,
    getUserTasksController
} from './user.controller.js';
import {
    registerSchema,
    changeInfoSchema,
    changePasswordSchema,
} from './user.validator.js';
import '../../config/passport.js';
import passport from 'passport';

const router = express.Router();

// User Registration and Profile Management
router.post('/',
    validateForm(registerSchema),
    registerUserHandler);

// Change UserInformation
router.patch('/me', 
    passport.authenticate('jwt', { session: false }),
    validateForm(changeInfoSchema),
    changeInfoHandler);

// Change User Password
router.patch('/me/password',
    passport.authenticate('jwt', { session: false }),
    validateForm(changePasswordSchema),
    changePasswordHandler);

// Get User's Owned Projects
router.get('/me/projects', 
    passport.authenticate('jwt', { session: false }),
    getAllProjectsController);

// Get User's Tasks
router.get('/me/tasks',
    passport.authenticate('jwt', { session: false }),
    getUserTasksController);

export default router;
