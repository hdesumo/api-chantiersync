// models/site.js
/**
 * Modèle Site — ultra-léger (pas d'include par défaut)
 * Objectif : éviter toute surcharge qui pourrait bloquer /api/sites
 *
 * Champs courants pour un chantier : id, name, code, enterprise_id,
 * localisation simple. Adapte librement si tu as des colonnes en plus.
 */
module.exports = (sequelize, DataTypes) => {
  const Site = sequelize.define('Site', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Nom du site / chantier
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Code court (optionnel)
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Filtrage multi-entreprises (présent dans le JWT sous enterprise_id)
    enterprise_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    // (Optionnel) localisation simplifiée
    address: { type: DataTypes.STRING, allowNull: true },
    city:    { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },

    // (Optionnel) coordonnées
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    // (Optionnel) métadonnées JSON
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  }, {
    // IMPORTANT : on garde un defaultScope *léger*
    defaultScope: {
      attributes: {
        exclude: [
          // Mets ici d'éventuels champs lourds si existants
          'attachmentBinary',
          'bigBlobField',
        ],
      },
    },
    // Ajuste ces options si ton projet est en snake_case :
    // underscored: true,
    // tableName: 'sites',
    // freezeTableName: true,
    paranoid: false,  // pas de soft delete par défaut
    timestamps: true, // createdAt / updatedAt
    indexes: [
      { fields: ['enterprise_id'] },
      { fields: ['code'] },
      { fields: ['createdAt'] },
    ],
  });

  // Hooks légers (ex: normaliser le code)
  Site.addHook('beforeValidate', (site) => {
    if (site.code && typeof site.code === 'string') {
      site.code = site.code.trim();
      if (site.code.length === 0) site.code = null;
    }
  });

  // Associations (optionnelles, à activer si nécessaires — NE PAS inclure par défaut)
  Site.associate = (models) => {
    // Exemple si tu as un modèle Report avec FK site_id :
    // Site.hasMany(models.Report, { foreignKey: 'site_id', as: 'reports' });
    //
    // Exemple si tu as un modèle Enterprise :
    // Site.belongsTo(models.Enterprise, { foreignKey: 'enterprise_id', as: 'enterprise' });
  };

  // Scope optionnel pour relations, à utiliser explicitement (pas par défaut)
  Site.addScope('withRelations', {
    include: [
      // { model: sequelize.models.Report, as: 'reports', attributes: ['id','title','createdAt'], limit: 5 }
    ],
  });

  return Site;
};

