import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ProjectMember = sequelize.define('ProjectMember', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Projects',
            key: 'id',
        },
        unique:false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        unique:false
    },
    role:{
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member'
    }
}, {
    timestamps: true
});

export default ProjectMember;