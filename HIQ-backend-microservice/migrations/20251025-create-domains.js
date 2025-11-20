"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Domains", {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
      },
      report_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Reports",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      domain_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      domain_data: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      approved_as: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      review_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reviewed_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("now()"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("domains");
  },
};
