import { firebaseApp } from "../firebaseServerInit/firebaseInit";
import { getDoc, getFirestore, doc, updateDoc, getDocs, query, collectionGroup, where, collection, addDoc, DocumentReference, DocumentData, DocumentSnapshot } from "firebase/firestore";
import dayjs from "dayjs";
import sanitize from "xss";
import { Request, Response } from "express";
import supabase from "./dbConfig";
import { PostgrestError } from "@supabase/supabase-js";

const db = getFirestore(firebaseApp);

const getJobApplications = async (req: Request, res: Response): Promise<void> => {
  const userId = sanitize(req.params.user_id);
  try {
    const { data, error } = (await supabase.rpc("get_user_applied_jobs", { p_id: userId })) as {
      data: number[] | null;
      error: PostgrestError | null;
    };
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
const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = sanitize(req.body.user_id);
  try {
    const { data, error } = await supabase.rpc("get_my_profile", { p_id: userId });
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json(data[0]);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = sanitize(req.body.user_id);
  try {
    const { data, error } = await supabase.rpc("get_public_profile_pref", { p_id: userId });
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json(data[0]);
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
  const userId = sanitize(req.body.user_id);
  try {
    const { data, error } = await supabase.rpc("get_job_applications_and_company_info", { p_id: userId, p_status: status });
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json({ infoOfAppliedJobs: data });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export { getJobApplications, updateProfileSettings, updateUserPublicProfile, updateUserApplyToJobs, getJobApplicationsAndCompanyInfo, getMyProfile, getPublicProfile };
