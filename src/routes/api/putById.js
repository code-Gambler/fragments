// src/routes/api/putById.js
const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.info(`putById Route Called`);
    logger.debug(`putById Route Called ${req.params.id}`);
    let fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    const previousType = fragment.mimeType;

    logger.debug(`Checking type`);
    const type = req.get('content-Type');
    logger.debug(`New Type ${type}`);
    logger.debug(`Previous Type ${previousType}`);
    if (!type.includes(previousType)) {
      logger.debug("type didn't match to update");
      res
        .status(400)
        .createErrorResponse(400, "A fragment's type can not be changed after it is created.");
    }

    try {
      logger.info(`setting new data`);
      await fragment.setData(req.body);
      fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
      logger.debug(`Data set for fragment: ${fragment.id}`);
      res.setHeader('Content-Type', fragment.type);
      res.status(200).json(createSuccessResponse(fragment));
    } catch (error) {
      res.status(415).json(createErrorResponse(415, error.message));
    }
  } catch (error) {
    logger.error(`This id: ${req.params.id} is not valid`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
