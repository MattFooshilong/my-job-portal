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

const ProfileSettings = () => {
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
        console.log(inputs.startDate)
    }
    function formatDate(date) {
        return new Date(date).toLocaleDateString()
    }
    const validationSchema = Yup.object().shape({
        name: Yup.string().required('required')
            .matches(/^[a-zA-Z_ ]*$/, 'Please remove any numbers or special characters and try again'),
        age: Yup.number().required('required').typeError('Age must be a number')
            .positive('age must be greater than zero'),
        dob: Yup.date().nullable().required('required'),
        jobTitle: Yup.string().required('required')
            .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, 'Please remove any special characters and try again'),
        company: Yup.string().required('required')
            .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, 'Please remove any special characters and try again'),
        jobDescription: Yup.string().required('required')
            .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, 'Please remove any special characters and try again'),
        startDate: Yup.date().nullable().required('required'),
        endDate: Yup.date().nullable().required('required')
            .min(Yup.ref('startDate'), ({ min }) => `Date needs to be before ${formatDate(min)}`)
    })



    return (
        <Container>
            <Card className={styles.card}>
                <Formik
                    enableReinitialize
                    initialValues={inputs}
                    validationSchema={validationSchema}
                    onSubmit={values => {
                        handleSubmit(values)
                    }}>
                    {({ values, handleChange, errors, touched }) => (
                        <FormikForm>

                            <Row>
                                <Col sm={3}>

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
                                        <div >
                                            <Col sm={12}>
                                                <Row>
                                                    <Col>
                                                        <Button
                                                            variant='primary'
                                                            className='text-white w-100'
                                                            onClick={() => {
                                                                if (imgInputRef !== null && imgInputRef.current !== null) imgInputRef.current.click()
                                                            }}
                                                        >Upload
                                                        </Button>&nbsp;&nbsp;&nbsp;&nbsp;
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            variant='secondary'
                                                            className='text-white w-100'
                                                            onClick={() => {
                                                                setImgPreview('')
                                                                setImgData(undefined)
                                                                setAvatar('')
                                                            }}
                                                        >Remove</Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </div>
                                    </div>
                                </Col>

                            </Row>
                            {[
                                { value: 'name', label: 'Name' },
                                { value: 'age', label: 'Age' },
                                { value: 'dob', label: 'Date of birth' },

                                { value: 'jobTitle', label: 'Job Title' },
                                { value: 'company', label: 'Company' },
                                { value: 'jobDescription', label: 'Job Description' },
                            ].map((obj, i) => {
                                return (
                                    (obj.value === 'dob') ?

                                        (<Row key={i}>
                                            <Col className="mb-3">
                                                <label className="form-label">{obj.label}</label>
                                                <DatePickerField name="dob" />
                                                {errors.dob && touched.dob && <div className='err-message'>{errors.dob}</div>}
                                            </Col>
                                        </Row>)
                                        :
                                        (<Row key={i}>
                                            <Col>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>{obj.label}</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder={`Enter ${obj.label}`}
                                                        name={obj.value}
                                                        value={values[obj.value]}
                                                        onChange={handleChange}
                                                    />
                                                    {errors[obj.value] && touched[obj.value] && <div className='err-message'>{errors[obj.value]}</div>}
                                                </Form.Group>
                                            </Col>
                                        </Row>)

                                )
                            })}
                            <Row >
                                <Col className="mb-3">
                                    <Form.Group controlId="formFileSm">
                                        <Form.Label>Company Logo</Form.Label>
                                        <Form.Control type="file" size="sm" accept="image/png, image/jpeg" />

                                    </Form.Group>
                                </Col>

                            </Row>
                            <Row >
                                <Col className="mb-3" sm={3}>
                                    <label className="form-label">Start Date</label>
                                    <DatePickerField name="startDate" />
                                    {errors.startDate && touched.startDate && <div className='err-message'>{errors.startDate}</div>}
                                </Col>

                            </Row>
                            <Row >
                                <Col className="mb-3" sm={3}>
                                    <label className="form-label">End Date</label>
                                    <DatePickerField name="endDate" />
                                    {errors.endDate && touched.endDate && <div className='err-message'>{errors.endDate}</div>}
                                </Col>

                            </Row>
                            <Row>
                                <Col className='d-flex justify-content-end' sm={3}>
                                    <Button variant="primary" type="submit" className={'mt-3 w-100 text-white '}>Submit</Button>
                                </Col>
                            </Row>

                        </FormikForm>)}
                </Formik>
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
export default ProfileSettings