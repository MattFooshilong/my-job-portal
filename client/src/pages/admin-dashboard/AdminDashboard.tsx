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
import { useQuery, useQueryClient } from "@tanstack/react-query";

type JobStatus = "Successful" | "Unsuccessful" | "InProgress";

type Application = {
  user_jobs_id: number;
  user_jobs_created_at: string;
  user_name: string;
  company_name: string;
  job_title: string;
  status: JobStatus;
};

const AdminDashboard = () => {
  const [updatingJob, setUpdatingJob] = useState(false);
  const [filteredData, setFilteredData] = useState<Application[]>([]);
  const [filteredStatus, setFilteredStatus] = useState("");
  const [selectedId, setSelectedId] = useState(0);
  const logout = useLogout();
  const axiosPrivate = useAxiosWithInterceptors();
  const queryClient = useQueryClient();

  const updateJobStatus = async (application: Application, status: string, selectedId: number) => {
    setSelectedId(selectedId);
    setUpdatingJob(true);
    const dataObject = {
      status
    };
    try {
      const response = await axiosPrivate.post(`/update-job/${application.user_jobs_id}`, dataObject);
      const statusUpdated = response?.data?.statusUpdated; //do smth later perhaps?
      setUpdatingJob(false);
      queryClient.invalidateQueries({ queryKey: ["getJobApplications"] });
      queryClient.invalidateQueries({ queryKey: ["getJobsApplicationsDashboard"] });
    } catch (error) {
      setUpdatingJob(false);
      console.log(error);
    }
  };

  const filterStatus = (status: string) => {
    if (status === "") {
      setFilteredData(applications ?? []);
      setFilteredStatus("");
    } else {
      const filtered = applications?.filter((ele: Application) => ele.status === status);
      setFilteredData(filtered ?? []);
      setFilteredStatus(status);
    }
  };
  // search by applicant name, company name or job title
  const filterBySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toLowerCase();
    const filtered = applications?.filter((ele: Application) => ele.user_name.toLowerCase().includes(text) || ele.company_name.toLowerCase().includes(text) || ele.job_title.toLowerCase().includes(text));
    setFilteredData(filtered ?? []);
  };
  const getJobsApplicationsDashboard = async () => {
    try {
      const res = await axiosPrivate.get("/get-jobs-where-there-is-application");
      return res.data;
    } catch (err) {
      console.error(err);
      try {
        await logout();
      } catch (err) {
        console.error(err);
      }
    }
  };
  const {
    isPending,
    isError,
    data: applications,
    error
  } = useQuery<Application[]>({
    queryKey: ["getJobsApplicationsDashboard"],
    queryFn: getJobsApplicationsDashboard,
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });

  useEffect(() => {
    if (applications) {
      setFilteredData(applications); // none filtered at first
    }
  }, [applications]);

  if (isPending) {
    return <Spinner animation="border" className="mt-5" />;
  }

  if (isError) {
    return <span>Error: {error?.message}</span>;
  }
  return (
    <Container>
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
                <div className={styles.statusCount}>{applications?.filter((ele: Application) => ele.status === "InProgress").length}</div>
              </Col>
              <Col className="pe-0">
                <p className={styles.status}>Successful</p>
                <div className={styles.statusCount}>{applications?.filter((ele: Application) => ele.status === "Successful").length}</div>
              </Col>
              <Col className="pe-0">
                <p className={styles.status}>Unsuccessful</p>
                <div className={styles.statusCountFontSizeOnly}>{applications?.filter((ele: Application) => ele.status === "Unsuccessful").length}</div>
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
              <Form.Control placeholder="Search Name / Company name / Job title" aria-label="search" aria-describedby="basic-addon1" onChange={(e: React.ChangeEvent<HTMLInputElement>) => filterBySearch(e)} />
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
          {filteredData
            ?.sort((a, b) => a.user_jobs_id - b.user_jobs_id)
            .map((ele: Application, i) => {
              return (
                <tr key={i}>
                  <td>{dayjs(ele?.user_jobs_created_at).format("DD/MM/YYYY")}</td>
                  <td>{ele?.user_name}</td>
                  <td>{ele?.company_name}</td>
                  <td>{ele?.job_title}</td>
                  <td>{updatingJob && ele.user_jobs_id === selectedId ? <Spinner animation="border" size="sm" /> : <StatusBadge status={ele.status} />}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="success" id="dropdown-basic" size="sm">
                        Select
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => updateJobStatus(ele, "Successful", ele.user_jobs_id)}>Successful</Dropdown.Item>
                        <Dropdown.Item onClick={() => updateJobStatus(ele, "Unsuccessful", ele.user_jobs_id)}>Unsuccessful</Dropdown.Item>
                        <Dropdown.Item onClick={() => updateJobStatus(ele, "InProgress", ele.user_jobs_id)}>InProgress</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </Container>
  );
};

const StatusBadge = ({ status }: { status: JobStatus }) => {
  return status === "InProgress" ? <Badge bg="secondary">In Progress</Badge> : status === "Successful" ? <Badge bg="success">Successful</Badge> : <Badge bg="danger">Unsuccessful</Badge>;
};

export default AdminDashboard;
