import express from 'express';
import {
    createTaskController,
    getTasksController,
    updateTaskController,
    deleteTaskController,
    getTaskByIdController,
    getOverdueTasksController,
    getUserTasksController,
    assignTaskToUserController,
    unassignTaskFromUserController
} from './task.controller.js';
import { validateForm } from '../../middleware/validateForm.js';
import { createTaskSchema, updateTaskSchema } from './task.validator.js';
const router = express.Router();

router.post('/', validateForm(createTaskSchema), createTaskController);
router.get('/project/:projectId', getTasksController);
router.get('/assigned', getUserTasksController);
router.get('/:taskId', getTaskByIdController);
router.put('/:taskId', validateForm(updateTaskSchema), updateTaskController);
router.delete('/:taskId', deleteTaskController);
router.get('/project/:projectId/overdue', getOverdueTasksController);
router.get('/own', getUserTasksController);
router.post('/assign/:taskId', assignTaskToUserController);
router.delete('/unassign/:taskId', unassignTaskFromUserController);

export default router;