import { useState } from "react";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import styles from "./JobApplications.module.scss";
import "react-datepicker/dist/react-datepicker.css";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";

type JobApplication = {
  id: number;
  job_title: string;
  company_name: string;
  location: string;
};

const JobApplications = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("InProgress");
  const axiosPrivate = useAxiosWithInterceptors();
  const logout = useLogout();

  //event handlers
  const fetchData = async (status: string) => {
    try {
      const dataObject = {
        user_id: auth.user.userId,
        status: status
      };
      const response = await axiosPrivate.post("/job-applications-and-company-info", dataObject); //protected route, will throw an error if refreshToken is expired
      return response?.data?.infoOfAppliedJobs;
    } catch (error) {
      console.log(error);
      try {
        await logout(); // Will throw if logout fails
      } catch (logoutError) {
        console.error("Error during logout:", logoutError);
        // Handle logout-specific errors here
      }
    }
  };
  // onload + cache
  const {
    isFetching,
    isError,
    data: jobApplications,
    error
  } = useQuery<JobApplication[]>({
    queryKey: ["getJobApplications", status],
    queryFn: () => fetchData(status),
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });

  if (isFetching) {
    return <Spinner animation="border" className="mt-5" />;
  }
  if (isError) {
    return <span>Error: {error?.message}</span>;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col className="pe-sm-0" sm={10}>
          <div className={styles.customCard}>
            <Form.Select aria-label="select status" onChange={(e) => setStatus(e.target.value)} value={status}>
              <option value="InProgress">In Progress</option>
              <option value="Successful">Successful</option>
              <option value="Unsuccessful">Unsuccessful</option>
            </Form.Select>
            {jobApplications?.length === 0 && (
              <Row className="pt-1">
                <Col>
                  <p className="text-center">No jobs here!</p>
                </Col>
              </Row>
            )}
            {jobApplications?.map((ele: JobApplication, i) => {
              return (
                <Row className={styles.rowClickable} key={i} onClick={() => navigate("/job/" + ele.id)} data-testid={`job-application-${i}`}>
                  <Col xs={4} sm={2}>
                    <Image src={`./images/company${ele.id}.jpg`} alt="company-logo" style={{ objectFit: "cover", width: "70px", height: "70px" }} />
                  </Col>
                  <Col>
                    <h6>{ele.job_title}</h6>
                    <p className="mb-0">{ele.company_name}</p>
                    <small className="d-block">{ele.location}</small>
                    <small className="d-block mb-2 mt-2">Applied 3 days ago</small>
                  </Col>
                </Row>
              );
            })}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default JobApplications;
