import Task from "../models/task.js";


export const createTask = async (req, res) => {
    const { title, description, status, deadline } = req.body;
    const userId = req.user.id;
    try {

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to create a task' });
        }

        const newTask = await Task.create({ title, description, status, deadline, userId });
        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error: error.message });
    }
};

export const getTasks = async (req, res) => {
    const userId = req.user.id;
    try {
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to fetch tasks' });
        }
        const tasks = await Task.findAll({ where: { userId } });
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

export const updateTask = async (req, res) => {
    const { title, description, status, deadline } = req.body;
    const taskId = req.params.id;
    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await task.update({ title, description, status, deadline });
        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error: error.message });
    }
};

export const archivedTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await task.update({ archived: true });
        res.status(200).json({ message: 'Task archived successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error archiving task', error: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        await task.destroy();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};


