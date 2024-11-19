require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const routes = require("./api/routes")
const path = require("path")
const verifyAccessTokenJWT = require("./middleware/verifyAccessToken")
const userController = require("./controllers/userController")
const csrfController = require("./controllers/csrfController")
const jobsController = require("./controllers/jobsController")
const cookieParser = require("cookie-parser")

// Globals
const app = express()
app.use(cookieParser())
const port = 3001
//CSP
//app.use(function (req, res, next) {
//  res.setHeader("Content-Security-Policy-Report-Only", "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'")
//  next()
//})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.get("/", (req, res) => {
  res.send("Server up")
})

const allowedOrigins = ["http://localhost:3000", "https://my-job-portal-client.vercel.app"]

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV == "staging") {
      console.log("origin: ", origin)
      callback(null, true)
    } else {
      callback(new Error(`origin: ${origin}`))
    }
  },
  optionsSuccessStatus: 200,
  credentials: true, //To enable HTTP cookies over CORS
}

const corsAllowAll = {
  optionsSuccessStatus: 200,
  credentials: true,
}
app.use(cors(corsOptions))

//public routes
app.use("/api/", routes)
//protected routes
app.use(verifyAccessTokenJWT)
app.get("/user/:id", userController.getUser)
app.get("/antiCSRF", csrfController.generateCSRFToken, (req, res) => {
  res.json({ csrfToken: req.csrfToken })
})
app.post("/user/:id", csrfController.validateCSRFToken, userController.updateProfileSettings)
app.post("/user-public-pref/:id", userController.updateUserPublicProfile)
app.post("/user-job-applications", userController.userJobApplications)
app.post("/apply-job/:id", userController.updateUserApplyToJobs)
app.get("/get-jobs-where-there-is-application", jobsController.getJobsWhereThereIsApplication)
app.get("/check-logged-in", jobsController.getJobsWhereThereIsApplication)

app.post("/update-job/:jobId", jobsController.updateJob)

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
