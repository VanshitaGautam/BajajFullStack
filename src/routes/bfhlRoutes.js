const express = require('express');
const router = express.Router();
const bfhlController = require('../controllers/bfhlController');

// GET / - Root endpoint returning server status
router.get('/', bfhlController.getRoot);

// GET /health - Dedicated health check endpoint for cloud environments
router.get('/health', bfhlController.getHealth);

// POST /bfhl - Main graph/hierarchy processing endpoint
router.post('/bfhl', bfhlController.processGraph);

module.exports = router;
