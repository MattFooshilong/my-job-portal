//anti-csrf token
const generateCSRFToken = (req, res, next) => {
  const csrfToken = crypto.randomUUID()
  req.csrfToken = csrfToken
  res.cookie("cookieCsrfToken", csrfToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 1 * 60 * 60 * 1000 })
  next()
}
const validateCSRFToken = (req, res, next) => {
  const cookieCsrfToken = req.cookies.cookieCsrfToken
  const formCSRFToken = req.body.values.csrfToken

  if (formCSRFToken === cookieCsrfToken) {
    next()
  } else {
    res.status(403).send("Invalid CSRF token")
  }
}

module.exports = { generateCSRFToken, validateCSRFToken }
