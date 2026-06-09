import Project from '../../models/project.js';
import ProjectMember from '../../models/project_member.js';
import User from '../../models/user.js';
import Task from '../../models/task.js';
import TaskAssignees from '../../models/task_assignees.js';
import { ApiError } from '../../util/apiError.js';
import redisClient from '../../../redis.js';
import { Op } from 'sequelize';
import { sortQuery } from '../../util/keySorting.js';
import {
    bumpProjectCacheVersion,
    bumpUserProjectsCacheVersion,
    bumpUserTasksCacheVersions,
} from '../../util/cache.js';

const validRole = ['admin', 'member'];
const validTaskStatus = ['pending', 'in_progress', 'completed'];
const validProjectStatus = ['active', 'archived'];

const bumpTaskAssigneesCache = async (taskId) => {
    const assignees = await TaskAssignees.findAll({
        where: { taskId },
        attributes: ['userId'],
    });
    await bumpUserTasksCacheVersions(assignees.map((a) => a.userId));
};

export const createProject = async (ownerId, projectData) => {
    const createdProject = await Project.create({
        ownerId,
        name: projectData.name,
        description: projectData.description,
    });
    await bumpUserProjectsCacheVersion(ownerId);
    return createdProject;
};

export const getProjectById = async (projectId) => {
    const cacheKey = `project:${projectId}`;
    const cachedProject = await redisClient.get(cacheKey);
    let project;
    if (cachedProject) {
        project = JSON.parse(cachedProject);
    } else {
        project = await Project.findByPk(projectId, {
            attributes: ['id', 'name', 'description', 'status', 'ownerId'],
            include: [{
                model: User,
                as: 'owner',
                attributes: ['id', 'username', 'email'],
            }],
        });

        if (!project) throw new ApiError(404, 'Project not found');
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(project));
    }
    return project;
};


export const updateProject = async (ownerId, projectId, projectData) => {
    const cacheKey = `project:${projectId}`;
    const project = await Project.findOne({ where: { id: projectId, ownerId } });
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }

    if (projectData.name !== undefined) {
        project.name = projectData.name;
    }
    if (projectData.description !== undefined) {
        project.description = projectData.description;
    }
    if (projectData.status !== undefined) {
        if (!validProjectStatus.includes(projectData.status)) {
            throw new ApiError(400, 'Invalid project status');
        }
        project.status = projectData.status;
    }
    await redisClient.del(cacheKey);
    const updatedProject = await project.save();
    await bumpUserProjectsCacheVersion(ownerId);
    return updatedProject;
};

export const deleteProject = async (ownerId, projectId) => {
    const cacheKey = `project:${projectId}`;
    const project = await Project.findOne({ where: { id: projectId, ownerId } });
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    await redisClient.del(cacheKey);
    await redisClient.del(`project:${projectId}:version`);
    await project.destroy();
    await bumpUserProjectsCacheVersion(ownerId);
    return { message: 'Project deleted successfully' };
};

export const addProjectMember = async (memberId, projectId, role) => {
    const project = await Project.findByPk(projectId);
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    const isUserExist = await User.findByPk(memberId);

    if (!isUserExist) {
        throw new ApiError(404, 'User not found');
    }
    const existingMember = await ProjectMember.findOne({ where: { projectId, userId: memberId } });
    if (existingMember) {
        throw new ApiError(400, 'User is already a project member');
    }
    if (!validRole.includes(role)) {
        throw new ApiError(400, 'Invalid role');
    }
    const member = await ProjectMember.create({ projectId, userId: memberId, role: role });
    await bumpProjectCacheVersion(projectId);
    return member;
};

export const removeProjectMember = async (ownerId, projectId, userId) => {
    const project = await Project.findByPk(projectId);
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    const projectMember = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!projectMember) {
        throw new ApiError(404, 'Project member not found');
    }
    await projectMember.destroy();
    await bumpProjectCacheVersion(projectId);
    return { message: 'Project member removed successfully' };
};

export const getProjectMembers = async (projectId, page, limit, filter) => {
    const queryKey = sortQuery(filter || {});
    const version = (await redisClient.get(`project:${projectId}:version`)) || 1;
    const cacheKey = `project:${projectId}:v${version}:members:` + `${JSON.stringify(queryKey)}:page:${page}:limit:${limit}`;
    const cachedMembers = await redisClient.get(cacheKey);

    if (cachedMembers) {
        return JSON.parse(cachedMembers);
    }

    const whereClause = { projectId };
    if (filter?.role) {
        whereClause.role = filter.role;
    }

    const userWhere = {};
    if (filter?.name) {
        userWhere.username = { [Op.like]: `%${filter.name}%` };
    }

    const members = await ProjectMember.findAll({
        where: whereClause,
        attributes: ['role'],
        include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email'],
            ...(Object.keys(userWhere).length > 0 && { where: userWhere, required: true }),
        }],
        offset: (page - 1) * limit,
        limit,
    });
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(members));
    return members;
};

export const updateProjectMemberRole = async (projectId, memberId, role) => {
    const project = await Project.findByPk(projectId);
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    const projectMember = await ProjectMember.findOne({
        where: { projectId, userId: memberId },

    });
    if (!projectMember) {
        throw new ApiError(404, 'Project member not found');
    }
    if (!validRole.includes(role)) {
        throw new ApiError(400, 'Invalid role');
    }
    projectMember.role = role;
    await projectMember.save();
    await bumpProjectCacheVersion(projectId);
    return projectMember;
};

export const createTask = async (taskData, projectId) => {
    const task = await Task.create({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline,
        projectId: projectId,
    });
    await bumpProjectCacheVersion(projectId);
    return task;
};

export const updateTask = async (projectId, taskId, taskData) => {
    const cacheKey = `task:${taskId}`;
    const task = await Task.findOne({ where: { id: taskId, projectId } });
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }
    await task.update({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline,
    });
    await redisClient.del(cacheKey);
    await bumpProjectCacheVersion(projectId);
    await bumpTaskAssigneesCache(taskId);
    return task;
};

export const updateTaskStatus = async (projectId, taskId, status) => {
    const cacheKey = `task:${taskId}`;
    const task = await Task.findOne({ where: { id: taskId, projectId } });
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }
    if (!validTaskStatus.includes(status)) {
        throw new ApiError(400, 'Invalid status filter value');
    }
    await task.update({ status });
    await redisClient.del(cacheKey);
    await bumpProjectCacheVersion(projectId);
    await bumpTaskAssigneesCache(taskId);
    return task;
};

export const deleteTask = async (projectId, taskId) => {
    const cacheKey = `task:${taskId}`;
    const task = await Task.findOne({ where: { id: taskId, projectId } });
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }
    await bumpTaskAssigneesCache(taskId);
    await redisClient.del(cacheKey);
    await task.destroy();
    await bumpProjectCacheVersion(projectId);
};

export const getTasks = async (projectId, filter, page, limit) => {
    const queryKey = sortQuery(filter || {});
    const version = (await redisClient.get(`project:${projectId}:version`)) || 1;
    const cacheKey = `project:${projectId}:v${version}:tasks:` + `${JSON.stringify(queryKey)}:page:${page}:limit:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    const whereClause = { projectId };

    if (filter?.status) {
        if (!validTaskStatus.includes(filter.status)) {
            throw new ApiError(400, 'Invalid status filter value');
        }
        whereClause.status = filter.status;
    }

    if (filter?.deadline) {
        whereClause.deadline = filter.deadline;
    }

    if (filter?.title) {
        whereClause.title = {
            [Op.like]: `%${filter.title}%`,
        };
    }

    const tasks = await Task.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        offset: (page - 1) * limit,
        limit,
    });

    await redisClient.setEx(cacheKey, 120, JSON.stringify(tasks));

    return tasks;
};
