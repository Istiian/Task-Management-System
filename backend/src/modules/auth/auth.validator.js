import joi from 'joi';

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

export const refreshTokenSchema = joi.object({
    refreshToken: joi.string().required(),
});
