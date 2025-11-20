const { reportQueue } = require('./queue');
const { Report } = require('./models');
const { REPORT_LIMIT, REPORT_STAGE } = require('./constant');

async function scheduleReportsJob() {
  try {
    const reports = await Report.findAll({
      where: { stage: REPORT_STAGE },
      order: [['createdAt', 'ASC']],
      limit: REPORT_LIMIT,
    });
    if (reports.length > 0) {
      const reportIds = reports.map((r) => r.id);

      await Report.update({ stage: 'Queued' }, { where: { id: reportIds } });
      console.log(`📤 ${reportIds.length} reports moved to 'Queued':`, reportIds);

      await reportQueue.add('processReports', { reports });
      console.log(`🧩 Added ${reports.length} reports to queue`);
    } else {
      console.log('🕒 No pending reports found');
    }
  } catch (err) {
    console.error('❌ Error scheduling reports:', err.message);
  }
}

scheduleReportsJob();

setInterval(scheduleReportsJob, 3 * 60 * 1000);
