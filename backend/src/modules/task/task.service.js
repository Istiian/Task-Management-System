import Task from '../../models/task.js';
import Comment from '../../models/comment.js';
import User from '../../models/user.js';
import TaskAssignees from '../../models/task_assignees.js';
import { Op } from 'sequelize';
import { ApiError } from '../../util/apiError.js';

export const createTask = async ( taskData ) => {
    const task = await Task.create({
        title: taskData.title,
        description: taskData.description,
        deadline: taskData.deadline,
        projectId: taskData.projectId,
    });
    return task;
};

export const getTasks = async (projectId, filter) => {
    const whereClause = { projectId };
    if (filter && filter.status) {
        whereClause.status = filter.status;
    }
    const tasks = await Task.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
    });
    return tasks;
};

export const updateTask = async (taskId, taskData ) => {

    const task = await Task.findByPk(taskId);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    await task.update({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        deadline: taskData.deadline,
    });
    return task;
};

export const deleteTask = async (taskId) => {

    const task = await Task.findByPk(taskId);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }
    await task.destroy();
};

export const getTaskById = async (taskId) => {

    const task = await Task.findByPk(taskId, {
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
        throw new ApiError(404, 'Task not found');
    }
    return task;
};

export const getOverdueTasks = async (projectId) => {
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
};

export const getUserTasks = async (userId) => {
    const tasks = await Task.findAll({
        include: [{
            model: TaskAssignees,
            as: 'taskAssignments',
            where: { userId: Number(userId) },
            attributes: []
        }],
        order: [['createdAt', 'DESC']]
    });
    return tasks;
};

export const assignTaskToUser = async (taskId, userId) => {
    const task = await Task.findByPk(taskId);
    if (!task) {
        throw ApiError(404, 'Task not found');
    }
    const user = await User.findByPk(userId);
    if (!user) {
        throw ApiError(404, 'User not found');
    }
    const existingAssignment = await TaskAssignees.findOne({
        where: {
            taskId,
            userId
        }
    });
    if (existingAssignment) {
        throw new ApiError(400, 'User is already assigned to this task');
    }

    return await TaskAssignees.create({
        taskId,
        userId
    });
};

export const unassignTaskFromUser = async (taskId, userId) => {
    const assignment = await TaskAssignees.findOne({
        where: {
            taskId,
            userId
        }
    });
    if (!assignment) {
        throw new ApiError(404, 'Assignment not found');
    }
    await assignment.destroy();
};
