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

// const NOT_FOUND_ERRORS = new Set([
//     'Project not found',
//     'Project member not found',
//     'User not found',
//     'User is already a project member',
// ]);

// const handleError = (res, error) => {
//     if (NOT_FOUND_ERRORS.has(error.message)) {
//         const status = error.message === 'User is already a project member' ? 409 : 404;
//         return res.status(status).json({ error: error.message });
//     }
//     return res.status(500).json({ error: error.message });
// };

export const createProjectController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectData = req.body;
        const project = await createProject(userId, projectData);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllProjectsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await getOwnedProjects(userId);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectByIdController = async (req, res) => {
    try {
        const userId = req.user.id;
        const project = await getOwnedProjectById(userId, req.params.id);
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getMemberProjectsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projects = await getMemberProjects(userId);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProjectController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectData = req.body;
        const projectId = req.params.id;
        const project = await updateProject(userId, projectId, projectData);
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProjectController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        await deleteProject(userId, projectId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addProjectMemberController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        console.log('Adding member to project with data:', { userId, projectId, body: req.body });
        const projectMember = await addProjectMember(userId, projectId, req.body.userId);
        res.status(201).json(projectMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const removeProjectMemberController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        await removeProjectMember(userId, projectId, req.body.userId);
        res.status(204).json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectMembersController = async (req, res) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.id;
        const members = await getProjectMembers(userId, projectId);
        res.status(200).json(members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProjectMemberRoleController = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const updatedMember = await updateProjectMemberRole(req.user.id, req.params.id, userId, role);
        res.status(200).json(updatedMember);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
