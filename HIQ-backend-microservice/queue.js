require('dotenv').config();

const { Queue, Worker, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');
const axios = require('axios');
const { Report, Domain } = require('./models');

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest:
    process.env.REDIS_MAX_RETRIES === 'null' ? null : Number(process.env.REDIS_MAX_RETRIES),
  enableOfflineQueue: process.env.REDIS_ENABLE_OFFLINE_QUEUE === 'true',
});

const reportQueue = new Queue('reportQueue', { connection });

const queueEvents = new QueueEvents('reportQueue', { connection });
queueEvents.on('completed', ({ jobId }) => {
  console.log(`Job ${jobId} completed`);
});
queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed:`, failedReason);
});

const worker = new Worker(
  'reportQueue',
  async (job) => {
    const reports = job.data.reports;

    const results = await Promise.all(
      reports.map(async (report) => {
        console.log('Processing report:', report.id);

        try {
          const response = await axios.post(process.env.WEBHOOK_URL, {
            reportId: report.id,
            data: { ...report },
          });
          console.log('Response received for report:', response);
          if (response && response.data) {
            console.log('Response received for report:', report.id);

            // ✅ Handle ExceedLimit status
            if (response?.data?.status === 'ExceedLimit') {
              await Report.update(
                {
                  stage: 'ExceedLimit',
                  result: 'Report exceeds page limit.',
                },
                { where: { id: report.id } }
              );

              console.log(`⚠️ Report ${report.id} exceeded page limit — marked as ExceedLimit`);

              return {
                reportId: report.id,
                status: 'exceedLimit',
                message: response.data.message,
              };
            }

            // ✅ Normal Processing flow (Current original logic)
            await Report.update(
              {
                stage: 'Completed',
                result: JSON.stringify(response.data),
              },
              { where: { id: report.id } }
            );

            const [dbReport, created] = await Report.findOrCreate({
              where: { id: report.id },
            });

            const { domain_wise_jsons, domain_wise_texts } = response.data;

            if (domain_wise_jsons && Object.keys(domain_wise_jsons).length > 0) {
              const domainEntries = Object.entries(domain_wise_jsons);

              await Promise.all(
                domainEntries.map(async ([domainName, domainJson]) => {
                  try {
                    const domainText =
                      domain_wise_texts && domain_wise_texts[domainName]
                        ? domain_wise_texts[domainName]
                        : null;

                    const finalDomainData = {
                      ...domainJson,
                      domain_text: domainText,
                    };

                    await Domain.create({
                      report_id: dbReport.id,
                      domain_name: domainName,
                      domain_data: finalDomainData,
                      status: 'pending',
                    });

                    console.log(`✅ Stored domain "${domainName}" with merged JSON`);
                  } catch (error) {
                    console.error(
                      `❌ Failed to store domain "${domainName}" for report ${dbReport.id}:`,
                      error.message
                    );
                  }
                })
              );
            }

            return {
              reportId: report.id,
              status: 'success',
              result: response.data,
            };
          } else {
            console.warn(`No response data for report ${report.id}`);

            await Report.update(
              {
                stage: 'Failed',
                result: 'Empty or invalid response from API',
              },
              { where: { id: report.id } }
            );

            return { reportId: report.id, status: 'failed' };
          }
        } catch (err) {
          console.error('Error processing report:', report.id, err.message);

          await Report.update(
            {
              stage: 'Failed',
              result: err.message,
            },
            { where: { id: report.id } }
          );

          return { reportId: report.id, status: 'failed' };
        }
      })
    );

    return results;
  },
  { connection }
);

module.exports = { reportQueue };
