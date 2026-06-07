import Task from '../../models/task.js';
import Comment from '../../models/comment.js';
import User from '../../models/user.js';
import TaskAssignees from '../../models/task_assignees.js';
import { Op } from 'sequelize';

export const createTask = async ({taskData}) => {
    try {
        console.log('Creating task with data:', taskData);
        
        const task = await Task.create({
            title: taskData.title,
            description: taskData.description,
            deadline: taskData.deadline,
            projectId: taskData.projectId,
        });
        return task;
    } catch (error) {
        throw new Error('Error creating task');
    }
};

export const getTasks = async (projectId, filter) => {
    try {
        const whereClause = { projectId };
        if (filter && filter.status) {
            whereClause.status = filter.status;
        }
        const tasks = await Task.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks');
    }
};

export const updateTask = async (taskId, {taskData}) => {
    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        await task.update({
            title: taskData.title,
            description: taskData.description,
            status: taskData.status,
            deadline: taskData.deadline,
        });
        return task;
    } catch (error) {
        console.error('Error updating task:', error);
        throw new Error('Error updating task');
    }
};

export const deleteTask = async (taskId) => {
    try {
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        await task.destroy();
    } catch (error) {
        throw new Error('Error deleting task');
    }
};

export const getTaskById = async (taskId) => {
    try {
        const task = await Task.findByPk(taskId,{
            include: [{
                model: Comment,
                as: 'comments',
                attributes: ['id', 'content', 'createdAt'],
                include: {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username']
                }
            },
            {
                model: TaskAssignees,
                as: 'taskAssignments',
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            }
        ]
        });
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    } catch (error) {
        console.error('Error fetching task by ID:', error);
        throw new Error('Error fetching task');
    }
};

export const getOverdueTasks = async (projectId) => {
    try {
        const overdueTasks = await Task.findAll({
            where: {
                projectId,
                deadline: {
                    [Op.lt]: new Date()
                },
                status: {
                    [Op.ne]: 'completed'
                }
            },
            order: [['deadline', 'ASC']]
        });
        return overdueTasks;
    }catch (error) {
        console.error('Error fetching overdue tasks:', error);
        throw new Error('Error fetching overdue tasks');
    }
};

export const getUserTasks = async (userId) => {
    try {
        console.log('Fetching tasks for user ID:', userId);
        const tasks = await Task.findAll({
            include: [{
                model: TaskAssignees,
                as: 'taskAssignments',
                where: { userId: Number(userId)  },
                attributes: []
            }],
            order: [['createdAt', 'DESC']]
        });
        return tasks;
    } catch (error) {
        console.error('Error fetching own tasks:', error);
        throw new Error('Error fetching own tasks');
    }
};

export const assignTaskToUser = async (taskId, userId) => {
    try {
        console.log('Assigning task ID:', taskId, 'to user ID:', userId);
        const task = await Task.findByPk(taskId);
        if (!task) {
            throw new Error('Task not found');
        }
        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('User not found');
        }
        await TaskAssignees.create({
            taskId,
            userId
        });
    } catch (error) {
        console.error('Error assigning task to user:', error);
        throw new Error('Error assigning task to user');
    }
};

export const unassignTaskFromUser = async (taskId, userId) => {
    try {
        console.log('Unassigning task ID:', taskId, 'from user ID:', userId);
        const assignment = await TaskAssignees.findOne({
            where: {
                taskId,
                userId
            }
        });
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        await assignment.destroy();
    } catch (error) {
        console.error('Error unassigning task from user:', error);
        throw new Error('Error unassigning task from user');
    }
};
