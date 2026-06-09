import redisClient from '../../redis.js';

// Cache invalidation uses version counters rather than deleting every cached key.
// Incrementing the version makes all old keys for that resource unreachable,
// so reads will naturally repopulate the cache on the next request.

// Bumps the version for a specific project's cached data (members, tasks, etc.)
export const bumpProjectCacheVersion = async (projectId) => {
    await redisClient.incr(`project:${projectId}:version`);
};

// Bumps the version for a user's owned projects list cache
export const bumpUserProjectsCacheVersion = async (userId) => {
    await redisClient.incr(`user:${userId}:projects:version`);
};

// Bumps the version for a user's assigned tasks list cache
export const bumpUserTasksCacheVersion = async (userId) => {
    await redisClient.incr(`user:${userId}:tasks:version`);
};

// Bumps task cache versions for multiple users at once (used when a task is updated)
export const bumpUserTasksCacheVersions = async (userIds) => {
    const uniqueIds = [...new Set(userIds)]; // deduplicate before fanning out
    await Promise.all(uniqueIds.map((id) => bumpUserTasksCacheVersion(id)));
};
