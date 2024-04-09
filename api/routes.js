const express = require("express")
const router = express.Router()
const cors = require("cors")
const authController = require("../controllers/authController")
const cookieParser = require("cookie-parser")
router.use(cookieParser())
const whitelist = ["http://localhost:3000", "https://my-job-portal.vercel.app"]

const corsOptions = {
  origin: (origin, callback) => {
    try {
      if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV == "staging") {
        callback(null, true)
      } else {
        callback(new Error("Not Allowed By CORS"), false)
      }
    } catch (error) {
      console.error(error, "error-CORS")
    }
  },
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const corsAllowAll = {
  origin: "*",
  methods: "POST",
  preflightContinue: false,
  optionsSuccessStatus: 204,
}
//use - http://localhost:3001/api/
router.get("/", (req, res) => {
  console.log("testing")
  res.status(200).send("welcome")
})
router.post("/signup", authController.signUp)
router.post("/login", cors(corsAllowAll), authController.login)
router.get("/logout", cors(corsAllowAll), authController.logout)

router.get("/test-read-cookie", (req, res) => {
  res.status(200).send("cookie read")
})

module.exports = router
