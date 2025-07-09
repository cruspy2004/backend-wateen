'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 12),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 12),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 12),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'David Brown',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', 12),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
