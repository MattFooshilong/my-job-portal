import { useState, useRef, useEffect } from 'react'
import { Formik, Form as FormikForm, useField, useFormikContext } from 'formik'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import styles from './ProfileForms.module.scss'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { firebaseApp } from '../../firebase/firebaseInit'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { query, getDoc, updateDoc, getFirestore, doc, onSnapshot, collection } from 'firebase/firestore'
import axios from '../../config/axiosConfig'

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
    endDate: null,
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const [showEndDate, setShowEndDate] = useState(() => {
    if (inputs.name === '') return true
    else return false
  })
  const navigate = useNavigate()
  const db = getFirestore(firebaseApp)

  // for image upload
  const [imgPreview, setImgPreview] = useState('')
  const [imgData, setImgData] = useState(undefined)
  const imgInputRef = useRef(null)
  const [avatar, setAvatar] = useState('')
  const [companyLogoUrl, setCompanyLogoUrl] = useState('')

  // event handlers
  const handleImgPreview = () => {
    if (imgPreview === '') {
      return avatar
    } else return imgPreview
  }
  const onFileChange = async (event) => {
    const fileType = event.target.accept
    const file = event.target.files[0]
    if (file !== undefined) {
      if (fileType === 'image/*') {
        setImgPreview(URL.createObjectURL(file))
        setImgData(file)
        //host img on firebase
        const storage = getStorage(firebaseApp)
        const spaceRef = ref(storage, `images/${dayjs().format('DD-MM-YYYY,hh:mm:ssA') + file.name}`)
        await uploadBytesResumable(spaceRef, file).then(() => {})
        await getDownloadURL(spaceRef)
          .then((url) => {
            setAvatar(url)
          })
          .catch((error) => {
            switch (error.code) {
              case 'storage/object-not-found':
                // File doesn't exist
                break
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break
              case 'storage/canceled':
                // User canceled the upload
                break
              // ...
              case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break
            }
          })
      }
    }
  }
  const onCompanyLogoUpload = async (event) => {
    const fileType = event.target.accept
    const file = event.target.files[0]

    if (file !== undefined) {
      if (fileType === 'image/*') {
        //host img on firebase
        const storage = getStorage()
        const spaceRef = ref(storage, `images/${dayjs().format('DD-MM-YYYY,hh:mm:ssA') + file.name}`)
        await uploadBytesResumable(spaceRef, file).then(() => {})
        await getDownloadURL(spaceRef)
          .then((url) => {
            setCompanyLogoUrl(url)
          })
          .catch((error) => {
            switch (error.code) {
              case 'storage/object-not-found':
                // File doesn't exist
                break
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break
              case 'storage/canceled':
                // User canceled the upload
                break
              // ...
              case 'storage/unknown':
                // Unknown error occurred, inspect the server response
                break
            }
          })
      }
    }
  }
  const handleSubmit = (values) => {
    updateDoc(doc(db, 'users', 'user1'), {
      email: 'admin@gmail.com',
      avatar: avatar,
      name: values.name,
      age: values.age,
      dob: dayjs(values.dob).format('MM/DD/YYYY'),
      jobTitle: values.jobTitle,
      company: values.company,
      companyLogo: companyLogoUrl,
      jobDescription: values.jobDescription,
      startDate: dayjs(values.startDate).format('MM/DD/YYYY'),
      endDate: showEndDate ? dayjs(values.endDate).format('MM/DD/YYYY') : null,
      publicProfilePref: {
        age: true,
        dob: true,
        jobTitle: true,
        company: true,
        companyLogo: true,
        jobDescription: true,
        startDate: true,
        endDate: true,
      },
    })
      .then(() => {
        setProfileSaved(true)
      })
      .catch((err) => console.log('err', err))
  }

  // validation
  function formatDate(date) {
    return new Date(date).toLocaleDateString()
  }
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('required')
      .matches(/^[a-zA-Z_ ]*$/, 'Please remove any numbers or special characters and try again'),
    age: Yup.number().required('required').typeError('Age must be a number').positive('age must be greater than zero'),
    dob: Yup.date().nullable().required('required'),
    jobTitle: Yup.string()
      .required('required')
      .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, 'Please remove any special characters and try again'),
    company: Yup.string()
      .required('required')
      .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, 'Please remove any special characters and try again'),
    jobDescription: Yup.string()
      .required('required')
      .matches(/^[a-zA-Z0-9~!@^&,*()_'"/_ ]*$/, 'Please remove any special characters and try again'),
    startDate: Yup.date().nullable().required('required'),
    endDate: Yup.date()
      .nullable()
      .min(Yup.ref('startDate'), ({ min }) => `Date needs to be before ${formatDate(min)}`),
  })

  // date picker
  const DatePickerField = ({ ...props }) => {
    const { setFieldValue } = useFormikContext()
    const [field] = useField(props)
    return (
      <DatePicker
        dateFormat="dd-MM-yyyy"
        {...field}
        {...props}
        selected={(field.value && new Date(field.value)) || null}
        onChange={(val) => {
          setFieldValue(field.name, val)
        }}
        className="form-control"
        placeholderText="Select date"
      />
    )
  }

  // on load
  useEffect(() => {
    const q = query(collection(db, 'users'))
    const unsub = onSnapshot(q, { includeMetadataChanges: true }, (snapshot) => {
      const source = snapshot.metadata.fromCache ? 'local cache' : 'server'
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data()
          setInputs({
            name: data.name,
            age: data.age,
            dob: isNaN(new Date(data.dob).valueOf()) ? new Date() : new Date(data.dob),
            jobTitle: data.jobTitle,
            company: data.company,
            companyLogo: data.companyLogo,
            jobDescription: data.jobDescription,
            startDate: isNaN(new Date(data.startDate).valueOf()) ? new Date() : new Date(data.startDate),
            endDate: isNaN(new Date(data.endDate).valueOf()) ? new Date() : new Date(data.endDate),
          })
          setAvatar(data.avatar)
        }
      })
    })
    return () => {
      unsub()
    }
  }, [])
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get('/api/user')
        const data = response?.data
        setInputs({
          name: data.name,
          age: data.age,
          dob: isNaN(new Date(data.dob).valueOf()) ? new Date() : new Date(data.dob),
          jobTitle: data.jobTitle,
          company: data.company,
          companyLogo: data.companyLogo,
          jobDescription: data.jobDescription,
          startDate: isNaN(new Date(data.startDate).valueOf()) ? new Date() : new Date(data.startDate),
          endDate: isNaN(new Date(data.endDate).valueOf()) ? new Date() : new Date(data.endDate),
        })
        setAvatar(data.avatar)
      } catch (err) {
        console.error(err)
      }
    }

    getUser()
  }, [])
  return (
    <Container>
      <Card className="mt-5 p-3 p-sm-5">
        <Row>
          <Col sm={3}>
            <Button variant="link" className="text-black ps-0" onClick={() => navigate('/my-profile')}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" className="me-2" />
              My profile
            </Button>
          </Col>
        </Row>
        <h1 className="my-3">My profile settings</h1>
        <Formik
          enableReinitialize
          initialValues={inputs}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handleSubmit(values)
          }}
        >
          {({ values, handleChange, errors, touched }) => (
            <FormikForm>
              <Row>
                <Col sm={6}>
                  <div>
                    {imgPreview !== '' || (avatar !== null && avatar !== '') ? (
                      <Image roundedCircle src={handleImgPreview()} width="107" height="107" alt="" style={{ objectFit: 'cover' }} />
                    ) : (
                      <Image
                        src="../images/profile-placeholder.png"
                        alt="default-avatar"
                        style={{
                          objectFit: 'cover',
                          width: '107px',
                          height: '107px',
                        }}
                      />
                    )}
                    <input type="file" ref={imgInputRef} onChange={onFileChange} hidden accept="image/*" />
                    <div className="mt-3">
                      <Col sm={12}>
                        <Row>
                          <Col>
                            <Button
                              variant="primary"
                              className="text-white w-100"
                              onClick={() => {
                                if (imgInputRef !== null && imgInputRef.current !== null) imgInputRef.current.click()
                              }}
                            >
                              Upload
                            </Button>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                          </Col>
                          <Col>
                            <Button
                              variant="secondary"
                              className="text-white w-100"
                              onClick={() => {
                                setImgPreview('')
                                setImgData(undefined)
                                setAvatar('')
                              }}
                            >
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control type="text" placeholder={'Enter Name'} name="name" value={values.name} onChange={handleChange} />
                    {errors.name && touched.name && <div className="err-message">{errors.name}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="mb-3">
                  <label className="form-label">Date of birth</label>
                  <DatePickerField name="dob" />
                  {errors.dob && touched.dob && <div className="err-message">{errors.dob}</div>}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control type="text" placeholder={'Enter Age'} name="age" value={values.age} onChange={handleChange} />
                    {errors.age && touched.age && <div className="err-message">{errors.age}</div>}
                  </Form.Group>
                </Col>
              </Row>
              {[
                { value: 'jobTitle', label: 'Job Title' },
                { value: 'company', label: 'Company' },
                { value: 'jobDescription', label: 'Job Description' },
              ].map((obj, i) => {
                return (
                  <Row key={i}>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>{obj.label}</Form.Label>
                        <Form.Control type="text" placeholder={`Enter ${obj.label}`} name={obj.value} value={values[obj.value]} onChange={handleChange} />
                        {errors[obj.value] && touched[obj.value] && <div className="err-message">{errors[obj.value]}</div>}
                      </Form.Group>
                    </Col>
                  </Row>
                )
              })}
              <Row>
                <Col className="mb-3">
                  <Form.Group controlId="formFileSm">
                    <Form.Label>Company Logo</Form.Label>
                    <Form.Control type="file" size="sm" accept="image/*" onChange={onCompanyLogoUpload} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="mb-3" sm={3}>
                  <label className="form-label">Start Date</label>
                  <DatePickerField name="startDate" />
                  {errors.startDate && touched.startDate && <div className="err-message">{errors.startDate}</div>}
                </Col>
              </Row>
              <div>
                <Form.Check
                  type="checkbox"
                  id="Currently employed"
                  label="I am currently working in this role"
                  className="mb-3"
                  checked={!showEndDate}
                  onChange={() => {
                    setShowEndDate(!showEndDate)
                    setInputs({ ...inputs, endDate: '' })
                  }}
                />
              </div>
              {showEndDate && (
                <Row>
                  <Col className="mb-3" sm={3}>
                    <label className="form-label">End Date</label>
                    <DatePickerField name="endDate" />
                    {errors.endDate && touched.endDate && <div className="err-message">{errors.endDate}</div>}
                  </Col>
                </Row>
              )}
              <Row>
                <Col sm={3}>
                  {profileSaved && (
                    <Alert variant="success" className="mt-3">
                      Profile saved!
                    </Alert>
                  )}
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-end" sm={3}>
                  <Button variant="primary" type="submit" className={'mt-3 w-100 text-white '}>
                    Submit
                  </Button>
                </Col>
              </Row>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  )
}

export default ProfileSettings
