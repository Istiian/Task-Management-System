import {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectMembers,
    updateProjectMemberRole,
    createTask, 
    getTasks,
    updateTask,
    deleteTask
} from './project.service.js';

export const createProjectController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectData = req.body;
        const project = await createProject(userId, projectData);
        res.status(201).json({
            success: true,
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectByIdController = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await getProjectById( projectId);
        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        next(error);
    }
};

export const updateProjectController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectData = req.body;
        const projectId = req.params.projectId;
        const project = await updateProject(userId, projectId, projectData);
        res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProjectController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId;
        await deleteProject(userId, projectId);
        res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const addProjectMemberController = async (req, res, next) => {
    try {
        const memberId = req.params.memberId;
        const projectId = req.params.projectId;
        const role = req.body.role;
        const projectMember = await addProjectMember(memberId, projectId, role);
        res.status(201).json({
            success: true,
            message: 'Project member added successfully',
            projectMember
        });
    } catch (error) {
        next(error);
    }
};

export const removeProjectMemberController = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const projectId = req.params.projectId;
        const memberUserId = req.params.memberId;
        await removeProjectMember(userId, projectId, memberUserId);
        res.status(200).json({
            success: true,
            message: 'Member removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectMembersController = async (req, res, next) => {
    try {
       
        const projectId = req.params.projectId;
        const filter ={};
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        if(req.query.role) filter.role = req.query.role;
        if(req.query.name) filter.name = req.query.name;
        const members = await getProjectMembers(projectId, page, limit, filter);
        res.status(200).json({
            success: true,
            members
        });
    } catch (error) {
        next(error);
    }
};

export const updateProjectMemberRoleController = async (req, res, next) => {
    try {
        const { role } = req.body;
        const projectId = req.params.projectId;
        const memberId = req.params.memberId;
        const updatedMember = await updateProjectMemberRole(projectId, memberId, role);
        res.status(200).json({
            success: true,
            message: 'Project member role updated successfully',
            updatedMember
        });
    } catch (error) {
        next(error);
    }
};

export const createTaskController = async (req, res, next) => {
    try{
        const {taskData} = req.body;
        const projectId = req.params.projectId;
        const task = await createTask(taskData, projectId);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        next(error);
    }
}

export const getTasksController = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.deadline) filter.deadline = req.query.deadline;
        if (req.query.title) filter.title = req.query.title;
        const tasks = await getTasks(projectId, filter, page, limit);
        res.status(200).json({
            success: true,
            message: 'Tasks fetched successfully',
            tasks
        });
    } catch (error) {
        next(error);
    }
};

export const updateTaskController = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        const { taskData } = req.body;
        const task = await updateTask(projectId, taskId, taskData);
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTaskController = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const taskId = req.params.taskId;
        await deleteTask(projectId, taskId);
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};





