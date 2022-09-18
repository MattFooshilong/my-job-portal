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
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import '../../firebase/firebaseInit'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { query, getDoc, setDoc, getFirestore, doc, onSnapshot, collection } from 'firebase/firestore'

const PublicProfile = () => {
    const [inputs, setInputs] = useState({
        name: '',
        age: '',
        dob: '',
        jobTitle: '',
        company: '',
        companyLogo: '',
        jobDescription: '',
        startDate: '',
        endDate: ''
    })
    const [switches, setSwitches] = useState({
        name: true,
        age: true,
        dob: true,
        jobTitle: true,
        company: true,
        companyLogo: true,
        jobDescription: true,
        startDate: true,
        endDate: true
    })
    const { age, dob, jobTitle, company, companyLogo, jobDescription, startDate, endDate } = switches
    const [preferencesSaved, setPreferencesSaved] = useState(false)
    const navigate = useNavigate()
    const db = getFirestore()

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
    const handleSubmit = async () => {

        setPreferencesSaved(true)
        await setDoc(doc(db, 'users', 'userPublicProfile'), {
            age: age,
            dob: dob,
            jobTitle: jobTitle,
            company: company,
            companyLogo: companyLogo,
            jobDescription: jobDescription,
            startDate: startDate,
            endDate: endDate
        })
            .then(() => {
                console.log('uploaded')
            }).catch(err => console.log('err', err))

    }
    useEffect(() => {
        const q = query(collection(db, 'users'))
        const unsub = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
            const source = snapshot.metadata.fromCache ? 'local cache' : 'server'
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data()
                    setSwitches({
                        age: data.age,
                        dob: data.dob,
                        jobTitle: data.jobTitle,
                        company: data.company,
                        companyLogo: data.companyLogo,
                        jobDescription: data.jobDescription,
                        startDate: data.startDate,
                        endDate: data.endDate
                    })
                }


            })
        })
        return () => {
            unsub()
        }
    }, [])
    useEffect(() => {
        const q = query(collection(db, 'myJobPortal'))
        const unsub = onSnapshot(q, { includeMetadataChanges: false }, (snapshot) => {
            const source = snapshot.metadata.fromCache ? 'local cache' : 'server'
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
            unsub()
        }
    }, [])

    return (
        <Container>
            <Card className={styles.card}>
                <Row>
                    <Col sm={3}>
                        <Button variant="link" className='text-black ps-0' onClick={() => navigate('/my-profile')}><FontAwesomeIcon icon={faArrowLeft} size='lg' className='me-2' />My profile</Button>
                    </Col>
                </Row>

                <h1>
                    Public profile settings
                </h1>
                <Row className='mb-2'>
                    <Col sm={5}>
                        <p>
                            You control your profile and limit what is shown to the public. Toggle your preferences on the left and your public profile is as on the right.
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col sm={5}>
                        <Row>
                            <Col className={styles.col__end}>
                                <h2>Edit visibility</h2>
                            </Col>
                        </Row>
                        {[
                            { value: 'age', label: 'Age' },
                            { value: 'dob', label: 'Date of birth' },
                            { value: 'jobTitle', label: 'Job Title' },
                            { value: 'company', label: 'Company' },
                            { value: 'jobDescription', label: 'Job Description' },
                            { value: 'companyLogo', label: 'Company Logo' },
                            { value: 'startDate', label: 'Start Date' },
                            { value: 'endDate', label: 'End Date' },

                        ].map((obj, i) => {
                            return (
                                <Row key={i} className='mt-3'>
                                    <Col sm={4}>
                                        <p>{obj.label}</p>
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Group>
                                            <Form.Check
                                                type="switch"
                                                id="custom-switch"
                                                className={styles.form__switch}
                                                checked={switches[obj.value]}
                                                onChange={() => {
                                                    setSwitches({ ...switches, [obj.value]: !switches[obj.value] })
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col className='mt-1 ps-0'>
                                        {switches[obj.value] && <span style={{ fontWeight: 'bold' }}>Public</span>}
                                    </Col>
                                </Row>

                            )
                        })}


                    </Col>

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
                                ) : <Image src='../images/profile-placeholder.png' alt='default-avatar' style={{ objectFit: 'cover', width: '107px', height: '107px' }} />}
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
                            {<Image
                                roundedCircle
                                src={inputs.companyLogo || ''}
                                width='100'
                                height='100'
                                alt=''
                                style={{ objectFit: 'cover' }}
                            />}
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