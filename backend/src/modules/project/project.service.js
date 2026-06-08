import Project from '../../models/project.js';
import ProjectMember from '../../models/project_member.js';
import User from '../../models/user.js';
import { ApiError } from '../../util/apiError.js';

const validRole = ['admin', 'member'];

export const createProject = async (ownerId, projectData) => {
    const createdProject = await Project.create({
        ownerId,
        name: projectData.name,
        description: projectData.description,
    });
    return createdProject;
};

export const getOwnedProjects = async (ownerId) => {
    return await Project.findAll({ where: { ownerId } });
};

export const getOwnedProjectById = async (ownerId, projectId) => {
    const project = await Project.findOne({ where: { id: projectId, ownerId } });
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    return project;
};

export const getMemberProjects = async (userId) => {

    return await Project.findAll({
        include: [{
            model: User,
            as: 'members',
            where: { id: userId },
            attributes: [],
            through: { attributes: ['role'] },
        }],
    });

};

export const updateProject = async (ownerId, projectId, projectData) => {
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
        project.status = projectData.status;
    }
    return await project.save();
};

export const deleteProject = async (ownerId, projectId) => {
    const project = await Project.findOne({ where: { id: projectId, ownerId } });
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    await project.destroy();
    return { message: 'Project deleted successfully' };
};

export const addProjectMember = async (ownerId, projectId, userId) => {
    const project = await Project.findByPk(projectId);
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    const member = await User.findByPk(userId);
    if (!member) {
        throw new ApiError(404, 'User not found');
    }
    const existingMember = await ProjectMember.findOne({ where: { projectId, userId } });
    if (existingMember) {
        throw new ApiError(400, 'User is already a project member');
    }
    return await ProjectMember.create({ projectId, userId });
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
    return { message: 'Project member removed successfully' };
};

export const getProjectMembers = async (ownerId, projectId) => {
    return await ProjectMember.findAll({
        where: { projectId },
        attributes: ['role'],
        include: [{
            model: User,
            as: 'user',
            attributes: ['username', 'email']
        }],
    });
};

export const updateProjectMemberRole = async (projectId,userId, role) => {
    const project = await Project.findByPk(projectId);
    if (!project) {
        throw new ApiError(404, 'Project not found');
    }
    const projectMember = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!projectMember) {
        throw new ApiError(404, 'Project member not found');
    }
    if (!validRole.includes(role)) {
        throw new ApiError(400, 'Invalid role');
    }
    projectMember.role = role;
    return await projectMember.save();
};
