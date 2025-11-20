"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Reports", "uploaded_by", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true,
    });

    await queryInterface.addColumn("Reports", "reviewed_by", {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true,
    });

    await queryInterface.addColumn("Reports", "reviewed_at", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("Reports", "review_notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Reports", "retry_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn("Reports", "site", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn("Reports", "status", {
      type: Sequelize.ENUM("Approved", "Rejected", "Needs-Review"),
      defaultValue: "Needs-Review",
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Reports", "uploaded_by");
    await queryInterface.removeColumn("Reports", "reviewed_by");
    await queryInterface.removeColumn("Reports", "reviewed_at");
    await queryInterface.removeColumn("Reports", "review_notes");
    await queryInterface.removeColumn("Reports", "retry_count");
    await queryInterface.removeColumn("Reports", "site");

    await queryInterface.changeColumn("Reports", "status", {
      type: Sequelize.ENUM("Approved", "Rejected", "Needs-Review"),
      defaultValue: "Needs-Review",
      allowNull: false,
    });
  },
};
