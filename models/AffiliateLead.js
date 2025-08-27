// models/AffiliateLead.js
module.exports = (sequelize, DataTypes) => {
  const AffiliateLead = sequelize.define("AffiliateLead", {
    // Exemple de champs — adapte selon ta table réelle
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  // Associations (si besoin)
  AffiliateLead.associate = (models) => {
    // Exemple : un lead appartient à un partenaire
    AffiliateLead.belongsTo(models.affiliatePartner, {
      foreignKey: "partnerId",
      as: "partner",
    });
  };

  return AffiliateLead;
};

