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
      user.email = data.email
      user.roles = data.roles
    })
    return user
  } catch (error) {
    console.log(error)
    throw error
  }
}

const refreshToken = async (req, res) => {
  const cookies = req.cookies
  if (!cookies.jwt) return res.sendStatus(401)
  const refreshToken = cookies.jwt
  //find user with that refresh token
  const user = await findUserWithRefreshToken(refreshToken)
  if (!user.email) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || decoded.email !== user.email) return res.sendStatus(403)
    const accessToken = jwt.sign(
      {
        email: user.email,
        roles: user.roles,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "10s",
      }
    )
    res.json({ user: user, accessToken })
  })
}
module.exports = { refreshToken }
