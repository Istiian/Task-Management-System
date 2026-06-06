import Project from '../../models/project.js';
import ProjectMember from '../../models/project_member.js';
import User from '../../models/user.js';

const verifyProjectOwner = async (ownerId, projectId) => {
    const project = await Project.findOne({ where: { id: projectId, ownerId } });
    if (!project) {
        throw new Error('Project not found');
    }
    return project;
};

export const createProject = async (ownerId, projectData) => {
    try {
        const createdProject = await Project.create({
            ownerId,
            name: projectData.name,
            description: projectData.description,
        });
        return createdProject;
    } catch (error) {
        throw new Error('Error creating project');
    }
};

export const getOwnedProjects = async (ownerId) => {
    try {
        return await Project.findAll({ where: { ownerId } });
    } catch (error) {
        throw new Error('Error fetching projects');
    }
};

export const getOwnedProjectById = async (ownerId, projectId) => {
    try {
        const project = await Project.findOne({ where: { id: projectId, ownerId } });
        if (!project) {
            throw new Error('Project not found');
        }
        return project;
    } catch (error) {
        if (error.message === 'Project not found') {
            throw error;
        }
        throw new Error('Error fetching project');
    }
};

export const getMemberProjects = async (userId) => {
    try {
        return await Project.findAll({
            include: [{
                model: User,
                as: 'members',
                where: { id: userId },
                attributes: [],
                through: { attributes: ['role'] },
            }],
        });
    } catch (error) {
        throw new Error('Error fetching projects');
    }
};

export const updateProject = async (ownerId, projectId, projectData) => {
    try {
        console.log('Updating project with data:', { ownerId, projectId, projectData });
        const project = await verifyProjectOwner(ownerId, projectId);
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
    } catch (error) {
        if (error.message === 'Project not found') {
            throw error;
        }
        throw new Error('Error updating project');
    }
};

export const deleteProject = async (ownerId, projectId) => {
    try {
        const project = await verifyProjectOwner(ownerId, projectId);
        await project.destroy();
        return { message: 'Project deleted successfully' };
    } catch (error) {
        if (error.message === 'Project not found') {
            throw error;
        }
        throw new Error('Error deleting project');
    }
};

export const addProjectMember = async (ownerId, projectId, userId) => {
    try {
        await verifyProjectOwner(ownerId, projectId);
        const member = await User.findByPk(userId);
        if (!member) {
            throw new Error('User not found');
        }
        const existingMember = await ProjectMember.findOne({ where: { projectId, userId } });
        if (existingMember) {
            throw new Error('User is already a project member');
        }
        return await ProjectMember.create({ projectId, userId });
    } catch (error) {
        if (['Project not found', 'User not found', 'User is already a project member'].includes(error.message)) {
            throw error;
        }
        throw new Error('Error adding project member');
    }
};

export const removeProjectMember = async (ownerId, projectId, userId) => {
    try {
        await verifyProjectOwner(ownerId, projectId);
        const projectMember = await ProjectMember.findOne({ where: { projectId, userId } });
        if (!projectMember) {
            throw new Error('Project member not found');
        }
        await projectMember.destroy();
        return { message: 'Project member removed successfully' };
    } catch (error) {
        if (['Project not found', 'Project member not found'].includes(error.message)) {
            throw error;
        }
        throw new Error('Error removing project member');
    }
};

export const getProjectMembers = async (ownerId, projectId) => {
    try {
        await verifyProjectOwner(ownerId, projectId);
        return await ProjectMember.findAll({ 
            where: { projectId },
            attributes: ['role'],
            include: [{ 
                model: User,
                as: 'user',
                attributes: ['username', 'email'] 
            }],
         });
    } catch (error) {
        if (error.message === 'Project not found') {
            throw error;
        }
        throw new Error('Error fetching project members');
    }
};

export const updateProjectMemberRole = async (ownerId, projectId, userId, role) => {
    try {
        // await verifyProjectOwner(ownerId, projectId);
        console.log('Updating project member role with data:', { ownerId, projectId, userId, role });
        const projectMember = await ProjectMember.findOne({ where: { projectId, userId } });
        if (!projectMember) {
            throw new Error('Project member not found');
        }
        projectMember.role = role;
        return await projectMember.save();
    } catch (error) {
        if (['Project not found', 'Project member not found'].includes(error.message)) {
            throw error;
        }
        throw new Error('Error updating project member role');
    }
};
