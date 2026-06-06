import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const taskAssignees = sequelize.define('TaskAssignees', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Tasks',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    
}, {
    timestamps: true
});

export default taskAssignees;