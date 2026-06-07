import joi from 'joi';

export const createTaskSchema = joi.object({
    taskData: joi.object({
        title: joi.string().required(),
        description: joi.string().optional(),
        deadline: joi.date().optional(),
        projectId: joi.number().integer().positive().required(),
    }).required()
});

export const updateTaskSchema = joi.object({
    taskData: joi.object({
        title: joi.string().optional(),
        description: joi.string().optional(),
        status: joi.string().valid('pending', 'in_progress', 'completed').optional(),
        deadline: joi.date().optional(),
    }).required()
});




