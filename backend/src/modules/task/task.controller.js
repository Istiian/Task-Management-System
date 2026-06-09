import {
    getTaskById,
    getTaskAssignees,
    assignTaskToUser,
    unassignTaskFromUser,
    createComment,
    getTaskComments
} from './task.service.js';

export const getTaskByIdController = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        
        const task = await getTaskById(taskId);
       
        res.status(200).json({
            success: true,
            message: 'Task fetched successfully',
            task
        });
    } catch (error) {
        next(error);
    }
}

export const getTaskAssigneesController = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const assignees = await getTaskAssignees(taskId);
        res.status(200).json({
            success: true,
            message: 'Task assignees fetched successfully',
            assignees
        });
    } catch (error) {
        next(error);
    }
}

export const assignTaskToUserController = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const memberId = req.params.memberId;
        await assignTaskToUser(taskId, memberId);
        res.status(200).json({
            success: true,
            message: 'Task assigned to user successfully'
        });
    } catch (error) {   
        next(error);
    }
}

export const unassignTaskFromUserController = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const memberId = req.params.memberId;
        await unassignTaskFromUser(taskId, memberId);
        res.status(200).json({
            success: true,
            message: 'Task unassigned from user successfully'
        });
    } catch (error) {
        next(error);
    }
}

export const createCommentController = async (req, res, next) => {
    const {content} = req.body;
    const authorId = req.user.id;
    const taskId = req.params.taskId;
    try {
        const comment = await createComment(content, authorId, taskId);
        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            comment
        });
    } catch (error) {
        next(error);
    }
}

export const getCommentsByTaskIdController = async (req, res, next) => {
    const taskId = req.params.taskId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const comments = await getTaskComments(taskId, page, limit);
        res.status(200).json({
            success: true,
            message: 'Comments fetched successfully',
            comments
        });
    } catch (error) {
        next(error);
    }
}