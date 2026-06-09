import joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const registerSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    password: joi.string().min(9).required().pattern(passwordPattern),
    email: joi.string().email().required(),
    firstName: joi.string().min(1).max(50).required(),
    lastName: joi.string().min(1).max(50).required(),
});

export const changeInfoSchema = joi.object({
    email: joi.string().email().required(),
    firstName: joi.string().min(1).max(50),
    lastName: joi.string().min(1).max(50),
});

export const changePasswordSchema = joi.object({
    currentPassword: joi.string(),
    newPassword: joi.string().min(9).required().pattern(passwordPattern),
    repeatNewPassword: joi.string().valid(joi.ref('newPassword')).required().messages({
        'any.only': 'Repeat new password must match new password',
    }),
});
