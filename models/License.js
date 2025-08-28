module.exports = (sequelize, DataTypes) => {
  const License = sequelize.define("License", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enterprise_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: "licenses",
    underscored: true, // 👈 maps created_at / updated_at
    timestamps: true,  // Sequelize gère created_at / updated_at
  });

  return License;
};

