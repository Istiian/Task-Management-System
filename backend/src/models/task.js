import sequelize from '../config/db.js';
import { DataTypes} from "sequelize";

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
        defaultValue: 'pending',
    },
    deadline:{
        type: DataTypes.DATE,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        foreignKey: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
    notificationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        foreignKey: true,
        references: {
            model: 'Projects',
            key: 'id',
        },
    },
    
});


export default Task;