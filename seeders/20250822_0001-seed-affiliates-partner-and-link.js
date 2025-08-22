// seeders/20250822_0001-seed-affiliates-partner-and-link.js
// =====================================================================
'use strict';


module.exports = {
async up(queryInterface, Sequelize) {
// Partner de démo
const [partner] = await queryInterface.bulkInsert('affiliate_partners', [{
id: Sequelize.literal('gen_random_uuid()'),
name: 'Demo Partner',
email: 'partner@example.com',
status: 'active',
notes: 'Partenaire de démonstration',
createdAt: new Date(),
updatedAt: new Date()
}], { returning: ['id'] });


// Récupérer l'id (compat Postgres/Sequelize)
let partnerId = partner?.id;
if (!partnerId) {
const rows = await queryInterface.sequelize.query(
"SELECT id FROM affiliate_partners WHERE email = 'partner@example.com' ORDER BY createdAt DESC LIMIT 1;",
{ type: Sequelize.QueryTypes.SELECT }
);
partnerId = rows?.[0]?.id;
}


// Lien de démo (code fixe DEMO1234)
await queryInterface.bulkInsert('affiliate_links', [{
id: Sequelize.literal('gen_random_uuid()'),
partner_id: partnerId,
code: 'DEMO1234',
campaign: 'launch',
metadata: JSON.stringify({ note: 'Lien démo' }),
createdAt: new Date(),
updatedAt: new Date()
}]);
},


async down(queryInterface, Sequelize) {
await queryInterface.bulkDelete('affiliate_links', { code: 'DEMO1234' }).catch(()=>{});
await queryInterface.bulkDelete('affiliate_partners', { email: 'partner@example.com' }).catch(()=>{});
}
};
