import { useState, useRef, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import styles from './ProfileForms.module.scss'
import Alert from 'react-bootstrap/Alert'
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons'
import { useNavigate } from 'react-router-dom'
import { query, getDoc, setDoc, getFirestore, doc, onSnapshot, collection } from 'firebase/firestore';


const PublicProfile = () => {
    const [inputs, setInputs] = useState({
        name: 'Matt Foo',
        age: '22',
        dob: '01/01/1980',
        jobTitle: 'Designer',
        company: 'Designer Pte Ltd',
        companyLogo: '',
        jobDescription: 'Help to create mockups and design dashboard',
        startDate: '01/02/2022',
        endDate: '01/07/2022'
    })
    const { name, age, dob, jobTitle, company, companyLogo, jobDescription, startDate, endDate } = inputs
    const navigate = useNavigate()
    const db = getFirestore();

    // avatar
    const [avatar, setAvatar] = useState('')
    const handleImgPreview = () => {
        return avatar
    }

    // on load
    useEffect(() => {
        const q = query(collection(db, 'myJobPortal'));
        const unsub = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
            const source = snapshot.metadata.fromCache ? 'local cache' : 'server';
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data()
                    setInputs({
                        name: data.name,
                        age: data.age,
                        dob: data.dob,
                        jobTitle: data.jobTitle,
                        company: data.company,
                        companyLogo: data.companyLogo,
                        jobDescription: data.jobDescription,
                        startDate: data.startDate,
                        endDate: data.endDate
                    })
                    setAvatar(data.avatar)
                }
            })
        })
        return () => {
            unsub();
        }
    }, [])


    return (
        <Container>
            <Row>
                <Col >
                    <Card className={styles.card}>
                        <Card.Body>
                            <Row className='d-flex justify-content-between'>
                                <Col xs={{ order: 2, span: 12 }} sm={{ order: 1, span: 6 }}>
                                    {avatar ?
                                        <Image
                                            roundedCircle
                                            src={handleImgPreview()}
                                            width='107'
                                            height='107'
                                            alt=''
                                            style={{ objectFit: 'cover' }}
                                        />
                                        : <Image src='profile-placeholder.png' alt='default-avatar' style={{ objectFit: 'cover', width: '107px', height: '107px' }} />}
                                </Col>
                                <Col xs={{ order: 1, span: 12 }} sm={{ order: 2, span: 6 }}>
                                    <FontAwesomeIcon icon={faPenToSquare} size='xl' className='float-end' />
                                </Col>
                            </Row>



                        </Card.Body>
                        <div className='d-flex'>
                            <h3>{name}</h3>
                            {age && <p className={styles.card__age}>{inputs.age}</p>}
                        </div>
                        {dob && <p>Date of birth: {dob}</p>}
                        <h3>Career</h3>
                        {jobTitle && <h6 className='mb-0'>{jobTitle}</h6>}
                        {company && <p className='text-muted'>{company}</p>}
                        {jobDescription &&
                            <div className='mb-3'>
                                <h6 className='mb-0'>Job Description:</h6>
                                <small >{jobDescription}</small>
                            </div>
                        }
                        {startDate && <p className='text-muted mb-0'>From: {startDate} </p>}
                        {endDate && <p className='text-muted'>To: {endDate}</p>}

                    </Card>

                </Col>
            </Row>

        </Container >

    )
}

export default PublicProfile