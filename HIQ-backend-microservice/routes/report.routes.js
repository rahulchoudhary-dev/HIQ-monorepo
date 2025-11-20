const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/report.controller');

// router.post('/', upload.array('attachments', 5), reportsController.createReports);

router.post('/', reportsController.createReportsMetadata);

module.exports = router;
