import joi from 'joi';

export const commentSchema = joi.object({
    content: joi.string().required(),
    authorId: joi.number().integer().required(),
    taskId: joi.number().integer().required()
});