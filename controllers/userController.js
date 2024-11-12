const { firebaseApp } = require("../firebaseServerInit/firebaseInit")
const { getDoc, getFirestore, doc, updateDoc, getDocs, query, collectionGroup, where, collection, addDoc } = require("firebase/firestore")
const db = getFirestore(firebaseApp)
const dayjs = require("dayjs")
const sanitize = require("xss")

const getUser = async (req, res) => {
  try {
    const userId = sanitize(req.params.id)
    const docSnap = await getDoc(doc(db, "users", userId))
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

const updateProfileSettings = async (req, res) => {
  const values = req.body.values
  Object.keys(values).forEach((key) => {
    values[key] = sanitize(values[key])
  })
  const avatar = req.body.avatar
  const companyLogoUrl = req.body.companyLogoUrl
  const showEndDate = req.body.showEndDate
  try {
    const userId = req.params.id
    await updateDoc(doc(db, "users", userId), {
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
    })
    res.json({ updated: true })
  } catch (error) {
    console.log(error)
    throw error
  }
}

const updateUserPublicProfile = async (req, res) => {
  const switches = req.body
  try {
    const userId = sanitize(req.params.id)
    await updateDoc(doc(db, "users", userId), {
      publicProfilePref: switches,
    })
    res.json({ updated: true })
  } catch (error) {
    console.log(error)
    throw error
  }
}

const updateUserApplyToJobs = async (req, res) => {
  const { appliedJobs } = req.body
  const { email } = req.body
  try {
    const userId = sanitize(req.params.id)
    await updateDoc(doc(db, "users", userId), {
      appliedJobs: appliedJobs,
    })
    //create subcollection jobSeekers and document {email: user email, jobStatus: InProgress}
    const jobId = appliedJobs[appliedJobs.length - 1]
    const jobsRef = collection(db, "jobs")
    await addDoc(collection(jobsRef, `jobs-${jobId}`, "jobSeekers"), {
      email: email,
      jobStatus: "InProgress",
    })
    res.json({ updated: true })
  } catch (error) {
    console.log(error)
    throw error
  }
}

const userJobApplications = async (req, res) => {
  const status = req.body.status
  const email = req.body.email
  const parentsPromises = []

  try {
    //go to console, indexes - single field - add jobSeekers (subcollection) and email (field) - to execute collectionGroup query
    const q = query(collectionGroup(db, "jobSeekers"), where("email", "==", email), where("jobStatus", "==", status))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      const docRef = doc.ref
      //find jobs collection documents
      const parentCollectionRef = docRef.parent
      const immediateParentDocumentRef = parentCollectionRef.parent
      parentsPromises.push(getDoc(immediateParentDocumentRef))
    })

    // fetch jobs info
    const arrayOfParentsDocumentSnapshots = await Promise.all(parentsPromises)
    const jobDocuments = []
    arrayOfParentsDocumentSnapshots.forEach((doc) => {
      const data = doc.data()
      jobDocuments.push(data)
    })
    res.json({ jobDocuments })
  } catch (error) {
    console.log(error)
    throw error
  }
}
module.exports = { getUser, updateProfileSettings, updateUserPublicProfile, updateUserApplyToJobs, userJobApplications }
