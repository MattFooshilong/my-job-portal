import { Request, Response, NextFunction } from "express"
//anti-csrf token
const generateCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
  const csrfToken = crypto.randomUUID()
  req.csrfToken = csrfToken
  res.cookie("cookieCsrfToken", csrfToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 })
  next()
}
const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  const cookieCsrfToken = req.cookies.cookieCsrfToken
  const formCSRFToken = req.body.values.csrfToken

  if (formCSRFToken === cookieCsrfToken) {
    next()
  } else {
    console.log("Invalid CSRF token")
    res.status(403).send("Invalid CSRF token")
  }
}

export { generateCSRFToken, validateCSRFToken }
