require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const routes = require("./api/routes")
const path = require("path")

// Globals
const app = express()
const port = 3001
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes
app.options("*", cors())
app.use("/api/", routes)

app.use(express.static(path.join(__dirname, "./client/build")))
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"), (err) => {
    if (err) res.status(500).send("error")
  })
})

app.listen(process.env.PORT || port, () => console.log(`Server listening on port ${port}!`))
// This overrides the default error handler, and must be called last
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(403).send(err.message)
})

module.exports = app
