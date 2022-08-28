require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const authController = require('./controllers/authController')

// Globals
const app = express()
const port = process.env.PORT || 3001
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.options('*', cors())

app.post('/login', authController.login)

app.listen(port, () => console.log(`Server listening on port ${port}!`))
// This overrides the default error handler, and must be called last
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(403).send(err.message)
})