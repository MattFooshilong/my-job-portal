const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDocs, setDoc, getFirestore, query, collection, getCountFromServer, where, doc, updateDoc } = require("firebase/firestore")
const jwt = require("jsonwebtoken")
const db = getFirestore(firebaseApp)
const bcrypt = require("bcrypt")

//const maxAgeInSeconds = 3 * 24 * 60 * 60 //3 days

const countUsers = async () => {
  const userCollection = collection(db, "users")
  const result = await getCountFromServer(userCollection)
  return result.data().count
}

//functions
const getUserCredentials = async (email) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const snapshot = await getDocs(q)
    const credentials = {}
    snapshot.forEach((doc) => {
      const data = doc.data()
      credentials.userId = doc?.id
      credentials.email = data?.email
      credentials.password = data?.password
      credentials.roles = data?.roles
    })
    return credentials
  } catch (error) {
    console.log(error)
    throw error
  }
}

const addUser = async (email, hashedPassword) => {
  try {
    let usersCount = await countUsers()
    await setDoc(doc(db, "users", `user${usersCount}`), {
      email: email,
      password: hashedPassword,
      roles: [2], //manually add admin for now
      publicProfilePref: {
        age: true,
        dob: true,
        jobTitle: true,
        company: true,
        companyLogo: true,
        jobDescription: true,
        startDate: true,
        endDate: true,
      },
      appliedJobs: [],
    })
    return {
      email,
      roles: [2],
      userId: `user${usersCount}`,
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

const createAccessToken = (email, roles) => {
  return jwt.sign(
    {
      roles: roles,
      email: email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1d",
    }
  )
}
const createRefreshToken = (email) => {
  return jwt.sign(
    {
      email: email,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "2d",
    }
  )
}
const saveRefreshTokenToDb = async (email, token) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const snapshot = await getDocs(q)
    let userId = ""
    snapshot.forEach((doc) => {
      userId = doc.id
    })
    await updateDoc(doc(db, "users", userId), { refreshToken: token })
  } catch (error) {
    console.log(error)
    throw error
  }
}

// authentication
const login = async (req, res) => {
  const { email, password } = req.body
  const userCredentials = await getUserCredentials(email)
  if (email !== userCredentials.email) {
    res.status(403).send({ message: "Wrong email" })
    return
  }
  const passwordMatched = await bcrypt.compare(password, userCredentials.password)
  if (!passwordMatched) {
    res.status(403).send({ message: "Wrong password" })
    return
  }
  const accessToken = createAccessToken(email, [2])
  const refreshToken = createRefreshToken(email)
  // saving refreshToken with current user
  await saveRefreshTokenToDb(email, refreshToken)
  // send refreshToken back in a cookie
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 1 * 60 * 60 * 1000 })
  delete userCredentials.password
  res.status(201).json({ user: userCredentials, accessToken })
}

const signUp = async (req, res) => {
  try {
    const email = req.body.email
    const userCredentials = await getUserCredentials(email)
    //check duplicate email
    if (userCredentials.email) {
      delete userCredentials.password
      return res.status(403).send({ message: "Email is already in use" })
    }
    let password = req.body.password
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    password = await bcrypt.hash(password, salt)
    const user = await addUser(email, password)
    //log in and give refresh and access token
    const accessToken = createAccessToken(email, [2])
    const refreshToken = createRefreshToken(email)
    await saveRefreshTokenToDb(email, refreshToken)
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 1 * 60 * 60 * 1000 })
    res.status(201).json({ user, accessToken })
  } catch (error) {
    res.status(500).send({ error })
  }
}
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
const logout = async (req, res) => {
  try {
    const cookies = req.cookies
    res.clearCookie("cookieCsrfToken", { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 1 * 60 * 60 * 1000 })
    if (!cookies.refreshToken) return res.sendStatus(204)
    const refreshToken = cookies.refreshToken
    //is refreshToken in db?
    const foundUser = await findUserWithRefreshToken(refreshToken)
    //if no user/empty object
    console.log("found user:", foundUser)
    if (Object.keys(foundUser).length === 0) {
      console.log("foundUser.length === 0:")

      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 1 * 60 * 60 * 1000 })
      res.sendStatus(204)
    } else {
      console.log("foundUser.length else block :")

      //delete refreshtoken in db
      await saveRefreshTokenToDb(foundUser.email, "")
      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict", maxAge: 1 * 60 * 60 * 1000 })
      res.sendStatus(204)
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { login, signUp, logout }
