'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    static associate(models) {}
  }

  Report.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      attachmentsUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      result: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      stage: {
        type: DataTypes.ENUM(
          'Pending',
          'Queued',
          'InProgress',
          'Completed',
          'Failed',
          'ExceedLimit'
        ),
        defaultValue: 'Pending',
      },
      status: {
        type: DataTypes.ENUM('Approved', 'Rejected', 'Needs-Review'),
        defaultValue: 'Needs-Review',
      },
      site: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      uploaded_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: DataTypes.UUIDV4,
      },
      reviewed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: DataTypes.UUIDV4,
      },
      reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      review_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      retry_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      uploadedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'Reports',
      timestamps: true,
    }
  );

  return Report;
};
