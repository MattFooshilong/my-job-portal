const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDocs, setDoc, getFirestore, query, collection, getCountFromServer, where, doc, updateDoc } = require("firebase/firestore")
const db = getFirestore(firebaseApp)

const getAllJobs = async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "jobs"))
    const jobsArr = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      jobsArr.push(data)
    })
    res.json(jobsArr)
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { getAllJobs }
