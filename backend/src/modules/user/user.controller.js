import { changeInfo, changePassword, registerUser, getOwnedProjects, getUserTasks } from './user.service.js';

export const changeInfoHandler = async (req, res, next) => {
    const userId = req.user.id;
    console.log('User ID from token:', userId);
    const { firstName, lastName, email } = req.body;
    
    try {
        const result = await changeInfo(firstName, lastName, email, userId);
        res.status(200).json({
            success: true,
            message: 'User information updated successfully',
            user: result
        });
    } catch (error) {
        next(error);
    }
};

export const changePasswordHandler = async (req, res, next) => {
    const userId = req.user.id;
    const { currentPassword, newPassword, repeatNewPassword } = req.body;
    try {
        const result = await changePassword({ currentPassword, newPassword, repeatNewPassword }, userId);
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const registerUserHandler = async (req, res, next) => {
    try {
        const userData = req.body;
        const user = await registerUser(userData);
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

export const getAllProjectsController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters ={};
        if (req.query.name) filters.name = req.query.name;
        if (req.query.status) filters.status = req.query.status;
        const projects = await getOwnedProjects(userId, filters, page, limit);
        res.status(200).json({
            success: true,
            message: 'User projects fetched successfully',
            projects
        });
    } catch (error) {
        next(error);
    }
};

export const getUserTasksController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        const tasks = await getUserTasks(userId, filters, page, limit);
        res.status(200).json({
            success: true,
            message: 'User tasks fetched successfully',
            tasks
        });
    } catch (error) {
        next(error);
    }
}

