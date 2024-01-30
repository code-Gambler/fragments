// src/routes/api/get.js
//Import our Successful Response function
const { createSuccessResponse } = require('../../response');

//Object that is returned on a successful call
const testArray = {
  fragments: ["test1", "test2"]
};

/**
 * Get a list of fragments for the current user
 */
module.exports = (req, res) => {
  // TODO: this is just a placeholder. To get something working, return an empty array...
  // res.status(200).json({
  //   status: 'ok',
  //   // TODO: change me
  //   fragments: ["test1", "test2"],
  // });
  res.status(200).json(createSuccessResponse(testArray));
};
