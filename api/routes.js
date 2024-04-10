const express = require("express")
const router = express.Router()
const cors = require("cors")
const authController = require("../controllers/authController")
const cookieParser = require("cookie-parser")
router.use(cookieParser())

//use - http://localhost:3001/api/
router.get("/", (req, res) => {
  console.log("testing")
  res.status(200).send("welcome")
})
router.post("/signup", authController.signUp)
router.post("/login", authController.login)
router.get("/logout", authController.logout)

router.get("/test-read-cookie", (req, res) => {
  res.status(200).send("cookie read")
})

module.exports = router
