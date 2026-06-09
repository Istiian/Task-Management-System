import User from '../models/User.js';
import { ApiError } from '../util/apiError.js';
import Project from '../models/project.js';
import ProjectMember from '../models/project_member.js';
import Task from '../models/task.js';

// Middleware factory for task-level access control.
// Resolves the parent project from the task, then applies the same owner/admin/member
// role check used by canAccessProject.
export const canAccessTask = (...roles) => {
    return async (req, res, next) => {
        const userId = req.user.id;
        const taskId = req.params.taskId;

        if (!taskId) {
            return next(new ApiError(400, 'Task ID is required'));
        }

        if (!userId) {
            return next(new ApiError(401, 'User not authenticated'));
        }

        try {
            // Fetch task with its parent project to get ownerId and projectId
            const projectInfo = await Task.findOne({
                where: { id: taskId },
                include: [{ model: Project, as: 'project', attributes: ['ownerId', 'id'] }],
            });

            if (!projectInfo) {
                return next(new ApiError(404, 'Task not found'));
            }

            const ownerId = projectInfo?.project?.ownerId;
            const projectId = projectInfo?.project?.id;

            const userRole = await ProjectMember.findOne({
                where: { userId, projectId },
                attributes: ['role'],
            });

            const isOwner = userId === ownerId;
            const currentRole = userRole?.role || null;

            const isApprovedOwner = roles.includes('owner') && isOwner;
            const isApprovedAdmin = roles.includes('admin') && currentRole === 'admin';
            const isApprovedMember = roles.includes('member') && currentRole === 'member';

            if (!isApprovedOwner && !isApprovedAdmin && !isApprovedMember) {
                throw new ApiError(403, 'Forbidden: You do not have access ');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
