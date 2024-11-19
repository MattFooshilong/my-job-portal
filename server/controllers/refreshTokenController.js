const jwt = require("jsonwebtoken")
const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDocs, getFirestore, collection, where, query } = require("firebase/firestore")
const db = getFirestore(firebaseApp)

const findUserWithRefreshToken = async (refreshToken) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("refreshToken", "==", refreshToken))
    const snapshot = await getDocs(q)
    const user = {}
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
const refreshToken = async (req, res) => {
  const cookies = req.cookies
  if (!cookies.refreshToken) return res.sendStatus(401)
  const refreshToken = cookies.refreshToken
  //find user with that refresh token
  const user = await findUserWithRefreshToken(refreshToken)
  if (!user.email) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || decoded.email !== user.email) {
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
        expiresIn: "10m",
      }
    )
    res.json({ user: user, accessToken })
  })
}
module.exports = { refreshToken }
