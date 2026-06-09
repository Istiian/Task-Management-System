import express from 'express';
import {
    getTaskByIdController,
    assignTaskToUserController,
    unassignTaskFromUserController,
    createCommentController,
    getCommentsByTaskIdController,
    getTaskAssigneesController
} from './task.controller.js';
import { validateForm } from '../../middleware/validateForm.js';
import {commentSchema} from './task.validator.js';
import {canAccessTask} from '../../middleware/canAccessTask.js';

const router = express.Router();

// get task by Id
router.get('/:taskId',
    canAccessTask('owner', 'admin', 'member'),
    getTaskByIdController);

// get Task Assignees
router.get('/:taskId/assignees',
    canAccessTask('owner', 'admin', 'member'),
    getTaskAssigneesController);

// Assign Task to User
router.post('/:taskId/assignees/:memberId',
    assignTaskToUserController);
    
// Unassign Task from User
router.delete('/:taskId/assignees/:memberId',
    unassignTaskFromUserController);

// Add Comment to Task
router.post('/:taskId/comments',
    validateForm(commentSchema),
    createCommentController);

// Get Task Comments
router.get('/:taskId/comments',
    getCommentsByTaskIdController);

export default router;