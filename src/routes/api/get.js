// src/routes/api/get.js
//Import our Successful Response function
const response = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');


/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  logger.info(`GET v1/fragments called`);

  Fragment.byUser(req.user, req.query?.expand)
    .then((fragments) => {
      logger.debug(`Fragments found: ${JSON.stringify(fragments)}`);
      res.status(200).json(
        response.createSuccessResponse({
          fragments: fragments,
        })
      );
    })
    .catch((error) => {
      logger.warn(`Failed to get fragments for user ${req.user.email}: ${error}`);
      res.status(500).json(
        response.createErrorResponse({
          message: `Something went wrong trying to get fragments for user ${req.user.email}`,
          code: 500,
        })
      );
    });
};
