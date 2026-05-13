import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Order = sequelize.define('Order', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    razorpayOrderId: { type: DataTypes.STRING, allowNull: false, unique: true },
    razorpayPaymentId: { type: DataTypes.STRING, unique: true },
    razorpaySignature: { type: DataTypes.STRING },
    packageId: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.INTEGER, allowNull: false },           // in paise
    currency: { type: DataTypes.STRING, defaultValue: 'INR' },
    credits: { type: DataTypes.INTEGER, allowNull: false },
    status: {
        type: DataTypes.ENUM('created', 'paid', 'failed', 'refunded'),
        defaultValue: 'created',
    },
    receipt: { type: DataTypes.STRING },
    refundedAt: { type: DataTypes.DATE },
});

export default Order;
