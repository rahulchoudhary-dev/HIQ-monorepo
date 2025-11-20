"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Reports", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      attachmentsUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      path: {
        type: Sequelize.STRING,
      },
      size: {
        type: Sequelize.STRING,
      },
      result: {
        type: Sequelize.TEXT,
      },
      stage: {
        type: Sequelize.ENUM(
          "Pending",
          "Queued",
          "InProgress",
          "Failed",
          "Completed"
        ),
        defaultValue: "Pending",
      },
      status: {
        type: Sequelize.ENUM("Approved", "Rejected", "Needs-Review"),
        defaultValue: "Needs-Review",
      },
      uploadedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Reports");
  },
};
