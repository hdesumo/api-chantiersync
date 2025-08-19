// models/User.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    enterprise_id: { type: DataTypes.UUID, allowNull: false },
    full_name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    phone: { type: DataTypes.STRING },
    role: { type: DataTypes.ENUM('SUPERADMIN','ADMIN','SITE_MANAGER'), allowNull: false, defaultValue: 'ADMIN' },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'users' });
};

