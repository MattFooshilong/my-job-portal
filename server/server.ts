require("dotenv").config()
import express from "express"
import bodyParser from "body-parser"
import cors from "cors"
import routes from "./api/routes"
import path from "path"
import { verifyAccessToken } from "./middleware/verifyAccessToken"
import { getUser, updateProfileSettings, updateUserPublicProfile, updateUserApplyToJobs, userJobApplications } from "./controllers/userController"
import { generateCSRFToken, validateCSRFToken } from "./controllers/csrfController"
import { getJobsWhereThereIsApplication, updateJob } from "./controllers/jobsController"
import cookieParser from "cookie-parser"
import { Request, Response, NextFunction } from "express"

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
app.get("/", (req: Request, res: Response) => {
  res.send("Server up")
})

const allowedOrigins = ["http://localhost:3000", "https://my-job-portal-client.vercel.app"]

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(new Error("CORS: Origin is undefined"))
    }
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV == "staging") {
      console.log("origin: ", origin)
      return callback(null, true)
    }
    return callback(new Error(`origin: ${origin}`))
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
app.use(verifyAccessToken)
app.get("/user/:id", getUser)
app.get("/antiCSRF", generateCSRFToken, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken })
})
app.post("/user/:id", validateCSRFToken, updateProfileSettings)
app.post("/user-public-pref/:id", updateUserPublicProfile)
app.post("/user-job-applications", userJobApplications)
app.post("/apply-job/:id", updateUserApplyToJobs)
app.get("/get-jobs-where-there-is-application", getJobsWhereThereIsApplication)
app.get("/check-logged-in", getJobsWhereThereIsApplication)
app.post("/update-job/:jobId", updateJob)

app.use(express.static(path.join(__dirname, "./client/build")))
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"), (err) => {
    if (err) res.status(500).send("error")
  })
})

app.listen(process.env.PORT || port, () => console.log(`Server listening on port ${port}!`))
// This overrides the default error handler, and must be called last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)
  res.status(403).send(err.message)
})

module.exports = app
