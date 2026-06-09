import User from '../../models/user.js';
import Project from '../../models/project.js';
import Task from '../../models/task.js';
import TaskAssignees from '../../models/task_assignees.js';
import { comparePassword, hashPassword } from '../../lib/bcrypt.js';
import { ApiError } from '../../util/apiError.js';
import redisClient from '../../../redis.js';
import { Op } from 'sequelize';
import { sortQuery } from '../../util/keySorting.js';

export const getUserInfo = async (userId) => {
    const cacheKey = `user:${userId}:info`;
    let user = await redisClient.get(cacheKey);
    if (user) {
        return JSON.parse(user);
    } else {
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'firstName', 'lastName', 'email'],
        });
        if (!user) throw new ApiError(404, 'User not found');
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(user));
    }
    return user;
};

export const changeInfo = async (firstName, lastName, email, userId) => {
    const user = await User.findOne({
        where: { id: userId },
        attributes: ['id', 'firstName', 'lastName', 'email'],
    });
    if (!user) throw new ApiError(404, 'User not found');

    // Ensure no other account already uses this email
    const emailInUse = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
    if (emailInUse) throw new ApiError(400, 'Email already in use');

    // Only update fields that were provided
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    await user.save();

    await redisClient.del(`user:${userId}:info`); // invalidate stale cache
    return user;
};

export const changePassword = async (passwordData, userId) => {
    const { currentPassword, newPassword, repeatNewPassword } = passwordData;

    const user = await User.findOne({ where: { id: userId }, attributes: ['id', 'password'] });
    if (!user) throw new ApiError(404, 'User not found');

    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) throw new ApiError(400, 'Invalid current password');

    if (newPassword !== repeatNewPassword) throw new ApiError(400, 'New passwords do not match');

    user.password = await hashPassword(newPassword);
    await user.save();
    await redisClient.del(`user:${userId}:info`);
};

export const registerUser = async (userData) => {
    const checkEmail = await User.findOne({ where: { email: userData.email } });
    if (checkEmail) throw new ApiError(400, 'Email already in use');

    const hashedPassword = await hashPassword(userData.password);
    const user = await User.create({ ...userData, password: hashedPassword });
    return user;
};

export const getOwnedProjects = async (ownerId, filters, page, limit) => {
    // Build a version-tagged cache key so old results are skipped on any write
    const queryKey = sortQuery(filters || {});
    const version = (await redisClient.get(`user:${ownerId}:projects:version`)) || 1;
    const cacheKey = `user:${ownerId}:v${version}:projects:${JSON.stringify(queryKey)}:page:${page}:limit:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause = { ownerId };
    if (filters.status) whereClause.status = filters.status;
    if (filters?.name) whereClause.name = { [Op.like]: `%${filters.name}%` };

    const projects = await Project.findAll({
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(projects));
    return projects;
};

export const getUserTasks = async (userId, filters, page, limit) => {
    // Version-tagged cache key — same invalidation pattern as getOwnedProjects
    const queryKey = sortQuery(filters || {});
    const version = (await redisClient.get(`user:${userId}:tasks:version`)) || 1;
    const cacheKey = `user:${userId}:v${version}:tasks:${JSON.stringify(queryKey)}:page:${page}:limit:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const whereClause = {};
    if (filters.status) whereClause.status = filters.status;

    // Inner join on TaskAssignees to fetch only tasks assigned to this user
    const tasks = await Task.findAll({
        include: [{
            model: TaskAssignees,
            as: 'taskAssignments',
            where: { userId: Number(userId) },
            attributes: [],
            required: true,
        }],
        where: whereClause,
        limit,
        offset: (page - 1) * limit,
        order: [['createdAt', 'DESC']],
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(tasks));
    return tasks;
};
