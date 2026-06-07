import {
    createTask, 
    getTasks, 
    getTaskById,
    updateTask, 
    deleteTask,
    getOverdueTasks,
    getUserTasks,
    assignTaskToUser,
    unassignTaskFromUser
} from './task.service.js';

export const createTaskController = async (req, res) => {
    try{
        const taskData = req.body;
        const task = await createTask(taskData);

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getTasksController = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const filter = req.query; // e.g., ?status=pending
        const tasks = await getTasks(projectId, filter);
        res.status(200).json({
            success: true,
            message: 'Tasks fetched successfully',
            tasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateTaskController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const taskData = req.body;
        
        const task = await updateTask(taskId, taskData);
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteTaskController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        await deleteTask(taskId);
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getTaskByIdController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        console.log('Fetching task with ID:', taskId);
        const task = await getTaskById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Task fetched successfully',
            task
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getOverdueTasksController = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        console.log('Fetching overdue tasks for project ID:', projectId);
        const overdueTasks = await getOverdueTasks(projectId);
        res.status(200).json({
            success: true,
            message: 'Overdue tasks fetched successfully',
            overdueTasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getUserTasksController = async (req, res) => {
    try {
        const userId = 3; // Assuming user ID is available in req.user
        const tasks = await getUserTasks(userId);
        res.status(200).json({
            success: true,
            message: 'User tasks fetched successfully',
            tasks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const assignTaskToUserController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { userId } = req.body;
        await assignTaskToUser(taskId, userId);
        res.status(200).json({
            success: true,
            message: 'Task assigned to user successfully'
        });
    } catch (error) {   
        res.status(500).json({ message: error.message });
    }
}

export const unassignTaskFromUserController = async (req, res) => {
    try {
        const taskId = req.params.taskId;
        const { userId } = req.body;
        await unassignTaskFromUser(taskId, userId);
        res.status(200).json({
            success: true,
            message: 'Task unassigned from user successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
