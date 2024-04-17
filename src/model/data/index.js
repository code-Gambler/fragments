// src/model/data/index.js
const logger = require('../../logger');

// If the environment sets an AWS Region, we'll use AWS backend
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
if (process.env.AWS_REGION) {
  logger.debug(`Using AWS storage as the value of AWS region: ${process.env.AWS_REGION}`);
}
else {
  logger.debug(`Using memoryDb as there is no value of AWS region`);
}
module.exports = process.env.AWS_REGION ? require('./aws') : require('./memory');
