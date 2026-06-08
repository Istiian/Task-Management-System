import User from '../../models/user.js';
import { comparePassword, hashPassword } from '../../lib/bcrypt.js';
import { ApiError } from '../../util/apiError.js';
import { Op } from 'sequelize';

export const changeInfo = async (userData, userId) => {
    const { firstName, lastName, email } = userData;
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    const emailInUse = await User.findOne({ where: { email, id: { [Op.ne]: userId } } });
    if (emailInUse) {
        throw new ApiError(400, 'Email already in use');
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    await user.save();
    return user;
};

export const changePassword = async (passwordData, userId) => {
    const { currentPassword, newPassword, repeatNewPassword } = passwordData;

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new ApiError(400, 'Invalid current password');
    }
    if (newPassword !== repeatNewPassword) {
        throw new ApiError(400, 'New passwords do not match');
    }
    const hashedNewPassword = await hashPassword(newPassword);
    user.password = hashedNewPassword;
    await user.save();
    return user;
};

export const registerUser = async (userData) => {
    const checkEmail = await User.findOne({ where: { email: userData.email } });
    if (checkEmail) {
        throw new ApiError(400, 'Email already in use');
    }
    const hashedPassword = await hashPassword(userData.password);
    const user = await User.create({ ...userData, password: hashedPassword });
}