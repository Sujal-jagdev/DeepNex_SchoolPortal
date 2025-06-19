/**
 * Middleware to validate required fields in request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Function} - Express middleware function
 */
exports.validateRequestBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate required query parameters
 * @param {Array} requiredParams - Array of required parameter names
 * @returns {Function} - Express middleware function
 */
exports.validateQueryParams = (requiredParams) => {
  return (req, res, next) => {
    const missingParams = [];
    
    for (const param of requiredParams) {
      if (!req.query[param]) {
        missingParams.push(param);
      }
    }
    
    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required query parameters: ${missingParams.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate ID parameter in request
 * @returns {Function} - Express middleware function
 */
exports.validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: `Missing required parameter: ${paramName}`
      });
    }
    
    next();
  };
};