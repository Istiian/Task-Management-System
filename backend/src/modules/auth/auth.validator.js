import joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    password: joi.string().min(6).required().pattern(passwordPattern).messages({
        'string.pattern.base': 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.',
    }),
});

export const otpSchema = joi.object({
    email: joi.string().email().required(),
});

export const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    newPassword: joi.string().min(8).required().pattern(passwordPattern).messages({
        'string.pattern.base': 'New password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.',
    }),
    repeatNewPassword: joi.string().valid(joi.ref('newPassword')).required().messages({
        'any.only': 'Repeat new password must match the new password.',
    }),
    otp: joi.string().length(6).required(),
});
