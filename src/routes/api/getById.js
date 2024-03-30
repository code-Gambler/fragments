// src/routes/api/getById.js
const path = require('path');
const md = require('markdown-it')({
  html: true,
});
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    logger.debug(`getById Called ${req.params.id}`);

    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);

    logger.debug(`Pulled fragment metaData for id: ${fragment.id}`);

    try {
      const fragmentData = await fragment.getData();
      logger.debug(`Pulled fragment Data for id: ${fragment.id}`);

      const extension = path.extname(req.params.id);
      logger.debug('extension: ' + extension);
      if (extension) {
        const convertableFormats = await fragment.formats;
        logger.debug('mimeType: ' + fragment.mimeType);
        logger.debug('convertable formats: ' + convertableFormats);
        let typeConvertedTo;
        let valid = true;
        if (extension === '.html') {
          typeConvertedTo = 'text/html';
        } else {
          valid = false;
        }
        if (!convertableFormats.includes(typeConvertedTo)) {
          valid = false;
        }
        logger.debug('valid: ' + valid);
        if (!valid) {
          return res
            .status(415)
            .json(
              createErrorResponse(
                415,
                'Extension provided is unsupported type or fragment cannot be converted to this type'
              )
            );
        }
        if (fragment.type === 'text/markdown' && typeConvertedTo === 'text/html') {
          logger.debug('convert from md to html: ');
          logger.debug(fragmentData.toString());
          let convertedResult = md.render(fragmentData.toString());
          logger.debug(convertedResult);
          convertedResult = Buffer.from(convertedResult);
          res.set('Content-Type', typeConvertedTo);
          res.status(200).send(convertedResult);
        }
      } else {
        logger.debug('fragment type in get id: ' + fragment.type);
        res.setHeader('Content-Type', fragment.type);
        res.status(200).send(fragmentData);
      }
    } catch (error) {
      res.status(415).json(createErrorResponse(415, error.message));
    }
  } catch (error) {
    logger.error(`This id: ${req.params.id} is not valid`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
