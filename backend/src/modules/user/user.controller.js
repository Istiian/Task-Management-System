import { changeInfo, changePassword, registerUser } from './user.service.js';

export const changeInfoHandler = async (req, res, next) => {
    const userId = req.params.id;
    const { firstName, lastName, email } = req.body;

    try {
        const result = await changeInfo({ firstName, lastName, email }, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const changePasswordHandler = async (req, res, next) => {
    const userId = req.user.id;
    const { currentPassword, newPassword, repeatNewPassword } = req.body;
    try {
        const result = await changePassword({ currentPassword, newPassword, repeatNewPassword }, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const registerUserHandler = async (req, res, next) => {
    try {
        const userData = req.body;
        const user = await registerUser(userData);
        res.status(201).json({ message: 'User registered successfully'});
    } catch (error) {
        next(error);
    }
};


