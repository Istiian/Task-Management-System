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
    role: joi.string().valid('admin', 'member').required(),
});

export const updateProjectMemberRoleSchema = joi.object({
   role: joi.string().valid('admin', 'member').required(),
});

export const createTaskSchema = joi.object({
    taskData: joi.object({
        title: joi.string().required(),
        description: joi.string().optional(),
        deadline: joi.date().optional(),
    }).required()
});

export const updateTaskSchema = joi.object({
    taskData: joi.object({
        title: joi.string().optional(),
        description: joi.string().optional(),
        deadline: joi.date().optional(),
    }).required()
});
