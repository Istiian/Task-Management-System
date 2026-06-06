import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
});
