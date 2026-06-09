import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    createProjectController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController,
    addProjectMemberController,
    removeProjectMemberController,
    getProjectMembersController,
    updateProjectMemberRoleController,
    createTaskController,
    getTasksController,
    updateTaskController,
    deleteTaskController
} from './project.controller.js';
import {
    createProjectSchema,
    updateProjectSchema,
    addProjectMemberSchema,
    updateProjectMemberRoleSchema,
    createTaskSchema,
    updateTaskSchema,
} from './project.validator.js';
import { canAccessProject } from '../../middleware/canAccessProject.js';

const router = express.Router();

// Create a new project
router.post('/',
    validateForm(createProjectSchema),
    createProjectController);

// Get Project by ID
router.get('/:projectId',
    canAccessProject("owner", "member", "admin"),
    getProjectByIdController);

// Update Project Info
router.patch('/:projectId',
    canAccessProject("owner"),
    validateForm(updateProjectSchema),
    updateProjectController);

// Delete Project 
router.delete('/:projectId',
    canAccessProject("owner"),
    deleteProjectController);

// Get Project Members
router.get('/:projectId/members',
    canAccessProject("owner", "member", "admin"),
    getProjectMembersController);

// Add Project Member
router.post('/:projectId/members/:memberId',
    canAccessProject("owner"),
    validateForm(addProjectMemberSchema),
    addProjectMemberController);

// Remove Project Member
router.delete('/:projectId/members/:memberId',
    canAccessProject("owner"),
    removeProjectMemberController);

// Update Project Member Role
router.patch('/:projectId/members/:memberId',
    canAccessProject("owner"),
    validateForm(updateProjectMemberRoleSchema),
    updateProjectMemberRoleController);

// Create Task under a Project
router.post('/:projectId/tasks',
    canAccessProject("owner", "admin"),
    validateForm(createTaskSchema),
    createTaskController);

// Get Tasks under a Project with optional status filter
router.get('/:projectId/tasks',
    canAccessProject("owner", "member", "admin"),
    getTasksController);

// Update Task under a Project
router.patch('/:projectId/tasks/:taskId',
    canAccessProject("owner", "admin"),
    validateForm(updateTaskSchema),
    updateTaskController);

// Delete Task under a Project
router.delete('/:projectId/tasks/:taskId',
    canAccessProject("owner", "admin"),
    deleteTaskController);

export default router;
