// migrations/20250822_0001-create-affiliate-partners.js
// =====================================================================
'use strict';


module.exports = {
async up(queryInterface, Sequelize) {
await queryInterface.createTable('affiliate_partners', {
id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true, allowNull: false },
name: { type: Sequelize.STRING, allowNull: false },
email: { type: Sequelize.STRING, allowNull: true },
status: { type: Sequelize.ENUM('active','paused','disabled'), allowNull: false, defaultValue: 'active' },
notes: { type: Sequelize.TEXT, allowNull: true },
createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});
await queryInterface.addIndex('affiliate_partners', ['status']);
await queryInterface.addIndex('affiliate_partners', ['email']);
},


async down(queryInterface, Sequelize) {
await queryInterface.removeIndex('affiliate_partners', ['email']).catch(()=>{});
await queryInterface.removeIndex('affiliate_partners', ['status']).catch(()=>{});
await queryInterface.dropTable('affiliate_partners');
await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_affiliate_partners_status\";");
}
};
