'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Vérifie si l'affiliate existe déjà
    const [affiliate] = await queryInterface.sequelize.query(
      "SELECT id FROM affiliates WHERE code = 'DEMO1234' LIMIT 1;"
    );

    if (affiliate.length === 0) {
      await queryInterface.bulkInsert('affiliates', [{
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'Demo Partner',
        code: 'DEMO1234',
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
      console.log('✅ Affiliate DEMO1234 créé');
    } else {
      console.log('⚠️ Affiliate DEMO1234 existe déjà, seed ignoré.');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('affiliates', { code: 'DEMO1234' });
  }
};

