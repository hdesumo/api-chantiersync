// models/License.js
module.exports = (sequelize, DataTypes) => {
  const License = sequelize.define("License", {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED"),
      defaultValue: "ACTIVE",
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return License;
};

