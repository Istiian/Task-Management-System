import {
    createProject,
    getOwnedProjects,
    getOwnedProjectById,
    getMemberProjects,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectMembers,
    updateProjectMemberRole,
} from './project.service.js';



export const createProjectController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectData = req.body;
        const project = await createProject(userId, projectData);
        res.status(201).json(project);
    } catch (error) {
        next(error);
    }
};

export const getAllProjectsController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projects = await getOwnedProjects(userId);
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

export const getProjectByIdController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const project = await getOwnedProjectById(userId, req.params.id);
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

export const getMemberProjectsController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projects = await getMemberProjects(userId);
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

export const updateProjectController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectData = req.body;
        const projectId = req.params.id;
        const project = await updateProject(userId, projectId, projectData);
        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

export const deleteProjectController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        await deleteProject(userId, projectId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const addProjectMemberController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        console.log('Adding member to project with data:', { userId, projectId, body: req.body });
        const projectMember = await addProjectMember(userId, projectId, req.body.userId);
        res.status(201).json(projectMember);
    } catch (error) {
        next(error);
    }
};

export const removeProjectMemberController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        await removeProjectMember(userId, projectId, req.body.userId);
        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        next(error);
    }
};

export const getProjectMembersController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const members = await getProjectMembers(userId, projectId);
        res.status(200).json(members);
    } catch (error) {
        next(error);
    }
};

export const updateProjectMemberRoleController = async (req, res, next) => {
    try {
        const { userId, role } = req.body;
        const projectId = req.params.id;
        const updatedMember = await updateProjectMemberRole(projectId, userId, role);
        res.status(200).json(updatedMember);
    } catch (error) {
        next(error);
    }
};
