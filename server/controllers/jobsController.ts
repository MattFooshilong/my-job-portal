import { Request, Response } from "express";
import supabase from "./dbConfig";
import { PostgrestError } from "@supabase/supabase-js";

type Application = {
  user_jobs_id: number;
  user_jobs_created_at: string;
  user_name: string;
  company_name: string;
  job_title: string;
  status: string;
};

const getAllJobs = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.rpc("get_all_jobs_with_skills_tasks");
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getJobsWhereThereIsApplication = async (req: Request, res: Response) => {
  try {
    const { data, error } = (await supabase.rpc("get_job_applications_and_company_info_and_user_info")) as {
      data: Application[] | null;
      error: PostgrestError | null;
    };
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const updateJob = async (req: Request, res: Response) => {
  const user_jobs_id = req.params.user_jobs_id;
  const status = req.body.status;
  try {
    const { error } = await supabase.rpc("update_job_applications", { p_user_jobs_id: user_jobs_id, p_status: status });
    if (error) {
      res.sendStatus(400);
      console.log(error);
    } else {
      res.json({ statusUpdated: true });
    }
  } catch (error) {
    console.log(error);
    res.json({ statusUpdated: false });
    throw error;
  }
};

export { getAllJobs, getJobsWhereThereIsApplication, updateJob };
