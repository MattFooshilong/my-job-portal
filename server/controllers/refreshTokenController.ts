import jwt, { JwtPayload } from "jsonwebtoken"
import { firebaseApp } from "../firebaseServerInit/firebaseInit"
import { getDocs, getFirestore, collection, where, query } from "firebase/firestore"
import { Request, Response } from "express"

interface MyPayload extends JwtPayload {
  email: string
}
const db = getFirestore(firebaseApp)

const findUserWithRefreshToken = async (refreshToken: string) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("refreshToken", "==", refreshToken))
    const snapshot = await getDocs(q)
    const user = {
      userId: "",
      email: "",
      roles: [],
    }
    snapshot.forEach((doc) => {
      const data = doc.data()
      user.userId = doc?.id
      user.email = data.email
      user.roles = data.roles
    })
    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

//if refresh token is valid issue a new access token
const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const cookies = req.cookies
  if (!cookies.refreshToken) {
    console.log(`couldnt find refresh token in cookies`)
    return res.sendStatus(401)
  }
  const refreshToken = cookies.refreshToken
  //find user with that refresh token
  const user = await findUserWithRefreshToken(refreshToken)
  if (!user.email) {
    console.log(`couldnt find user with refresh token`)
    return res.sendStatus(403)
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    const payload = decoded as MyPayload
    if (err || payload.email !== user.email) {
      console.log(`refreshToken expired: ${err}`)
      return res.sendStatus(403)
    }
    const accessToken = jwt.sign(
      {
        email: user.email,
        roles: user.roles,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1d",
      }
    )
    return res.json({ user: user, accessToken })
  })
}
export { refreshToken }
