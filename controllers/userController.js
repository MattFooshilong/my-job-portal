const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDoc, getFirestore, doc, updateDoc } = require("firebase/firestore")
const db = getFirestore(firebaseApp)
const dayjs = require("dayjs")

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

const updateUser = async (req, res) => {
  const values = req.body.values
  const avatar = req.body.avatar
  const companyLogoUrl = req.body.companyLogoUrl
  const showEndDate = req.body.showEndDate
  try {
    const docId = req.params.id
    updateDoc(doc(db, "users", docId), {
      avatar: avatar,
      name: values.name,
      age: values.age,
      dob: dayjs(values.dob).format("MM/DD/YYYY"),
      jobTitle: values.jobTitle,
      company: values.company,
      companyLogo: companyLogoUrl,
      jobDescription: values.jobDescription,
      startDate: dayjs(values.startDate).format("MM/DD/YYYY"),
      endDate: showEndDate ? dayjs(values.endDate).format("MM/DD/YYYY") : "",
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
    })
    res.json({ updated: true })
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { getUser, updateUser }
