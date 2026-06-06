import express from 'express';
import { validateForm } from '../../middleware/validateForm.js';
import {
    createProjectController,
    getAllProjectsController,
    getMemberProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController,
    addProjectMemberController,
    removeProjectMemberController,
    getProjectMembersController,
    updateProjectMemberRoleController,
} from './project.controller.js';
import {
    createProjectSchema,
    updateProjectSchema,
    addProjectMemberSchema,
    removeProjectMemberSchema,
    updateProjectMemberRoleSchema,
} from './project.validator.js';

const router = express.Router();

router.post('/', validateForm(createProjectSchema), createProjectController);
router.get('/owned', getAllProjectsController);
router.get('/member', getMemberProjectsController);
router.get('/:id', getProjectByIdController);
router.put('/:id', validateForm(updateProjectSchema), updateProjectController);
router.delete('/:id', deleteProjectController);
router.post('/:id/members', validateForm(addProjectMemberSchema), addProjectMemberController);
router.delete('/:id/members', validateForm(removeProjectMemberSchema), removeProjectMemberController);
router.get('/:id/members', getProjectMembersController);
router.put('/:id/members/role', validateForm(updateProjectMemberRoleSchema), updateProjectMemberRoleController);

export default router;
