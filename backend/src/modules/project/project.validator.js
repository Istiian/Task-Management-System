import joi from 'joi';

export const createProjectSchema = joi.object({
    name: joi.string().min(1).max(100).required(),
    description: joi.string().max(1000).allow('', null),
});

export const updateProjectSchema = joi.object({
    name: joi.string().min(1).max(100),
    description: joi.string().max(1000).allow('', null),
    status: joi.string().valid('active', 'archived'),
}).min(1);

export const addProjectMemberSchema = joi.object({
    userId: joi.number().integer().positive().required(),
});

export const removeProjectMemberSchema = joi.object({
    userId: joi.number().integer().positive().required(),
});

export const updateProjectMemberRoleSchema = joi.object({
    userId: joi.number().integer().positive().required(),
    role: joi.string().valid('admin', 'member').required(),
});
