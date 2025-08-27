// models/affiliatePartner.js
module.exports = (sequelize, DataTypes) => {
  const AffiliatePartner = sequelize.define("AffiliatePartner", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  AffiliatePartner.associate = (models) => {
    // Un partenaire peut avoir plusieurs leads
    AffiliatePartner.hasMany(models.AffiliateLead, {
      foreignKey: "partnerId",
      as: "leads",
    });
  };

  return AffiliatePartner;
};

