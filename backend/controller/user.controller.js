import bcrypt from 'bcrypt';
import { hashPassword } from '../service/auth.service.js';
import User from '../models/user.js';

export const changeInfo = async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const {id} = req.params;
    try {
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        await user.save();
        res.json({ message: 'User information updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user information', error: error.message });
    }
};

export const changePassword = async (req, res) => {
    const {currentPassword, newPassword, repeatNewPassword } = req.body;
    const {id} = req.params;
    try {
        const user = await User.findOne({ where: { id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isCurrentPasswordValid = bcrypt.compareSync(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        if (newPassword !== repeatNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        const hashedNewPassword = hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};
