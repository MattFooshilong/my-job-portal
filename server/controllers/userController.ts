import dayjs from "dayjs";
import sanitize from "xss";
import { Request, Response } from "express";
import supabase from "./dbConfig";
import { PostgrestError } from "@supabase/supabase-js";

const getJobApplications = async (req: Request, res: Response): Promise<void> => {
  const userId = sanitize(req.body.user_id);
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
    const { data: profileData, error } = await supabase.rpc("get_my_profile", { p_id: userId });
    if (error) {
      res.sendStatus(400);
      console.log(error);
      return;
    }
    //retrieve profile and company logo pic
    const avatarPath: string = profileData[0]?.avatar_path;
    const companyLogoPath: string = profileData[0]?.company_logo_path;
    let signed_avatar_url;
    let signed_company_logo_url;
    if (avatarPath) {
      const { data, error: imageDlError } = await supabase.storage.from("images-bucket").createSignedUrl(`${avatarPath}`, 3600);
      signed_avatar_url = data?.signedUrl;
      if (imageDlError) {
        res.sendStatus(400);
        console.log(error);
        return;
      }
    }
    if (companyLogoPath) {
      const { data, error: imageDlError } = await supabase.storage.from("images-bucket").createSignedUrl(`${companyLogoPath}`, 3600);
      signed_company_logo_url = data?.signedUrl;
      if (imageDlError) {
        res.sendStatus(400);
        console.log(error);
        return;
      }
    }
    const returnObj = {
      ...profileData[0],
      signed_avatar_url: signed_avatar_url ?? "",
      signed_company_logo_url: signed_company_logo_url ?? ""
    };
    res.json(returnObj);
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
  //sanitize
  const values = JSON.parse(req.body.values);
  Object.keys(values).forEach((key) => {
    values[key] = sanitize(values[key]);
  });
  //formatting
  const showEndDate = req.body.showEndDate;
  values.start_date = dayjs(values.start_date).format("MM/DD/YYYY");
  values.end_date = showEndDate ? dayjs(values.end_date).format("MM/DD/YYYY") : "";
  delete values.csrfToken;
  delete values.signed_avatar_url;
  const userId = req.body.user_id;
  //image upload
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const avatarFileObj = files["avatar_file"]?.[0];
  const companyLogoFileObj = files["company_logo_file"]?.[0];
  let avatarPath = "";
  if (avatarFileObj) {
    avatarPath = `${userId}/${avatarFileObj.originalname}`;
    values.avatar_path = avatarPath;
  }
  let companyLogoPath = "";
  if (companyLogoFileObj) {
    companyLogoPath = `${userId}/${companyLogoFileObj.originalname}`;
    values.company_logo_path = companyLogoPath;
  }
  const fileArr = [
    { obj: avatarFileObj, path: avatarPath },
    { obj: companyLogoFileObj, path: companyLogoPath }
  ];

  try {
    /**
     * 1. Upload image to bucket
     * 2. store file path to db
     */
    for (const file of fileArr) {
      if (file.obj) {
        const { error } = await supabase.storage.from("images-bucket").upload(`${file.path}`, file.obj.buffer, {
          contentType: file.obj.mimetype,
          upsert: true
        });
        if (error) {
          console.error("Supabase upload error:", error);
          res.status(500).send("Failed to upload to Supabase");
          return;
        }
      }
    }

    const { error } = await supabase.rpc("update_profile_settings", { p_id: userId, p_values: values });
    if (error) {
      console.log(error);
      res.sendStatus(400);
      return;
    }
    res.json({ updated: true });
  } catch (error) {
    console.log("updateProfileSettings error: ", error);
    throw error;
  }
};

const updateUserPublicProfile = async (req: Request, res: Response) => {
  const switches = req.body.switches;
  const userId = sanitize(req.body.user_id);
  try {
    const { error } = await supabase.rpc("update_public_profile_pref", { p_id: userId, prefs: switches });
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
