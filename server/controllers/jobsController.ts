import { firebaseApp } from "../firebaseServerInit/firebaseInit"
import { getDocs, getDoc, getFirestore, collection, doc, collectionGroup, query, where, updateDoc } from "firebase/firestore"
import sanitize from "xss"
import { Request, Response } from "express"

const db = getFirestore(firebaseApp)

const getAllJobs = async (req: Request, res: Response) => {
  try {
    const snapshot = await getDocs(collection(db, "jobs"))
    const jobsArr = []
    snapshot.forEach((doc) => {
      console.log(doc)
      const data = doc.data()
      jobsArr.push(data)
    })
    res.json(jobsArr)
  } catch (error) {
    console.log(error)
    throw error
  }
}

const getOneJob = async (req: Request, res: Response) => {
  const jobId = sanitize(req.params.jobId)

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

const getJobsWhereThereIsApplication = async (req: Request, res: Response) => {
  try {
    // get all job applications
    const q = query(collectionGroup(db, "jobSeekers"))
    const querySnapshot = await getDocs(q)
    const applications = []
    const result = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      data.docRef = doc.ref
      applications.push(data)
    })
    // fetch find company name and job title for each application
    await Promise.all(
      applications.map(async (application) => {
        const parentCollectionRef = application.docRef.parent
        const immediateParentDocumentRef = parentCollectionRef.parent
        const jobDocSnap = await getDoc(immediateParentDocumentRef)
        const obj = { ...application }
        if (jobDocSnap.exists()) {
          const data = jobDocSnap.data()
          obj.jobTitle = data.jobTitle
          obj.companyName = data.companyName
          obj.jobId = data.id
        }
        // get applicant info for each application
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("email", "==", obj.email))
        const userSnapshot = await getDocs(q)
        userSnapshot.forEach((doc) => {
          const data = doc.data()
          obj.applicantName = data.name
        })
        delete obj.docRef
        result.push(obj)
      })
    )
    res.json(result)
  } catch (error) {
    console.log(error)
    throw error
  }
}

const updateJob = async (req: Request, res: Response) => {
  // Get a reference to the subcollection
  const jobSeekersRef = collection(db, "jobs", `jobs-${req.params.jobId}`, "jobSeekers")
  const q = query(jobSeekersRef, where("email", "==", req.body.email))

  try {
    const querySnapshot = await getDocs(q)
    let jobApplicationId = ""
    querySnapshot.forEach((doc) => {
      jobApplicationId = doc.id
    })
    const jobApplicationRef = doc(db, "jobs", `jobs-${req.params.jobId}`, "jobSeekers", jobApplicationId)

    await updateDoc(jobApplicationRef, {
      jobStatus: req.body.approveOrReject,
    })
    res.json({ statusUpdated: true })
  } catch (error) {
    res.json({ statusUpdated: false })
    console.error("Error fetching subcollection documents: ", error)
  }
}

export { getAllJobs, getOneJob, getJobsWhereThereIsApplication, updateJob }
