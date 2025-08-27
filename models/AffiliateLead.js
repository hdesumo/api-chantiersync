// models/AffiliateLead.js
module.exports = (sequelize, DataTypes) => {
  const AffiliateLead = sequelize.define("AffiliateLead", {
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

  AffiliateLead.associate = (models) => {
    // Un lead appartient à un partenaire
    AffiliateLead.belongsTo(models.AffiliatePartner, {
      foreignKey: "partnerId",
      as: "partner",
    });
  };

  return AffiliateLead;
};

