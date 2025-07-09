import User from './User.js';
import Group from './Group.js';
import Member from './Member.js';
import Message from './Message.js';

// Define associations
User.hasMany(Member, { foreignKey: 'user_id', as: 'memberships' });
Member.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Group.hasMany(Member, { foreignKey: 'group_id', as: 'members' });
Member.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

Group.hasMany(Message, { foreignKey: 'group_id', as: 'messages' });
Message.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// Many-to-many relationship between Users and Groups through Members
User.belongsToMany(Group, { 
  through: Member, 
  foreignKey: 'user_id', 
  otherKey: 'group_id', 
  as: 'groups' 
});

Group.belongsToMany(User, { 
  through: Member, 
  foreignKey: 'group_id', 
  otherKey: 'user_id', 
  as: 'users' 
});

export { User, Group, Member, Message };
