import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CreditHistory = sequelize.define('CreditHistory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    type: {
        type: DataTypes.ENUM('daily_reset', 'purchase', 'usage', 'admin_adjustment', 'refund'),
        allowNull: false,
    },
    amount: { type: DataTypes.INTEGER, allowNull: false },  // positive = credit, negative = debit
    balance: { type: DataTypes.INTEGER, allowNull: false }, // balance after transaction
    description: { type: DataTypes.STRING },
    referenceId: { type: DataTypes.STRING },               // orderId or redesignId
});

export default CreditHistory;
