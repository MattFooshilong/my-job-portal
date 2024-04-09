const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err)
        res.redirect("/")
      } else next()
    })
  } else {
    res.redirect("/")
  }
}
module.exports = { verifyToken }
