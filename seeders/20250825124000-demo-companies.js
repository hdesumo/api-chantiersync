'use strict';

module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert('companies', [
      {
        name: 'BatiPlus Sénégal',
        phone: '+221771234567',
        address: 'Dakar, Sénégal',
        logo_url: null,
        leaders: JSON.stringify(['Amadou Ndiaye', 'Mame Diop']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Constructiva CI',
        phone: '+22501020304',
        address: 'Abidjan, Côte d’Ivoire',
        logo_url: null,
        leaders: JSON.stringify(['A. Kouassi']),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface) {
    await queryInterface.bulkDelete('companies', null, {});
  }
};
