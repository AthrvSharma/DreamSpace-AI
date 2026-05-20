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
    isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpires: { type: DataTypes.DATE, allowNull: true },
    verifyToken: { type: DataTypes.STRING, allowNull: true },
    verifyTokenExpires: { type: DataTypes.DATE, allowNull: true },
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

const Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    razorpayOrderId: { type: DataTypes.STRING, allowNull: false, unique: true },
    razorpayPaymentId: { type: DataTypes.STRING, unique: true },
    razorpaySignature: { type: DataTypes.STRING },
    packageId: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    currency: { type: DataTypes.STRING, defaultValue: 'INR' },
    credits: { type: DataTypes.INTEGER, allowNull: false },
    status: {
        type: DataTypes.ENUM('created', 'paid', 'failed', 'refunded'),
        defaultValue: 'created',
    },
    receipt: { type: DataTypes.STRING },
    refundedAt: { type: DataTypes.DATE },
});

const CreditHistory = sequelize.define('CreditHistory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: {
        type: DataTypes.ENUM('daily_reset', 'purchase', 'usage', 'admin_adjustment', 'refund'),
        allowNull: false,
    },
    amount: { type: DataTypes.INTEGER, allowNull: false },
    balance: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING },
    referenceId: { type: DataTypes.STRING },
});

const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    roomId: { type: DataTypes.UUID, allowNull: true },
    role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    style: { type: DataTypes.STRING, allowNull: true },
});


const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    type: {
        type: DataTypes.ENUM('info', 'success', 'warning', 'payment', 'system'),
        defaultValue: 'info',
    },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
    link: { type: DataTypes.STRING, allowNull: true },
});

// ── Associations ──

User.hasMany(Room, { foreignKey: 'userId', onDelete: 'CASCADE' });
Room.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(Redesign, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Redesign.belongsTo(Room, { foreignKey: 'roomId' });

Room.hasMany(Layout, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Layout.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(CreditHistory, { foreignKey: 'userId', onDelete: 'CASCADE' });
CreditHistory.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(ChatMessage, { foreignKey: 'userId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(User, { foreignKey: 'userId' });

Room.hasMany(ChatMessage, { foreignKey: 'roomId', onDelete: 'SET NULL' });
ChatMessage.belongsTo(Room, { foreignKey: 'roomId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

export { User, Room, Redesign, Layout, Asset, Order, CreditHistory, ChatMessage, Notification };
export default sequelize;
