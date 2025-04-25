import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

interface MyAccessPayload extends JwtPayload {
  email: string
  roles: number[]
}

const verifyAccessToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = (req.headers.Authorization as string) || req.headers.authorization
  if (!authHeader) return
  if (!authHeader?.startsWith("Bearer ")) {
    res.sendStatus(500)
  }
  const accessToken = authHeader.split(" ")[1]
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    if (err) {
      console.log(`accessToken expired: ${err}`)
      res.sendStatus(403)
    }
    const payload = decoded as MyAccessPayload
    req.email = payload.email
    req.roles = payload.roles
    next()
  })
}
export { verifyAccessToken }
