import { changeInfo, changePassword, registerUser } from './user.service.js';

export const changeInfoHandler = async (req, res) => {
    const userId = req.params.id;
    const { firstName, lastName, email } = req.body;

    try {
        const result = await changeInfo({ firstName, lastName, email }, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const changePasswordHandler = async (req, res) => {
    const userId = req.params.id;
    const { currentPassword, newPassword, repeatNewPassword } = req.body;
    try {
        const result = await changePassword({ currentPassword, newPassword, repeatNewPassword }, userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const registerUserHandler = async (req, res) => {
    try {
        const user = await registerUser(req, res, req.body);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};


