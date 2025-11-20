const reportsService = require('../services/reports.service');

// Receives metadata array from frontend
async function createReportsMetadata(req, res) {
  try {
    const { body } = req;
    console.log('body', body);
    // Expecting body to contain userId, site, result, and attachments array
    // attachments = [{ fileName, fileUrl, filekey, mimeType, size }]
    const result = await reportsService.storeReportsMetadata(body);

    return res.status(201).json(result);
  } catch (err) {
    console.error('Error storing reports metadata:', err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = { createReportsMetadata };
