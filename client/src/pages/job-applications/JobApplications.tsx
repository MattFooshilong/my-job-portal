import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import useAxiosWithInterceptors from '../../hooks/useAxiosWithInterceptors'
import styles from './JobApplications.module.scss'
import 'react-datepicker/dist/react-datepicker.css'
import Spinner from 'react-bootstrap/Spinner'
import { useNavigate } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import useAuth from '../../hooks/useAuth'
import useLogout from '../../hooks/useLogout'

type JobApplication = {
  jobDescription: string
  companyName: string
  isRecruiting: string
  tasks: Record<string, string>
  type: string
  skills: Record<string, string>
  jobTitle: string
  industry: string
  noOfEmployees: string
  location: string
  companyDescription: string
  id: number
}

const JobApplications = () => {
  const navigate = useNavigate()
  const { auth } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('InProgress')
  const axiosPrivate = useAxiosWithInterceptors()
  const logout = useLogout()

  //event handlers
  // on load

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const dataObject = {
          email: auth.user.email,
          status: status
        }
        const response = await axiosPrivate.post('/user-job-applications', dataObject) //protected route, will throw an error if refreshToken is expired
        setJobs(response.data?.infoOfAppliedJobs)
        setLoading(false)
      } catch (error) {
        console.log(error)
        setLoading(false)
        try {
          await logout() // Will throw if logout fails
        } catch (logoutError) {
          console.error('Error during logout:', logoutError)
          // Handle logout-specific errors here
        }
      }
    }
    fetchData()
  }, [status])

  return (
    <Container>
      {loading ? (
        <Spinner animation="border" className="mt-5" />
      ) : (
        <>
          <div>
            <Row className="justify-content-center">
              <Col className="pe-sm-0" sm={10}>
                <div className={styles.customCard}>
                  <Form.Select aria-label="select status" onChange={(e) => setStatus(e.target.value)} value={status}>
                    <option value="InProgress">In Progress</option>
                    <option value="Successful">Successful</option>
                    <option value="Unsuccessful">Unsuccessful</option>
                  </Form.Select>
                  {jobs.length === 0 && (
                    <Row className="pt-1">
                      <Col>
                        <p className="text-center">No jobs here!</p>
                      </Col>
                    </Row>
                  )}
                  {jobs.map((ele: JobApplication, i) => {
                    return (
                      <Row className={styles.rowClickable} key={i} onClick={() => navigate('/job/' + ele.id)} data-testid={`job-application-${i}`}>
                        <Col xs={4} sm={2}>
                          <Image src={`./images/company${ele.id}.jpg`} alt="company-logo" style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
                        </Col>
                        <Col>
                          <h6>{ele.jobTitle}</h6>
                          <p className="mb-0">{ele.companyName}</p>
                          <small className="d-block">{ele.location}</small>
                          <small className="d-block mb-2 mt-2">Applied 3 days ago</small>
                        </Col>
                      </Row>
                    )
                  })}
                </div>
              </Col>
            </Row>
          </div>
        </>
      )}
    </Container>
  )
}

export default JobApplications
