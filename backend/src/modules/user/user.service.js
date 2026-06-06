import User from '../../models/user.js';
import { comparePassword, hashPassword } from '../../lib/bcrypt.js';
import { UniqueConstraintError } from 'sequelize';

export const changeInfo = async (userData, userId) => {
    const { firstName, lastName, email } = userData;
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        await user.save();
        return { message: 'User information updated successfully', user };
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            throw new Error('Email already in use');
        }
        throw new Error('Error updating user information');
    }
};

export const changePassword = async (passwordData, userId) => {
    const {currentPassword, newPassword, repeatNewPassword } = passwordData;
    try {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }
        const isCurrentPasswordValid = comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Invalid current password');
        }
        if (newPassword !== repeatNewPassword) {
            throw new Error('New passwords do not match');
        }
        const hashedNewPassword = hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();
        return { message: 'Password updated successfully' };
    } catch (error) {
        throw new Error('Error updating password');
    }
};

export const registerUser = async (userData) => {
    try {
        const checkEmail = await User.findOne({ where: { email: userData.email } });
        
        const hashedPassword = hashPassword(userData.password);
        const user = await User.create({ ...userData, password: hashedPassword });
        return user;
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            throw new Error('Email or username already in use');
        }
        throw new Error('Error registering user');
    }
}