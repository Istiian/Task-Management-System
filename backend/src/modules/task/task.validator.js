import joi from 'joi';

export const commentSchema = joi.object({
    content: joi.string().required()
});