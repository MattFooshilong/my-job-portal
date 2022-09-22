require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const routes = require('./routes/routes')
const authController = require('./controllers/authController')
const path = require('path');
const fs = require('fs');
// Globals
const app = express()
const port = 3001
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.options('*', cors())
app.use('/api/', routes)

app.get('/', (req, res) => {
    res.status(200).send('welcome')
})



app.use(express.static(path.join(__dirname, '../client/build')))
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'), (err) => {
        if (err) res.send('error')
    })
})

app.listen(process.env.PORT || port, () => console.log(`Server listening on port ${port}!`))
// This overrides the default error handler, and must be called last
app.use((err, req, res, next) => {
    console.error(err.message)
    res.status(403).send(err.message)
})

module.exports = app