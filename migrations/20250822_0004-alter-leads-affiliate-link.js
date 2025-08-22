// migrations/20250822_0004-alter-leads-affiliate-link.js
// (ajoute des colonnes si la table leads existe déjà)
// =====================================================================
'use strict';


module.exports = {
async up(queryInterface, Sequelize) {
// Ajouts idempotents (ignorent si colonne existe déjà)
async function addCol(table, col, spec) {
try { await queryInterface.addColumn(table, col, spec); } catch (e) { /* ignore if exists */ }
}
await addCol('leads', 'affiliate_link_id', { type: Sequelize.UUID, allowNull: true });
await addCol('leads', 'affiliate_code', { type: Sequelize.STRING(64), allowNull: true });
await addCol('leads', 'matched_by', { type: Sequelize.STRING(32), allowNull: true });
await addCol('leads', 'enterprise_id', { type: Sequelize.UUID, allowNull: true });
await addCol('leads', 'convertedAt', { type: Sequelize.DATE, allowNull: true });
await addCol('leads', 'status', { type: Sequelize.STRING(32), allowNull: true, defaultValue: 'lead' });


// Index utiles (ignorent si déjà présents)
async function addIdx(table, cols, opts) {
try { await queryInterface.addIndex(table, cols, opts); } catch (_) {}
}
await addIdx('leads', ['affiliate_link_id']);
await addIdx('leads', ['affiliate_code']);
await addIdx('leads', ['status']);
},


async down(queryInterface) {
await queryInterface.removeIndex('leads', ['status']).catch(()=>{});
await queryInterface.removeIndex('leads', ['affiliate_code']).catch(()=>{});
await queryInterface.removeIndex('leads', ['affiliate_link_id']).catch(()=>{});
await queryInterface.removeColumn('leads', 'convertedAt').catch(()=>{});
await queryInterface.removeColumn('leads', 'enterprise_id').catch(()=>{});
await queryInterface.removeColumn('leads', 'matched_by').catch(()=>{});
await queryInterface.removeColumn('leads', 'affiliate_code').catch(()=>{});
await queryInterface.removeColumn('leads', 'affiliate_link_id').catch(()=>{});
// (on laisse status si déjà utilisé par d'autres process)
}
};
