/**
 * Global dependencies
 */
const express = require('express');
const router = express.Router();
require('dotenv').config();

/**
 * GET
 * To process the token code submission
 */
router.get('/', (request, response, next) => {
  process.env.TOKEN_CODE = request.query.code;
  response.status(200);
  return response.send('Token code saved correctly');
});

module.exports = router;
