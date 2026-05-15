import joi from 'joi';

export const registerSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    password: joi.string().min(6).required().pattern(/^[a-zA-Z0-9]{6,30}$/),
    email: joi.string().email().required()
}); 
