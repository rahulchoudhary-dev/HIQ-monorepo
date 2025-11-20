const { Report, sequelize } = require('../models');

async function storeReportsMetadata(reportData) {
  console.log('reportData', reportData);

  const transaction = await sequelize.transaction();

  try {
    const attachments = reportData?.attachments || [];
    if (!attachments.length) {
      throw new Error('No attachments provided');
    }
    console.log('attachments', attachments);
    const formattedReports = attachments.map((file) => ({
      userId: file.userId,
      attachmentsUrl: file.attachmentsUrl,
      fileName: file.fileName,
      path: file.path,
      size: file.size,
      result: file.result || null,
      stage: file?.stage || 'Pending',
      status: file?.status || 'Needs-Review',
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      site: file.site,
      uploaded_by: file.userId,
      reviewed_by: null,
      agent_id: file.agent_id || null,
      agent_name: file.agent_name || null,
    }));

    const createdReports = await Report.bulkCreate(formattedReports, {
      transaction,
      returning: true,
    });

    await transaction.commit();

    return {
      status: true,
      message:
        createdReports.length > 1
          ? `${createdReports.length} reports metadata stored successfully`
          : 'Report metadata stored successfully',
      data: createdReports,
    };
  } catch (err) {
    await transaction.rollback();
    throw new Error(`Failed to store reports metadata: ${err.message}`);
  }
}

module.exports = { storeReportsMetadata };
