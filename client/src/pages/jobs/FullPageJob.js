import { useState, useRef, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import styles from './Jobs.module.scss'
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faCheck, faBriefcase, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import Spinner from 'react-bootstrap/Spinner'; import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom'
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';


const FullPageJob = () => {
    const db = getFirestore();
    const param = useParams()
    const jobID = param.id !== undefined ? param.id : ''
    const [loading, setLoading] = useState(false)
    const [job, setJob] = useState({})

    // on load
    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            const docRef = doc(db, 'jobs', `jobs-${jobID}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data()
                data.id = jobID
                setJob(data)
            } else {
                // doc.data() will be undefined in this case
                console.log('No such document!');
            }
            setLoading(false)

        }
        fetchData()
    }, [])
    return (
        <>
            {console.log(job)}
            {loading ? <Spinner animation="border" className='mt-5' /> :
                Object.keys(job).length !== 0 && <div className={styles.custom__card}>
                    <h3 className='mt-3'>{job?.jobTitle}</h3>
                    <Row sm={4} className='gx-0'>
                        <Col sm={4}>{job?.companyName},&nbsp; {job?.location}</Col>
                        <Col sm={2}>3 days ago</Col>
                        <Col>Over 100 applicants</Col>
                    </Row>
                    <p className='mt-3'>
                        <FontAwesomeIcon icon={faBriefcase} size='xl' className='me-2' />{job?.type}
                    </p>
                    <p>
                        <FontAwesomeIcon icon={faBuilding} size='xl' className='me-2' />{job?.noOfEmployees} employees
                    </p>
                    <Button variant="primary" className='text-white mb-3'>
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} size='lg' className='me-2' />Apply
                    </Button>
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
                    <Card className='mt-5 p-1 p-sm-1'>
                        <Card.Body>
                            <h4>About the company</h4>
                            <Row className='mt-3 mb-3'>
                                <Col xs={3} sm={1} className='me-4'>
                                    <Image src={`company${job.id}.jpg`} alt='company-logo' style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
                                </Col>
                                <Col>
                                    <h5 className='pt-2'>{job.companyName}</h5>
                                    <p>3000 followers</p>
                                </Col>
                            </Row>
                            <p>{job.industry}, &nbsp; {job.noOfEmployees} employees</p>
                            <p>{job.companyDescription}</p>
                        </Card.Body>
                    </Card>
                </div >
            }
        </>

    )
}
FullPageJob.propTypes = {
    job: PropTypes.object.isRequired
}
export default FullPageJob