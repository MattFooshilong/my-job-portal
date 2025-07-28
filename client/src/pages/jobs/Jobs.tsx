import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styles from "./Jobs.module.scss";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faBriefcase, faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import axios from "../../config/axiosConfig";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import useAuth from "../../hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import allJobs from "./initialData";

type JobType = {
  companyDescription: string;
  companyName: string;
  id: number;
  industry: string;
  isRecruiting: string;
  jobDescription: string;
  jobTitle: string;
  location: string;
  noOfEmployees: string;
  skills: Record<number, string>;
  tasks: Record<number, string>;
  type: string;
};
type User = {
  userId: string;
  email: string;
  roles: number[];
};
type authType = {
  user: User;
  roles: number[];
  accessToken: string;
};
type EachJobType = {
  auth: authType | Record<string, never>;
  job: JobType | Record<string, never>;
  applyJob: (id: number) => Promise<void>;
  applyingJob: boolean;
  appliedJobs: number[] | undefined;
};

const Jobs = () => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosWithInterceptors();
  const { auth, setAuth } = useAuth();
  const [job, setJob] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [applyingJob, setApplyingJob] = useState(false);
  const queryClient = useQueryClient();

  //event handlers
  const applyJob = async (jobId: number) => {
    setApplyingJob(true);
    if (!auth.user) {
      navigate("/login");
      setApplyingJob(false);
    } else if (appliedJobs) {
      //push id to appliedJobs array in db
      const appliedJobsCopy = [...appliedJobs];
      appliedJobsCopy.push(jobId);
      const dataObject = {
        appliedJobs: appliedJobsCopy,
        email: auth.user.email
      };
      try {
        const response = await axiosPrivate.post(`/apply-job/${auth.user.userId}`, dataObject);
        const updated = response?.data?.updated as boolean;
        setShowToast(updated);
        setApplyingJob(false);
        //refetch appliedJobs
        queryClient.invalidateQueries({ queryKey: ["getUserAppliedJobs"] });
        queryClient.invalidateQueries({ queryKey: ["getJobApplications"] });
      } catch (error) {
        console.log(error);
        setApplyingJob(false);
      }
    }
  };

  // check if user on mobile
  function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
      const media = window.matchMedia(query);
      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  }
  const isMobile = useMediaQuery("(max-width: 992px)");

  const getUserAppliedJobs = async () => {
    try {
      const response = await axiosPrivate.get(`/user/${auth.user.userId}`);
      return response?.data?.appliedJobs;
    } catch (err) {
      console.error(err);
      try {
        await axios("/public/logout", { withCredentials: true });
        //if refresh token is expired, send them back to login screen. After logging in, send them back to where they were
        setAuth({});
      } catch (err) {
        console.error(err);
      }
    }
  };

  // onload + cache
  const {
    isPending,
    isError,
    data: jobs,
    error
  } = useQuery<JobType[]>({
    queryKey: ["getJobs"],
    queryFn: () =>
      axios.get("/public/jobs").then((res) => {
        setJob(res.data[0]);
        return res.data;
      }),
    placeholderData: allJobs,
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });

  const {
    data: appliedJobs,
    isError: isGetUsersError,
    error: getUsersError
  } = useQuery<number[]>({
    queryKey: ["getUserAppliedJobs"],
    queryFn: getUserAppliedJobs,
    enabled: auth.hasOwnProperty("user"),
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });

  useEffect(() => {
    //set the first job during cache
    if (jobs) setJob(jobs[0]);
  }, [jobs]);

  if (isPending) {
    return <Spinner animation="border" className="mt-5" />;
  }

  if (isError || isGetUsersError) {
    return <span>Error: {error?.message || getUsersError?.message}</span>;
  }

  return (
    <Container>
      <>
        <div className={isMobile ? "d-lg-none" : "d-none d-lg-block"}>
          <Row>
            <Col className="pe-sm-0">
              <div className={styles.customCard}>
                {jobs.length === 0 ? (
                  <h6>Jobs not loaded!</h6>
                ) : (
                  jobs?.map((ele: JobType, i: number) => {
                    return (
                      <Row className={styles.rowClickable} key={i} onClick={() => (isMobile ? navigate("/job/" + ele.id) : setJob(ele))} data-testid={`job-${i}`}>
                        <Col xs={4} xl={3}>
                          <Image src={`./images/company${ele.id}.jpg`} alt="company-logo" style={{ objectFit: "cover", width: "70px", height: "70px" }} />
                        </Col>
                        <Col>
                          <h6>{ele.jobTitle}</h6>
                          <p className="mb-0">{ele.companyName}</p>
                          <small className="d-block">{ele.location}</small>
                          <small className="d-block mb-2">
                            {" "}
                            <FontAwesomeIcon icon={faCheck} className="me-1" color="green" />
                            {ele.isRecruiting}
                          </small>
                        </Col>
                      </Row>
                    );
                  })
                )}
              </div>
            </Col>
            {/* Desktop only */}
            {!isMobile && (
              <Col sm={8}>
                <EachJob auth={auth} job={job} applyJob={applyJob} applyingJob={applyingJob} appliedJobs={appliedJobs} />
              </Col>
            )}
          </Row>
        </div>

        <ToastContainer className="p-3" position="top-end">
          <Toast
            show={showToast}
            onClose={() => {
              setShowToast(!showToast);
            }}
            delay={5000}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto text-success">Success!</strong>
              <small>Just now</small>
            </Toast.Header>
            <Toast.Body>You&apos;ve successfully applied for the job!</Toast.Body>
          </Toast>
        </ToastContainer>
      </>
    </Container>
  );
};

const EachJob = ({ auth, job, applyJob, applyingJob, appliedJobs }: EachJobType) => {
  return (
    <>
      {Object.keys(job).length !== 0 && (
        <div className={styles.customCard}>
          <h3 className="mt-3">{job?.jobTitle}</h3>
          <Row className="gx-0">
            <p className="mb-0">
              {job?.companyName},&nbsp; {job?.location}
            </p>
            <p className="mb-0">3 days ago</p>
            <p className="mb-0">Over 100 applicants</p>
          </Row>
          <p className="mt-1 mb-1">
            <FontAwesomeIcon icon={faBriefcase} size="xl" className="me-2" />
            {job?.type}
          </p>
          <p>
            <FontAwesomeIcon icon={faBuilding} size="xl" className="me-2" />
            {job?.noOfEmployees} employees
          </p>
          {/* check login or not then show application status */}
          {auth.user ? (
            appliedJobs?.includes(job.id) ? (
              <Button variant="secondary" className="text-white mb-3" disabled>
                Applied
              </Button>
            ) : (
              <div>
                <Button onClick={() => applyJob(job.id)} variant="primary" className="text-white mb-3">
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="lg" className="me-2" />
                  Apply
                </Button>
                {applyingJob ? <Spinner animation="border" className="ms-1" /> : ""}
              </div>
            )
          ) : (
            <Button onClick={() => applyJob(job.id)} variant="primary" className="text-white mb-3">
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="lg" className="me-2" />
              Apply
            </Button>
          )}
          <h6>Job Description</h6>
          <p>{job?.jobDescription}</p>
          <h6>What skills and experience you will need</h6>
          <ul>
            <li>{job?.skills[1]}</li>
            <li>{job?.skills[2]}</li>
            <li>{job?.skills[3]}</li>
          </ul>
          <h6>Tasks</h6>
          <ul>
            <li>{job?.tasks[1]}</li>
            <li>{job?.tasks[2]}</li>
            <li>{job?.tasks[3]}</li>
          </ul>
          <Card className="mt-5 p-1 p-sm-1">
            <Card.Body>
              <h4>About the company</h4>
              <Row className="mt-3 mb-3">
                <Col xs={3} lg={2} xl={1} className="me-4">
                  <Image src={`/images/company${job.id}.jpg`} alt="company-logo" style={{ objectFit: "cover", width: "70px", height: "70px" }} />
                </Col>
                <Col>
                  <h5 className="pt-2">{job.companyName}</h5>
                  <p>3000 followers</p>
                </Col>
              </Row>
              <p>
                {job.industry}, &nbsp; {job.noOfEmployees} employees
              </p>
              <p>{job.companyDescription}</p>
            </Card.Body>
          </Card>
        </div>
      )}
    </>
  );
};

export default Jobs;
