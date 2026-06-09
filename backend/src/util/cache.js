import redisClient from '../../redis.js';

export const bumpProjectCacheVersion = async (projectId) => {
    await redisClient.incr(`project:${projectId}:version`);
};

export const bumpUserProjectsCacheVersion = async (userId) => {
    await redisClient.incr(`user:${userId}:projects:version`);
};

export const bumpUserTasksCacheVersion = async (userId) => {
    await redisClient.incr(`user:${userId}:tasks:version`);
};

export const bumpUserTasksCacheVersions = async (userIds) => {
    const uniqueIds = [...new Set(userIds)];
    await Promise.all(uniqueIds.map((id) => bumpUserTasksCacheVersion(id)));
};
