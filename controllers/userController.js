const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDoc, getFirestore, doc } = require("firebase/firestore")
const db = getFirestore(firebaseApp)

const getUser = async (req, res) => {
  try {
    const docId = req.params.id
    const docSnap = await getDoc(doc(db, "users", docId))
    if (docSnap.exists()) {
      const data = docSnap.data()
      delete data.password
      res.json(data)
    } else {
      // docSnap.data() will be undefined in this case
      return res.sendStatus(400)
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { getUser }
