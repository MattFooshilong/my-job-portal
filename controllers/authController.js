const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDocs, setDoc, getFirestore, query, collection, getCountFromServer, where, doc, updateDoc } = require("firebase/firestore")
const jwt = require("jsonwebtoken")
const db = getFirestore(firebaseApp)
const bcrypt = require("bcrypt")

let documentsCount = 0
const maxAgeInSeconds = 3 * 24 * 60 * 60 //3 days

//get initial data from db
const initialAuthControllerFunction = async () => {
  const userCollection = collection(db, "users")
  const result = await getCountFromServer(userCollection)
  documentsCount = result.data().count
}
initialAuthControllerFunction()

//functions
const getUserCredentials = async (email) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const snapshot = await getDocs(q)
    const credentials = {}
    snapshot.forEach((doc) => {
      const data = doc.data()
      credentials.docId = doc?.id
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
    await setDoc(doc(db, "users", `user${documentsCount}`), {
      email: email,
      password: hashedPassword,
      roles: [2], //manually add admin for now
    })
    documentsCount++
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
      expiresIn: "10s",
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
      expiresIn: "15s",
    }
  )
}
const saveRefreshTokenToDb = async (email, token) => {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("email", "==", email))
    const snapshot = await getDocs(q)
    let docID = ""
    snapshot.forEach((doc) => {
      docID = doc.id
    })
    await updateDoc(doc(db, "users", docID), { refreshToken: token })
  } catch (error) {
    console.log(error)
    throw error
  }
}
const handleErrors = (err) => {
  console.log(err.message, err.code)
  let errors = { email: "", password: "" }

  // to do - duplicate email error
  if (err.code === 11000) {
    errors.email = "that email is already registered"
    return errors
  }

  return errors
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
  res.cookie("jwt", refreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 1 * 60 * 60 * 1000 })
  delete userCredentials.password
  res.status(201).json({ user: userCredentials, accessToken })
}

const signUp = async (req, res) => {
  try {
    const email = req.body.email
    const userCredentials = await getUserCredentials(email)
    //check duplicate email
    if (userCredentials.email) {
      res.status(403).send({ message: "Email is already in use" })
      return
    }
    let password = req.body.password
    const saltRounds = 10
    const salt = await bcrypt.genSalt(saltRounds)
    password = await bcrypt.hash(password, salt)
    await addUser(email, password)
    //log in and give refresh and access token
    const accessToken = createAccessToken(email, [2])
    const refreshToken = createRefreshToken(email)
    await saveRefreshTokenToDb(email, refreshToken)
    res.cookie("jwt", refreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 1 * 60 * 60 * 1000 })
    delete userCredentials.password
    res.status(201).json({ user: userCredentials, accessToken })
  } catch (error) {
    res.status(500).send({ error })
  }
}
const logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 })
  res.redirect("/")
}
module.exports = { login, signUp, logout }
