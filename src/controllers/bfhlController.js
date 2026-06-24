const graphService = require('../services/graphService');

// Retrieve identity fields from environment variables with safe defaults
const getIdentityFields = () => {
  return {
    user_id: process.env.USER_ID || 'yourname_ddmmyyyy',
    email_id: process.env.EMAIL_ID || 'your_college_email',
    college_roll_number: process.env.ROLL_NUMBER || 'your_roll_number'
  };
};

/**
 * GET /
 * Main root route returning simple running status
 */
exports.getRoot = (req, res) => {
  res.status(200).json({
    status: 'running'
  });
};

/**
 * GET /health
 * Dedicated health check endpoint reporting uptime, status, and server time
 */
exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

/**
 * POST /bfhl
 * Processes incoming array of relationships and generates graph output
 */
exports.processGraph = (req, res, next) => {
  try {
    const { data } = req.body;

    // Check if data field exists and is an array
    if (data === undefined) {
      return res.status(400).json({
        is_success: false,
        message: "Missing 'data' field in request body."
      });
    }

    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        message: "'data' field must be an array of strings."
      });
    }

    // Call service to process the graph data
    const result = graphService.processGraph(data);

    // Merge identity fields with the processed graph result
    const identities = getIdentityFields();
    
    res.status(200).json({
      is_success: true,
      ...identities,
      ...result
    });
  } catch (error) {
    next(error);
  }
};
