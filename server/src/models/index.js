import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    plan: { type: DataTypes.ENUM('free', 'pro'), defaultValue: 'free' },
    credits: { type: DataTypes.INTEGER, defaultValue: 5 },
    lastCreditReset: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const Room = sequelize.define('Room', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    originalImageUrl: { type: DataTypes.STRING, allowNull: false },
    roomType: { type: DataTypes.STRING, defaultValue: 'living_room' },
});

const Redesign = sequelize.define('Redesign', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    style: { type: DataTypes.STRING, allowNull: false },
    prompt: { type: DataTypes.TEXT },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
});

const Layout = sequelize.define('Layout', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, defaultValue: 'Untitled Layout' },
    style: { type: DataTypes.STRING },
    layoutJson: { type: DataTypes.TEXT, allowNull: false },
    thumbnailUrl: { type: DataTypes.STRING },
});

const Asset = sequelize.define('Asset', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    defaultScale: { type: DataTypes.TEXT, defaultValue: '{"x":1,"y":1,"z":1}' },
    tags: { type: DataTypes.TEXT, defaultValue: '[]' },
    materialOptions: { type: DataTypes.TEXT, defaultValue: '[]' },
});

// Associations
User.hasMany(Room, { foreignKey: 'userId', onDelete: 'CASCADE' });
Room.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(Redesign, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Redesign.belongsTo(Room, { foreignKey: 'roomId' });

Room.hasMany(Layout, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Layout.belongsTo(Room, { foreignKey: 'roomId' });

export { User, Room, Redesign, Layout, Asset };
export default sequelize;
