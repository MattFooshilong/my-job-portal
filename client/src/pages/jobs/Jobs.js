import { useState, useRef, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import styles from './Jobs.module.scss'
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faCheck, faBriefcase, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import Spinner from 'react-bootstrap/Spinner'
import PropTypes from 'prop-types'
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import axios from '../../config/axiosConfig'

const Jobs = () => {
  const db = getFirestore()
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [job, setJob] = useState({})
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [applyingJob, setApplyingJob] = useState(false)

  //event handlers
  const applyJob = async (jobID) => {
    setApplyingJob(true)
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      setApplyingJob(false)
    } else {
      const jobRef = doc(db, 'jobs', `jobs-${jobID}`)
      await updateDoc(jobRef, { applied: true, status: 'InProgress' })
      setShowToast(true)
      setApplyingJob(false)
    }
  }

  const addJob = async () => {
    //for testing
    await setDoc(doc(db, 'jobs', 'jobs-5'), {
      jobTitle: 'Senior frontend developer',
      companyName: 'Fiverr',
      location: 'Australia (remote)',
      isRecruiting: 'Actively recruiting',
      type: 'Full-time',
      noOfEmployees: '10000-50000',
      jobDescription: 'You will join our team and you’ll be responsible for co-creating interactive computer vision and other various application on the web. We highly value innovation – and you will think along with us about our current business processes and implementations.',
      skills: {
        1: 'You have a bachelor’s or master’s degree in IT or science – or you have a similar degree',
        2: 'You have a significant amount of knowledge of both front and back-end developments (React, Bootstrap, Typescript, JavaScript, Node.js, SQL, NoSQL, Docker)',
        3: 'You have knowledge of Database implementations such as SQL or NoSQL',
      },
      tasks: {
        1: 'You will develop and implement various micro-services needed to visualize solar panel layouts with associated data such as wind, snow load, ballast, wiring scheme’s, etc',
        2: 'You will improve both performance and features of existing micro-services',
        3: 'You are responsible for the correct implementation of the design and also code yourself',
      },
      companyDescription: 'This company develops advanced WEB and CAD applications for solar energy systems, such as our renowned plugin for AutoCAD / BricsCAD (BIM).',
      industry: 'Finance',
    })
  }

  //  useEffect(() => {
  //    let isMounted = true
  //    const controller = new AbortController()

  //    const getJobs = async () => {
  //      try {
  //        const response = await axios.get('/api/jobs', {
  //          signal: controller.signal,
  //        })
  //        if (isMounted) {
  //          setJobs(response?.data)
  //          setJob(response?.data[0])
  //        }
  //      } catch (err) {
  //        console.error(err)
  //      }
  //    }

  //    getJobs()

  //    return () => {
  //      isMounted = false
  //      controller.abort()
  //    }
  //  }, [])
  useEffect(() => {
    const getJobs = async () => {
      try {
        const response = await axios.get('/api/jobs')
        setJobs(response?.data)
        setJob(response?.data[0])
      } catch (err) {
        console.error(err)
      }
    }

    getJobs()
  }, [])
  return (
    <Container>
      {/* <Button onClick={() => addJob()}>Add job</Button> */}
      {loading ? (
        <Spinner animation="border" className="mt-5" />
      ) : (
        <>
          {/* Desktop */}
          <div className="d-none d-sm-block">
            <Row>
              <Col className="pe-sm-0">
                <div className={styles.custom__card}>
                  {jobs.length === 0 && <h6>Jobs not loaded!</h6>}
                  {jobs.map((ele, i) => {
                    return (
                      <Row className={styles.row_clickable} key={i} onClick={() => setJob(ele)}>
                        <Col xs={4} sm={3}>
                          <Image src={`./images/company${ele.id}.jpg`} alt="company-logo" style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
                        </Col>
                        <Col>
                          <h6>{ele.jobTitle}</h6>
                          <p className="mb-0">{ele.companyName}</p>
                          <small className="d-block">{ele.location}</small>
                          <small className="d-block mb-2">
                            {' '}
                            <FontAwesomeIcon icon={faCheck} className="me-1" color="green" />
                            {ele.isRecruiting}
                          </small>
                        </Col>
                      </Row>
                    )
                  })}
                </div>
              </Col>
              <Col sm={8}>
                <EachJob job={job} applyJob={applyJob} applyingJob={applyingJob} />
              </Col>
            </Row>
          </div>
          {/* mobile */}
          <div className="d-block d-sm-none">
            <Row>
              <Col className="pe-sm-0">
                <div className={styles.custom__card}>
                  {jobs.length === 0 && <h6>Jobs not loaded!</h6>}

                  {jobs.map((ele, i) => {
                    return (
                      <Row className={styles.row_clickable} key={i} onClick={() => navigate('/job/' + ele.id)}>
                        <Col xs={4} sm={3}>
                          <Image src={`/images/company${i}.jpg`} alt="company-logo" style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
                        </Col>
                        <Col>
                          <h6>{ele.jobTitle}</h6>
                          <p className="mb-0">{ele.companyName}</p>
                          <small className="d-block">{ele.location}</small>
                          <small className="d-block mb-2">
                            {' '}
                            <FontAwesomeIcon icon={faCheck} className="me-1" color="green" />
                            {ele.isRecruiting}
                          </small>
                        </Col>
                      </Row>
                    )
                  })}
                </div>
              </Col>
            </Row>
          </div>
          <ToastContainer className="p-3" position="top-end">
            <Toast
              show={showToast}
              onClose={() => {
                setShowToast(!showToast)
                window.location.reload()
              }}
              delay={5000}
              autohide
            >
              <Toast.Header>
                <strong className="me-auto text-success">Success!</strong>
                <small>Just now</small>
              </Toast.Header>
              <Toast.Body>You&apos;ve successfully applied for the job! Refreshing page</Toast.Body>
            </Toast>
          </ToastContainer>
        </>
      )}
    </Container>
  )
}

const EachJob = ({ job, applyJob, applyingJob }) => {
  const token = localStorage.getItem('token')
  return (
    <>
      {Object.keys(job).length !== 0 && (
        <div className={styles.custom__card}>
          <h3 className="mt-3">{job?.jobTitle}</h3>
          <Row sm={4} className="gx-0">
            <Col sm={4}>
              {job?.companyName},&nbsp; {job?.location}
            </Col>
            <Col sm={2}>3 days ago</Col>
            <Col>Over 100 applicants</Col>
          </Row>
          <p className="mt-3">
            <FontAwesomeIcon icon={faBriefcase} size="xl" className="me-2" />
            {job?.type}
          </p>
          <p>
            <FontAwesomeIcon icon={faBuilding} size="xl" className="me-2" />
            {job?.noOfEmployees} employees
          </p>
          {/* check login or not then show application status */}
          {token ? (
            job.applied ? (
              <Button variant="secondary" className="text-white mb-3">
                Applied
              </Button>
            ) : (
              <div>
                <Button onClick={() => applyJob(job.id)} variant="primary" className="text-white mb-3">
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="lg" className="me-2" />
                  Apply
                </Button>
                {applyingJob ? <Spinner animation="border" className="ms-1" /> : ''}
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
                <Col xs={3} sm={1} className="me-4">
                  <Image src={`/images/company${job.id}.jpg`} alt="company-logo" style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
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
  )
}
EachJob.propTypes = {
  job: PropTypes.object,
  applyJob: PropTypes.func.isRequired,
  applyingJob: PropTypes.bool,
}
export default Jobs
