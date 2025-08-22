// migrations/20250822_0003-create-conversions.js
// =====================================================================
'use strict';


module.exports = {
async up(queryInterface, Sequelize) {
await queryInterface.createTable('conversions', {
id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true, allowNull: false },
tenant_id: { type: Sequelize.UUID, allowNull: false },
enterprise_id: { type: Sequelize.UUID, allowNull: true },
user_id: { type: Sequelize.UUID, allowNull: true },
affiliate_code: { type: Sequelize.STRING(64), allowNull: true },
converted_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});
await queryInterface.addIndex('conversions', ['affiliate_code']);
await queryInterface.addIndex('conversions', ['tenant_id']);
},


async down(queryInterface) {
await queryInterface.removeIndex('conversions', ['tenant_id']).catch(()=>{});
await queryInterface.removeIndex('conversions', ['affiliate_code']).catch(()=>{});
await queryInterface.dropTable('conversions');
}
};
