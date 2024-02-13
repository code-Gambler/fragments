// src/routes/api/post.js

const response = require('../../response');
const { Fragment } = require('../../model/fragment');
require('dotenv').config();
const logger = require('../../logger');

const url = process.env.API_URL;

module.exports = async (req, res) => {
  try {
    logger.debug(`POST Fragments called`);
    if (!Buffer.isBuffer(req.body)) {
      logger.error(`POST Contains Unsupported Data(body is not of Buffer type)`);
      return res
        .status(415)
        .json(
          response.createErrorResponse(
            415,
            'Body should contain a Buffer Data Type'
          )
        );
    }
    logger.debug(`POST has a body with Proper DataType(Buffer)`);
    const fragment = new Fragment({
      ownerId: req.user,
      type: req.get('Content-Type'),
    });
    logger.debug(`POST - Fragment created`);
    await fragment.save();
    await fragment.setData(req.body);
    logger.debug(`POST - Fragment saved`);
    res.setHeader('Location', url + '/v1/fragments/' + fragment.id);
    logger.debug(`POST - Location header set`);
    return res.status(201).json(
      response.createSuccessResponse({
        status: 'ok',
        fragment: fragment,
      })
    );
  } catch (err) {
    logger.error(`POST - Internal Server Error: ${err}`);
    return res.status(500).json(response.createErrorResponse(500, err.message));
  }
};
