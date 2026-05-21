import joi from 'joi';

export const registerSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    password: joi.string().min(9).required().pattern(/^[a-zA-Z0-9]{6,30}$/),
    email: joi.string().email().required(),
    firstName: joi.string().min(1).max(50).required(),
    lastName: joi.string().min(1).max(50).required(),
}); 

export const loginSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    password: joi.string().min(6).required().pattern(/^[a-zA-Z0-9]{6,30}$/),
});

export const otpSchema = joi.object({
    email: joi.string().email().required(),
});

export const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    newPassword: joi.string().min(9).required().pattern(/^[a-zA-Z0-9]{6,30}$/),
    otp: joi.string().length(6).required(),
});

export const changeInfoSchema = joi.object({
    email: joi.string().email().required(),
    firstName: joi.string().min(1).max(50),
    lastName: joi.string().min(1).max(50),
});

export const changePasswordSchema = joi.object({
    currentPassword: joi.string().min(6).required().pattern(/^[a-zA-Z0-9]{6,30}$/),
    newPassword: joi.string().min(9).required().pattern(/^[a-zA-Z0-9]{6,30}$/),
    repeatNewPassword: joi.string().valid(joi.ref('newPassword')).required().messages({
        'any.only': 'Repeat new password must match new password',
    }),
});