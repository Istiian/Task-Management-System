import Task from '../../models/task.js';
import Comment from '../../models/comment.js';
import User from '../../models/user.js';
import TaskAssignees from '../../models/task_assignees.js';
import { ApiError } from '../../util/apiError.js';
import redisClient from '../../../redis.js';
import { bumpUserTasksCacheVersion } from '../../util/cache.js';

export const getTaskById = async (taskId) => {
    const cacheKey = `task:${taskId}`;
    const cachedTask = await redisClient.get(cacheKey);
    let task;

    if (cachedTask) {
        task = JSON.parse(cachedTask);
    } else {
        task = await Task.findByPk(taskId, {
            attributes: ['id', 'title', 'description', 'status', 'deadline', 'createdAt'],
        });
        if (!task) throw new ApiError(404, 'Task not found');
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(task));
    }

    return task;
};

export const getTaskAssignees = async (taskId) => {
    const cacheKey = `task:${taskId}:assignees`;
    const cachedAssignees = await redisClient.get(cacheKey);
    let assignees;

    if (cachedAssignees) {
        assignees = JSON.parse(cachedAssignees);
    } else {
        assignees = await TaskAssignees.findAll({
            where: { taskId },
            include: { model: User, as: 'user', attributes: ['username', 'email'] },
        });
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(assignees));
    }

    return assignees;
};

export const assignTaskToUser = async (taskId, memberId) => {
    const cacheKey = `task:${taskId}:assignees`;

    const task = await Task.findByPk(taskId);
    if (!task) throw new ApiError(404, 'Task not found');

    const user = await User.findByPk(memberId);
    if (!user) throw new ApiError(404, 'User not found');

    const existingAssignment = await TaskAssignees.findOne({ where: { taskId, userId: memberId } });
    if (existingAssignment) throw new ApiError(400, 'User is already assigned to this task');

    await redisClient.del(cacheKey); // invalidate assignees cache
    await bumpUserTasksCacheVersion(memberId); // the user's task list now needs to include this task
    return await TaskAssignees.create({ taskId, userId: memberId });
};

export const unassignTaskFromUser = async (taskId, memberId) => {
    const cacheKey = `task:${taskId}:assignees`;

    const assignment = await TaskAssignees.findOne({ where: { taskId, userId: memberId } });
    if (!assignment) throw new ApiError(404, 'Assignment not found');

    await redisClient.del(cacheKey);
    await bumpUserTasksCacheVersion(memberId); // the user's task list no longer includes this task
    await assignment.destroy();
};

export const createComment = async (content, authorId, taskId) => {
    const cacheKey = `task:${taskId}:comments`;
    const comment = await Comment.create({ content, authorId, taskId });
    await redisClient.del(cacheKey); // new comment means the cached list is stale
    return comment;
};

export const getTaskComments = async (taskId, page, limit) => {
    const cacheKey = `task:${taskId}:comments`;
    const cachedComments = await redisClient.get(cacheKey);
    let comments;

    if (cachedComments) {
        comments = JSON.parse(cachedComments);
    } else {
        comments = await Comment.findAll({
            where: { taskId },
            attributes: ['id', 'content', 'createdAt'],
            include: { model: User, as: 'author', attributes: ['username'] },
            order: [['createdAt', 'ASC']],
            offset: (page - 1) * limit,
            limit,
        });
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(comments));
    }

    return comments;
};
