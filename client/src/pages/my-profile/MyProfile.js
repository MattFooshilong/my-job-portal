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
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
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

    const navigate = useNavigate()
    const db = getFirestore();

    // for img upload
    const [imgPreview, setImgPreview] = useState('')
    const [imgData, setImgData] = useState(undefined)
    const imgInputRef = useRef(null)
    const [avatar, setAvatar] = useState('')
    const handleImgPreview = () => {
        if (imgPreview === '') {
            return avatar
        } else return imgPreview
    }
    const onFileChange = (event) => {
        const fileType = event.target.accept
        const file = event.target.files[0]

        // if User actually selected a file
        if (file !== undefined) {
            if (fileType === 'image/*') {
                setImgPreview(URL.createObjectURL(file))
                setImgData(file)
            }
        }
    }

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


            });
        })
        return () => {
            unsub();
        }
    }, [])


    return (
        <Container>
            <Card className={styles.card}>

                <h1>
                    My profile settings
                </h1>


                <Row>

                    <Col >
                        <Card className={styles.card__col}>
                            <Card.Body>
                                {(imgPreview !== '' || (avatar !== null && avatar !== '')) ? (
                                    <Image
                                        roundedCircle
                                        src={handleImgPreview()}
                                        width='107'
                                        height='107'
                                        alt=''
                                        style={{ objectFit: 'cover' }}
                                    />
                                ) : <Image src='profile-placeholder.png' alt='default-avatar' style={{ objectFit: 'cover', width: '107px', height: '107px' }} />}
                                <input
                                    type='file'
                                    ref={imgInputRef}
                                    onChange={onFileChange}
                                    hidden
                                    accept='image/*'
                                />

                            </Card.Body>
                            <div className='d-flex'>
                                <h3>{inputs.name}</h3>
                                {age && <p className={styles.card__age}>{inputs.age}</p>}
                            </div>
                            {dob && <p>Date of birth: {inputs.dob}</p>}
                            <h3>Career</h3>
                            {jobTitle && <h6 className='mb-0'>{inputs.jobTitle}</h6>}
                            {company && <p className='text-muted'>{inputs.company}</p>}
                            {jobDescription &&
                                <div className='mb-3'>
                                    <h6 className='mb-0'>Job Description:</h6>
                                    <small >{inputs.jobDescription}</small>
                                </div>
                            }
                            {startDate && <p className='text-muted mb-0'>From: {inputs.startDate} </p>}
                            {endDate && <p className='text-muted'>To: {inputs.endDate}</p>}

                        </Card>

                    </Col>
                </Row>
                <Row>
                    <Col sm={4}>
                        {preferencesSaved && <Alert variant="success" className='mt-3'>Preferences saved!</Alert>}
                        <Button onClick={() => handleSubmit()} variant="primary" type="button" className={'mt-3 w-100 text-white'}>Save</Button>
                    </Col>
                </Row>


            </Card>

        </Container >

    )
}

export default PublicProfile