// migrations/20250822_0002-create-affiliate-links.js
// =====================================================================
'use strict';


module.exports = {
async up(queryInterface, Sequelize) {
await queryInterface.createTable('affiliate_links', {
id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true, allowNull: false },
partner_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'affiliate_partners', key: 'id' }, onDelete: 'CASCADE' },
code: { type: Sequelize.STRING(64), allowNull: false, unique: true },
campaign: { type: Sequelize.STRING, allowNull: true },
metadata: { type: Sequelize.JSONB, allowNull: true },
createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});
await queryInterface.addIndex('affiliate_links', ['partner_id']);
},


async down(queryInterface) {
await queryInterface.removeIndex('affiliate_links', ['partner_id']).catch(()=>{});
await queryInterface.dropTable('affiliate_links');
}
};
