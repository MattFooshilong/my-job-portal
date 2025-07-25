import { useState } from "react";
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
import { faBriefcase, faArrowUpRightFromSquare, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Spinner from "react-bootstrap/Spinner";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import useAuth from "../../hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../config/axiosConfig";

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

const FullPageJob = () => {
  const param = useParams();
  const jobId = param.id !== undefined ? param.id : "";
  const navigate = useNavigate();
  const [applyingJob, setApplyingJob] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const axiosPrivate = useAxiosWithInterceptors();
  const { auth, setAuth } = useAuth();
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
      } catch (error) {
        console.log(error);
        setApplyingJob(false);
      }
    }
  };

  // on load
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

  //on load
  const {
    isPending,
    isError,
    data: job,
    error
  } = useQuery({
    queryKey: ["getJobs"],
    queryFn: () =>
      axios.get("/public/jobs").then((res) => {
        return res.data;
      }),
    select: (cachedJobs: JobType[]): JobType => {
      const oneJobArray = cachedJobs.filter((job: JobType) => job.id === parseInt(jobId));
      return oneJobArray[0];
    },
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

  if (isPending) {
    return <Spinner animation="border" className="mt-5" />;
  }

  if (isError || isGetUsersError) {
    return <span>Error: {error?.message || getUsersError?.message}</span>;
  }

  return (
    <Container className="p-3">
      {Object.keys(job).length !== 0 && (
        <Row className="justify-content-center">
          <Col sm={10} xs={12}>
            <div className={styles.custom__card}>
              <Row>
                <Col sm={3}>
                  <Button variant="link" className="text-black ps-0" onClick={() => navigate("/jobs")}>
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" className="me-2" />
                  </Button>
                </Col>
              </Row>
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
                    <Col xs={2} md={1} className="me-4">
                      <Image fetchPriority="high" src={`/images/company${job.id}.jpg`} alt="company-logo" style={{ objectFit: "cover", width: "70px", height: "70px" }} />
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
          </Col>
        </Row>
      )}
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
    </Container>
  );
};

export default FullPageJob;
