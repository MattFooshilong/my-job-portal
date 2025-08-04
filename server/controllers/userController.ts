import { firebaseApp } from "../firebaseServerInit/firebaseInit";
import { getDoc, getFirestore, doc, updateDoc, getDocs, query, collectionGroup, where, collection, addDoc, DocumentReference, DocumentData, DocumentSnapshot } from "firebase/firestore";
import dayjs from "dayjs";
import sanitize from "xss";
import { Request, Response } from "express";
import supabase from "./dbConfig";

type InfoOfAppliedJob = {
  jobDescription: string;
  companyName: string;
  isRecruiting: string;
  tasks: Record<string, string>;
  type: string;
  skills: Record<string, string>;
  jobTitle: string;
  industry: string;
  noOfEmployees: string;
  location: string;
  companyDescription: string;
  id: number;
};

const db = getFirestore(firebaseApp);

const getJobApplications = async (req: Request, res: Response): Promise<void> => {
  const userId = sanitize(req.params.id);
  try {
    const { data, error } = await supabase.rpc("get_user_applied_jobs", { p_id: userId });
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json({ appliedJobs: data ?? [] });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateProfileSettings = async (req: Request, res: Response) => {
  const values = req.body.values;
  Object.keys(values).forEach((key) => {
    values[key] = sanitize(values[key]);
  });
  const avatar = req.body.avatar;
  const companyLogoUrl = req.body.companyLogoUrl;
  const showEndDate = req.body.showEndDate;
  try {
    const userId = req.params.id;
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
      endDate: showEndDate ? dayjs(values.endDate).format("MM/DD/YYYY") : ""
    });
    res.json({ updated: true });
  } catch (error) {
    console.log("updateProfileSettings error: ", error);
    throw error;
  }
};

const updateUserPublicProfile = async (req: Request, res: Response) => {
  const switches = req.body;
  try {
    const userId = sanitize(req.params.id);
    await updateDoc(doc(db, "users", userId), {
      publicProfilePref: switches
    });
    res.json({ updated: true });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateUserApplyToJobs = async (req: Request, res: Response) => {
  const { job_id } = req.body;
  const { user_id } = req.body;
  try {
    const userId = sanitize(user_id);
    console.log(userId, "applying jobs", job_id);
    const { error } = await supabase.rpc("insert_user_jobs", { p_id: userId, p_job_id: job_id });
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json({ updated: true });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getJobApplicationsAndCompanyInfo = async (req: Request, res: Response) => {
  const status = req.body.status;
  const email = req.body.email;
  const getAppliedJobsPromises: Promise<DocumentSnapshot<DocumentData, DocumentData>>[] = [];

  try {
    //go to console, indexes - single field - add jobSeekers (subcollection) and email (field) - to execute collectionGroup query
    const q = query(collectionGroup(db, "jobSeekers"), where("email", "==", email), where("jobStatus", "==", status));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      //doc.data() - { email: 'user1@gmail.com', jobStatus: 'Successful' }
      const docRef = doc.ref;
      const jobSeekersCollectionRef = docRef.parent;
      //Example: jobs-0's reference
      const jobDocumentRef = jobSeekersCollectionRef.parent;
      if (jobDocumentRef) getAppliedJobsPromises.push(getDoc(jobDocumentRef));
    });
    // fetch jobs info
    const appliedJobsSnapshots = await Promise.all(getAppliedJobsPromises);
    const infoOfAppliedJobs = [] as InfoOfAppliedJob[];
    appliedJobsSnapshots.forEach((doc) => {
      const data = doc.data() as InfoOfAppliedJob;
      infoOfAppliedJobs.push(data);
    });
    res.json({ infoOfAppliedJobs });
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export { getJobApplications, updateProfileSettings, updateUserPublicProfile, updateUserApplyToJobs, getJobApplicationsAndCompanyInfo };
