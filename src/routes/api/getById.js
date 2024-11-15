// src/routes/api/getById.js
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.debug(`getById Called ${req.params.id}`);

    const fragment = await Fragment.byId(req.user, req.params.id);

    logger.debug(`Pulled fragment metaData for id: ${fragment.id}`);

    try {
      const fragmentData = await fragment.getData();
      logger.debug(`Pulled fragment Data for id: ${fragment.id}`);
      res.setHeader('Content-Type', fragment.type);
      res.status(200).send(fragmentData);
    } catch (error) {
      res.status(415).json(createErrorResponse(415, error.message));
    }
  } catch (error) {
    logger.error(`This id: ${req.params.id} is not valid`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
