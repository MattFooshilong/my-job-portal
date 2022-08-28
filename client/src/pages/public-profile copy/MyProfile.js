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
    const handleSubmit = () => {
        const publicPrefences = JSON.stringify(switches)
        localStorage.setItem('publicPrefences', publicPrefences)
        setPreferencesSaved(true)
    }
    useEffect(() => {
        const publicPrefences = JSON.parse(localStorage.getItem('publicPrefences'))
        if (publicPrefences !== null) setSwitches(publicPrefences)
    }, [])


    return (
        <Container>
            <Card className={styles.card}>
                <Row>
                    <Col sm={3}>
                        <Button variant="link" className='text-black ps-0' onClick={() => navigate(-1)}><FontAwesomeIcon icon={faArrowLeft} size='lg' className='me-2' />back</Button>
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