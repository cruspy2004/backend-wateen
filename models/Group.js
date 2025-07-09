import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
}, {
  tableName: 'groups',
});

export default Group;
