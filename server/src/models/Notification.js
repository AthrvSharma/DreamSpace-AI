import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: {
        type: DataTypes.ENUM('info', 'success', 'warning', 'payment', 'system'),
        defaultValue: 'info',
    },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
    link: { type: DataTypes.STRING, allowNull: true },  // optional route to navigate to
});

export default Notification;
