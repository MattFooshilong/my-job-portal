// eslint-disable-next-line no-undef
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportWidth: 1200,
  viewportHeight: 600,
  e2e: {
    baseUrl: 'http://localhost:3000'
  }
})
