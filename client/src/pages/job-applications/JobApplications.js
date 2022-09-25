import { useState, useRef, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import styles from './JobApplications.module.scss'
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { faCheck, faBriefcase, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import Spinner from 'react-bootstrap/Spinner'
import { getFirestore, collection, doc, query, getDocs, updateDoc, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import Form from 'react-bootstrap/Form'

const Jobs = () => {
    const db = getFirestore()
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [job, setJob] = useState({})
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('InProgress')
    //event handlers


    // on load
    useEffect(() => {
        async function fetchData() {
            setLoading(true)


            const q = query(collection(db, 'jobs'), where('status', '==', status))

            const querySnapshot = await getDocs(q)
            const arr = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                data.id = doc.id.slice(-1)
                arr.push(data)
            })
            setJobs(arr)
            setJob(arr[0])
            setLoading(false)

        }
        fetchData()
    }, [status])


    return (
        <Container>
            {console.log(status)}
            {/* <Button onClick={() => addJob()}>Add job</Button> */}
            {loading ? <Spinner animation="border" className='mt-5' />
                :
                <>
                    <div>
                        <Row className='justify-content-center'>
                            <Col className='pe-sm-0' sm={10}>
                                <div className={styles.custom__card}>

                                    <Form.Select aria-label="select status" onChange={(e) => setStatus(e.target.value)} value={status}>
                                        <option value="InProgress">In Progress</option>
                                        <option value="Successful">Successful</option>
                                        <option value="Unsuccessful">Unsuccessful</option>
                                    </Form.Select>
                                    {jobs.map((ele, i) => {
                                        return (
                                            <Row className={styles.row_clickable} key={i} onClick={() => navigate('/job/' + ele.id)}>
                                                <Col xs={4} sm={2}>
                                                    <Image src={`./images/company${ele.id}.jpg`} alt='company-logo' style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
                                                </Col>
                                                <Col>
                                                    <h6>{ele.jobTitle}</h6>
                                                    <p className='mb-0'>{ele.companyName}</p>
                                                    <small className='d-block'>{ele.location}</small>
                                                    <small className='d-block mb-2 mt-2'>Applied 3 days ago</small>
                                                </Col>
                                            </Row>
                                        )
                                    })}
                                </div>
                            </Col>

                        </Row>
                    </div>
                </>
            }
        </Container >

    )
}

export default Jobs