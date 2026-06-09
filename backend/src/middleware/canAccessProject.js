import User from '../models/User.js';
import { ApiError } from '../util/apiError.js';
import Project from '../models/project.js';
import ProjectMember from '../models/project_member.js';

// Middleware factory for project-level access control.
// Pass the roles that are allowed to access the route: 'owner', 'admin', 'member'.
// The owner is identified by project.ownerId; admins and members via ProjectMember.role.
export const canAccessProject = (...roles) => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const projectId = req.params.projectId;

        if (!userId) {
            return next(new ApiError(401, 'Unauthorized'));
        }

        const project = await Project.findByPk(projectId);
        if (!project) {
            return next(new ApiError(404, 'Project not found'));
        }

        // Check membership separately — owners may not have a ProjectMember row
        const projectMember = await ProjectMember.findOne({ where: { projectId, userId } });
        const isOwner = project.ownerId === userId;
        const userRole = projectMember?.role || null;

        const isApprovedOwner = roles.includes('owner') && isOwner;
        const isApprovedAdmin = roles.includes('admin') && userRole === 'admin';
        const isApprovedMember = roles.includes('member') && userRole === 'member';

        if (!isApprovedOwner && !isApprovedAdmin && !isApprovedMember) {
            return next(new ApiError(403, 'Forbidden: You do not have access '));
        }

        next();
    };
};
