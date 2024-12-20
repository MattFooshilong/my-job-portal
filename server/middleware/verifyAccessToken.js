const jwt = require("jsonwebtoken")

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(500)
  const accessToken = authHeader.split(" ")[1]
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
    if (err) {
      console.log(`accessToken expired: ${err}`)
      return res.sendStatus(403)
    }
    req.email = decodedToken.email
    req.roles = decodedToken.roles
    next()
  })
}
module.exports = verifyAccessToken
