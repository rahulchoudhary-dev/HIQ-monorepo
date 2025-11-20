'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Domain = sequelize.define(
    'Domain',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      report_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Reports',
          key: 'id',
        },
      },
      domain_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      domain_data: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      approved_as: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      review_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'Domains',
      timestamps: false,
      underscored: true,
    }
  );
  Domain.associate = (models) => {
    Domain.belongsTo(models.Report, {
      foreignKey: 'report_id',
      as: 'report',
      targetKey: 'id',
    });
  };

  return Domain;
};
