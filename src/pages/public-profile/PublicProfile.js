import { useState, useRef } from 'react'
import { Formik, Form as FormikForm, useField, useFormikContext } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import styles from './ProfileForms.module.scss'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs'

const PublicProfile = () => {
    const [switches, setSwitches] = useState({
        name: false,
        age: false,
        dob: false,
        jobTitle: false,
        company: false,
        companyLogo: false,
        jobDescription: false,
        startDate: false,
        endDate: false
    })
    const { startDate } = switches
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
    const handleSubmit = (values) => {
        // event.preventDefault()
        console.log(startDate)
    }



    return (
        <Container>
            <Card className={styles.card}>
                <Row className='mb-5'>
                    <Col>
                        <h1>
                            Public profile settings
                        </h1>
                        <p>
                            You control your profile and limit what is shown to the public.
                        </p>
                    </Col>
                </Row>

                <Row>
                    <Col sm={4}>
                        <Row>
                            <Col className={styles.col__end}>
                                <h2>Edit visibility</h2>
                            </Col>
                        </Row>
                        {[
                            { value: 'name', label: 'Name' },
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
                                    <Col sm={1}>
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
                                    <Col className='m-auto ps-0'>
                                        {switches[obj.value] && <span style={{ fontWeight: 'bold' }}>Public</span>}
                                    </Col>
                                </Row>

                            )
                        })}


                    </Col>

                    <Col>

                        <div >
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

                        </div>
                    </Col>
                </Row>

                <Button variant="primary" type="submit" className={'mt-3 w-100 text-white'}>Submit</Button>

            </Card>

        </Container>

    )
}
const DatePickerField = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);
    return (
        <DatePicker
            dateFormat='dd/MM/yyyy'
            {...field}
            {...props}
            selected={(field.value && new Date(field.value)) || null}
            onChange={val => {
                setFieldValue(field.name, val);
            }}
            className='form-control'
            placeholderText='Select date'
        />
    );
};
export default PublicProfile