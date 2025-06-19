const fs = require('fs');
const path = require('path');

/**
 * Cleanup uploaded files that are older than the specified time
 * @param {string} directory - Directory to clean up
 * @param {number} maxAgeMs - Maximum age of files in milliseconds
 */
exports.cleanupOldFiles = (directory, maxAgeMs) => {
  const now = Date.now();
  
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directory}:`, err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      
      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error(`Error getting stats for file ${filePath}:`, err);
          return;
        }
        
        if (now - stat.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, err => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
              return;
            }
            console.log(`Deleted old file: ${filePath}`);
          });
        }
      });
    });
  });
};

/**
 * Ensure a directory exists, create it if it doesn't
 * @param {string} directory - Directory to ensure exists
 */
exports.ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Created directory: ${directory}`);
  }
};

/**
 * Schedule periodic cleanup of a directory
 * @param {string} directory - Directory to clean up
 * @param {number} intervalMs - Interval between cleanups in milliseconds
 * @param {number} maxAgeMs - Maximum age of files in milliseconds
 * @returns {NodeJS.Timeout} - The interval timer
 */
exports.scheduleFileCleanup = (directory, intervalMs, maxAgeMs) => {
  // Ensure the directory exists
  this.ensureDirectoryExists(directory);
  
  // Schedule periodic cleanup
  return setInterval(() => {
    this.cleanupOldFiles(directory, maxAgeMs);
  }, intervalMs);
};