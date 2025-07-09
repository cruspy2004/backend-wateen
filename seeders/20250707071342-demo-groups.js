'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const groups = [
      {
        name: 'Engineering Team',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Marketing Team',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sales Team',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Support Team',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'HR Team',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('groups', groups, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('groups', null, {});
  }
};
