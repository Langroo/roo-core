const express = require('express')
const router = express.Router()

/**
 * GET
 * Check if everything works correctly
 */
router.get('/', (request, response) => {
  response.status(200)
  return response.render('home')
})

/**
 * GET
 * A simple test route
 */
router.get('/test', async (request, response) => {
  response.status(200)
  return response.send('API testing is working properly!')
})

module.exports = router
