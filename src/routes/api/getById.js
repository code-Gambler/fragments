const path = require('path');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const extension = path.extname(req.params.id);
    logger.debug('extension: ' + extension);

    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    logger.info('got fragment metadata ' + fragment.id);
    const data = await fragment.getData();
    logger.info('data for ' + fragment.id + ' is ' + data);
    const previousType = fragment.mimeType;
    logger.debug('fragment type : ' + fragment.type);

    const validConversionTypes = Fragment.validateConversion(previousType);
    logger.debug('valid conversion types for ' + previousType + ' are ' + validConversionTypes);
    const convertedExtensionType = Fragment.extConvert(extension.substring(1));

    //If no conversion is needed (no extension) or its the same extension
    if (!extension || previousType.includes(convertedExtensionType)) {
      logger.info('Entered here');
      res.setHeader('Content-Type', previousType);
      res.status(200).send(data);
    } else {
      if (!validConversionTypes.includes(extension)) {
        logger.debug('Not valid conversion type ' + extension + 'not in ' + validConversionTypes);
        res.status(415).json(createErrorResponse(415, 'Not supported conversion type'));
      } else if (previousType.startsWith('text') || previousType == 'application/json') {
        let result = await fragment.textConvert(data, convertedExtensionType);
        if (convertedExtensionType == 'json') {
          res.setHeader('Content-Type', `application/${convertedExtensionType}`);
        } else {
          res.setHeader('Content-Type', `text/${convertedExtensionType}`);
        }
        res.status(200).send(Buffer.from(result));
        logger.info(
          { targetType: convertedExtensionType },
          `Successful conversion to ${convertedExtensionType}`
        );
      } else {
        let result = await fragment.imageConvert(convertedExtensionType);
        res.setHeader('Content-Type', `image/${convertedExtensionType}`);
        res.status(200).send(result);
        logger.info(
          { targetType: convertedExtensionType },
          `Successful conversion to ${convertedExtensionType}`
        );
      }
    }
  } catch (err) {
    res.status(404).json(createErrorResponse(404, `Unknown Fragment`));
  }
};
