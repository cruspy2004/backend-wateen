'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const members = [
      // Engineering Team (group_id: 1)
      {
        group_id: 1,
        user_id: 1, // John Doe - Admin
        status: 'active',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        group_id: 1,
        user_id: 2, // Jane Smith - Member
        status: 'active',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        group_id: 1,
        user_id: 3, // Mike Johnson - Member
        status: 'active',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Marketing Team (group_id: 2)
      {
        group_id: 2,
        user_id: 2, // Jane Smith - Admin
        status: 'active',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        group_id: 2,
        user_id: 4, // Sarah Williams - Member
        status: 'active',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        group_id: 2,
        user_id: 5, // David Brown - Pending
        status: 'pending',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Sales Team (group_id: 3)
      {
        group_id: 3,
        user_id: 4, // Sarah Williams - Admin
        status: 'active',
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        group_id: 3,
        user_id: 1, // John Doe - Member
        status: 'active',
        role: 'member',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('members', members, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('members', null, {});
  }
};
