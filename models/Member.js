import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Member = sequelize.define('Member', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('pending', 'active'),
    defaultValue: 'pending',
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    allowNull: false,
  },
}, {
  tableName: 'members',
  indexes: [
    {
      unique: true,
      fields: ['group_id', 'user_id'],
    },
  ],
});

export default Member;
