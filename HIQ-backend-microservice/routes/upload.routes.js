const express = require('express');
const router = express.Router();
const { getPresignedUrls } = require('../controllers/upload.controller');

router.post('/', getPresignedUrls);

module.exports = router;
