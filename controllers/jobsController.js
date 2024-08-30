const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDocs, getDoc, getFirestore, collection, doc } = require("firebase/firestore")
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

const getOneJob = async (req, res) => {
  const jobId = req.params.jobId
  try {
    const docRef = doc(db, "jobs", `jobs-${jobId}`)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const job = docSnap.data()
      res.json(job)
    } else {
      const job = {}
      res.json(job)
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

module.exports = { getAllJobs, getOneJob }
