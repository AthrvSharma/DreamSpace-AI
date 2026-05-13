import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    roomId: { type: DataTypes.UUID, allowNull: true },        // optional: linked to a room context
    role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    style: { type: DataTypes.STRING, allowNull: true },       // design style discussed
});

export default ChatMessage;
