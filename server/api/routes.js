const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const refreshTokenController = require("../controllers/refreshTokenController")
const jobsController = require("../controllers/jobsController")

const cookieParser = require("cookie-parser")
router.use(cookieParser())

//use - http://localhost:3001/api/
router.get("/", (req, res) => {
  console.log("testing")
  res.status(200).send("welcome")
})
router.post("/testcsrf", (req, res) => {
  console.log("testcsrf fn in req.body.csrfToken: ", req.body.csrfToken)
  res.status(200).send("csrf successful")
})
router.post("/signup", authController.signUp)
router.post("/login", authController.login)
router.get("/logout", authController.logout)
router.get("/refreshToken", refreshTokenController.refreshToken)
router.get("/jobs", jobsController.getAllJobs)
router.get("/job/:jobId", jobsController.getOneJob)

router.get("/test-read-cookie", (req, res) => {
  res.status(200).send("cookie read")
})

module.exports = router
