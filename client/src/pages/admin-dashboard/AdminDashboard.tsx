import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styles from "./AdminDashboard.module.scss";
import Table from "react-bootstrap/Table";
import dayjs from "dayjs";
import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Stack from "react-bootstrap/Stack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faUser, faBuilding } from "@fortawesome/free-regular-svg-icons";
import { faBriefcase, faClose, faList, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import useLogout from "../../hooks/useLogout";
import { useQueryClient } from "@tanstack/react-query";

type JobStatus = "Successful" | "Unsuccessful" | "InProgress";

type ApplicationData = {
  applicantName: string;
  companyName: string;
  email: string;
  jobId: number;
  jobStatus: JobStatus;
  jobTitle: string;
};

const AdminDashboard = () => {
  const today = dayjs().format("DD-MM-YYYY");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingJob, setUpdatingJob] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState("");
  const logout = useLogout();
  const axiosPrivate = useAxiosWithInterceptors();
  const queryClient = useQueryClient();

  const updateJobStatus = async (details: ApplicationData, approveOrReject: string) => {
    setUpdatingJob(true);
    const dataObject = {
      email: details.email,
      approveOrReject
    };
    try {
      const response = await axiosPrivate.post(`/update-job/${details.jobId}`, dataObject);
      const statusUpdated = response?.data?.statusUpdated; //do smth later perhaps?
      setUpdatingJob(false);
      queryClient.invalidateQueries({ queryKey: ["getJobApplications"] });
    } catch (error) {
      setUpdatingJob(false);
      console.log(error);
    }
  };

  const filterStatus = (status: string) => {
    if (status === "") {
      setFilteredData(applications);
      setFilteredStatus("");
    } else {
      const filtered = applications.filter((ele: ApplicationData) => ele.jobStatus === status);
      setFilteredData(filtered);
      setFilteredStatus(status);
    }
  };
  // search by applicant name, company name or job title
  const filterBySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toLowerCase();
    const filtered = applications.filter((ele: ApplicationData) => ele.applicantName.toLowerCase().includes(text) || ele.companyName.toLowerCase().includes(text) || ele.jobTitle.toLowerCase().includes(text));
    setFilteredData(filtered);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get("/get-jobs-where-there-is-application"); //protected route, will throw an error if refreshToken is expired
        setApplications(response.data);
        setFilteredData(response.data); // none filtered at first
        setLoading(false);
      } catch (error) {
        setLoading(false);
        try {
          await logout(); // Will throw if logout fails
        } catch (logoutError) {
          console.error("Error during logout:", logoutError);
          // Handle logout-specific errors here
        }
      }
    };
    fetchData();
  }, [updatingJob]);
  return (
    <Container>
      {loading ? (
        <Spinner animation="border" className="mt-5" />
      ) : (
        <>
          <Row className="mt-4">
            <Col>
              <h3>Job Applications</h3>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col lg={6}>
              <div className={styles.customCard}>
                <Row className="mb-4">
                  <Col>
                    <h4>Applications</h4>
                  </Col>
                </Row>
                <Row>
                  <Col className="pe-0">
                    <p className={styles.status}>In Progress</p>
                    <div className={styles.statusCount}>{applications.filter((ele: ApplicationData) => ele.jobStatus === "InProgress").length}</div>
                  </Col>
                  <Col className="pe-0">
                    <p className={styles.status}>Successful</p>
                    <div className={styles.statusCount}>{applications.filter((ele: ApplicationData) => ele.jobStatus === "Successful").length}</div>
                  </Col>
                  <Col className="pe-0">
                    <p className={styles.status}>Unsuccessful</p>
                    <div className={styles.statusCountFontSizeOnly}>{applications.filter((ele: ApplicationData) => ele.jobStatus === "Unsuccessful").length}</div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <Stack direction="horizontal" gap={3}>
                <InputGroup>
                  <InputGroup.Text id="searchText">
                    <FontAwesomeIcon icon={faSearch} className="me-1" />
                  </InputGroup.Text>
                  <Form.Control placeholder="Search name /company name/ job title" aria-label="search" aria-describedby="basic-addon1" onChange={(e: React.ChangeEvent<HTMLInputElement>) => filterBySearch(e)} />
                </InputGroup>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary" id="status-filter" size="sm" className={styles.statusFilter}>
                    Status
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => filterStatus("Successful")}>Successful</Dropdown.Item>
                    <Dropdown.Item onClick={() => filterStatus("Unsuccessful")}>Unsuccessful</Dropdown.Item>
                    <Dropdown.Item onClick={() => filterStatus("InProgress")}>In Progress</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                {filteredStatus !== "" && (
                  <Badge pill bg="secondary" onClick={() => filterStatus("")} style={{ cursor: "pointer" }}>
                    <FontAwesomeIcon icon={faClose} className="me-1" />
                    {filteredStatus}
                  </Badge>
                )}
              </Stack>
            </Col>
          </Row>

          <Table bordered responsive hover className={styles.table}>
            <thead>
              <tr>
                <th>
                  <FontAwesomeIcon icon={faCalendar} className="me-1" />
                  Date
                </th>
                <th>
                  <FontAwesomeIcon icon={faUser} className="me-1" />
                  Name
                </th>
                <th>
                  <FontAwesomeIcon icon={faBuilding} className="me-1" />
                  Company Name
                </th>
                <th>
                  <FontAwesomeIcon icon={faBriefcase} className="me-1" />
                  Job Title
                </th>
                <th>
                  <FontAwesomeIcon icon={faList} className="me-1" />
                  Application Status
                </th>
                <th>
                  <FontAwesomeIcon icon={faList} className="me-1" />
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((ele: ApplicationData, i) => {
                return (
                  <tr key={i}>
                    <td>{today}</td>
                    <td>{ele?.applicantName}</td>
                    <td>{ele?.companyName}</td>
                    <td>{ele?.jobTitle}</td>
                    <td>{ele.jobStatus === "InProgress" ? <Badge bg="secondary">In Progress</Badge> : ele.jobStatus === "Successful" ? <Badge bg="success">Successful</Badge> : <Badge bg="danger">Unsuccessful</Badge>}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" size="sm">
                          Select
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => updateJobStatus(ele, "Successful")}>{updatingJob ? <Spinner animation="border" className="mt-5" /> : "Successful"}</Dropdown.Item>
                          <Dropdown.Item onClick={() => updateJobStatus(ele, "Unsuccessful")}>{updatingJob ? <Spinner animation="border" className="mt-5" /> : "Unsuccessful"}</Dropdown.Item>
                          <Dropdown.Item onClick={() => updateJobStatus(ele, "InProgress")}>{updatingJob ? <Spinner animation="border" className="mt-5" /> : "InProgress"}</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
