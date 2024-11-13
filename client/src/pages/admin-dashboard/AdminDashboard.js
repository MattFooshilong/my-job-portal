import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import styles from './AdminDashboard.module.scss'
import Table from 'react-bootstrap/Table'
import dayjs from 'dayjs'
import Dropdown from 'react-bootstrap/Dropdown'
import Spinner from 'react-bootstrap/Spinner'
import Badge from 'react-bootstrap/Badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faUser, fa, faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faBriefcase, faList } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect } from 'react'
import useAxiosWithInterceptors from '../../hooks/useAxiosWithInterceptors'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminDashboard = () => {
  const today = dayjs().format('DD-MM-YYYY')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatingJob, setUpdatingJob] = useState(false)

  const axiosPrivate = useAxiosWithInterceptors()
  const navigate = useNavigate()
  const location = useLocation()

  const updateJobStatus = async (details, approveOrReject) => {
    setUpdatingJob(true)
    const dataObject = {
      email: details.email,
      approveOrReject,
    }
    try {
      const response = await axiosPrivate.post(`/update-job/${details.jobId}`, dataObject)
      const statusUpdated = response?.data?.statusUpdated
      setUpdatingJob(false)
    } catch (error) {
      setUpdatingJob(false)
      console.log(error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axiosPrivate.get('/get-jobs-where-there-is-application') //protected route, will throw an error if refreshToken is expired
        setApplications(response.data)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
        //if refresh token is expired, send them back to login screen. After logging in, send them back to where they were
        navigate('/login', { state: { from: location }, replace: true })
      }
    }
    fetchData()
  }, [updatingJob])
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
          <Row>
            <Col lg={6}>
              <div className={styles.custom__card}>
                <Row className="mb-4">
                  <Col>
                    <h4>Applications</h4>
                  </Col>
                </Row>
                <Row>
                  <Col className="pe-0">
                    <p className={styles.status}>Pending</p>
                    <div className={styles.statusCount}>{applications.filter((ele) => ele.jobStatus === 'InProgress').length}</div>
                  </Col>
                  <Col className="pe-0">
                    <p className={styles.status}>Approved</p>
                    <div className={styles.statusCount}>{applications.filter((ele) => ele.jobStatus === 'Successful').length}</div>
                  </Col>
                  <Col className="pe-0">
                    <p className={styles.status}>Rejected</p>
                    <div className={styles.statusCountFontSizeOnly}>{applications.filter((ele) => ele.jobStatus === 'Unsuccessful').length}</div>
                  </Col>
                </Row>
              </div>
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
              {applications.map((ele, i) => {
                return (
                  <tr key={i}>
                    <td>{today}</td>
                    <td>{ele?.applicantName}</td>
                    <td>{ele?.companyName}</td>
                    <td>{ele?.jobTitle}</td>
                    <td>{ele.jobStatus === 'InProgress' ? <Badge bg="secondary">In Progress</Badge> : ele.jobStatus === 'Successful' ? <Badge bg="success">Successful</Badge> : <Badge bg="danger">Unsuccessful</Badge>}</td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant="success" id="dropdown-basic" size="sm">
                          Select
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => updateJobStatus(ele, 'Successful')}>{updatingJob ? <Spinner animation="border" className="mt-5" /> : 'Approve'}</Dropdown.Item>
                          <Dropdown.Item onClick={() => updateJobStatus(ele, 'Unsuccessful')}>{updatingJob ? <Spinner animation="border" className="mt-5" /> : 'Reject'}</Dropdown.Item>
                          <Dropdown.Item onClick={() => updateJobStatus(ele, 'InProgress')}>{updatingJob ? <Spinner animation="border" className="mt-5" /> : 'Pending'}</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  )
}

export default AdminDashboard
