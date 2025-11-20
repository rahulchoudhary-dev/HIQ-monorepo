'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Reports_stage" ADD VALUE IF NOT EXISTS 'ExceedLimit';
    `);
  },

  async down(queryInterface, Sequelize) {
    // ⚠️ Removing ENUM values in Postgres isn't simple.
    // So we recreate the enum without exceed_limit.

    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Reports_stage_new" AS ENUM (
        'Pending',
        'Queued',
        'InProgress',
        'Failed',
        'Completed'
      );
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "Reports"
      ALTER COLUMN "stage" TYPE "enum_Reports_stage_new"
      USING stage::text::"enum_Reports_stage_new";
    `);

    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Reports_stage";
    `);

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_Reports_stage_new"
      RENAME TO "enum_Reports_stage";
    `);
  },
};
