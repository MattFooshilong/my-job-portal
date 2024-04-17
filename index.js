require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const routes = require("./api/routes")
const path = require("path")
const verifyJWT = require("./middleware/verifyToken")
const userController = require("./controllers/userController")

// Globals
const app = express()
const port = 3001
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001/", "https://my-job-portal.vercel.app"]

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV == "staging") {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  optionsSuccessStatus: 200,
  credentials: true, //To enable HTTP cookies over CORS
}

const corsAllowAll = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true,
}
app.use(cors(corsOptions))
app.use("/api/", routes)
//protected routes
app.use(verifyJWT)
app.get("/user/:id", userController.getUser)
app.post("/user/:id", userController.updateUser)

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
