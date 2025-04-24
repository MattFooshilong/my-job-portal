import { Router } from "express"
import { login, signUp, logout } from "../controllers/authController"
import refreshTokenController from "../controllers/refreshTokenController"
import jobsController from "../controllers/jobsController"
import cookieParser from "cookie-parser"
const router = Router()
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
router.post("/signup", signUp)
router.post("/login", login)
router.get("/logout", logout)
router.get("/refreshToken", refreshTokenController.refreshToken)
router.get("/jobs", jobsController.getAllJobs)
router.get("/job/:jobId", jobsController.getOneJob)

router.get("/test-read-cookie", (req, res) => {
  res.status(200).send("cookie read")
})

export default router
