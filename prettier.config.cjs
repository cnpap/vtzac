// Use playground's Prettier config for consistent formatting across the repo
const fs = require('node:fs')
const path = require('node:path')

const configPath = path.resolve(__dirname, 'playground/.prettierrc')
module.exports = JSON.parse(fs.readFileSync(configPath, 'utf8'))
