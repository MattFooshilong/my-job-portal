import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import styles from './ProfileForms.module.scss'
import 'react-datepicker/dist/react-datepicker.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare, faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faWhatsapp, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import useAxiosWithInterceptors from '../../hooks/useAxiosWithInterceptors'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const PublicProfile = () => {
  const [inputs, setInputs] = useState({
    name: 'Matt Foo',
    age: '22',
    jobTitle: 'Designer',
    company: 'Designer Pte Ltd',
    jobDescription: 'Help to create mockups and design dashboard',
    startDate: '01/02/2022',
    endDate: '01/07/2022',
    email: '',
    whatsapp: '',
  })
  const { name, age, jobTitle, company, jobDescription, startDate, endDate, email, whatsapp } = inputs
  const { auth, setAuth } = useAuth()
  const axiosPrivate = useAxiosWithInterceptors()
  const navigate = useNavigate()
  const location = useLocation()

  // avatar
  const [avatar, setAvatar] = useState('')

  // on load
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axiosPrivate.get(`/user/${auth.user.docId}`)
        const data = response?.data
        setInputs({
          name: data.name,
          age: data.age,
          jobTitle: data.jobTitle,
          company: data.company,
          jobDescription: data.jobDescription,
          startDate: isNaN(new Date(data.startDate).valueOf()) ? new Date() : new Date(data.startDate),
          endDate: isNaN(new Date(data.endDate).valueOf()) ? new Date() : new Date(data.endDate),
          email: data?.email,
          whatsapp: data?.whatsapp,
        })
        setAvatar(data.avatar)
      } catch (err) {
        console.error(err)
        setAuth({})
        navigate('/login', { state: { from: location }, replace: true }) //send them back to where they were before they were kicked out
      }
    }

    getUser()
  }, [])

  return (
    <Container>
      <Row>
        <Col sm={8}>
          <Card className={styles.card}>
            <Card.Body>
              <Row className="d-flex justify-content-between">
                <Col xs={{ order: 2, span: 12 }} sm={{ order: 1, span: 6 }}>
                  {avatar ? <Image roundedCircle src={avatar} width="107" height="107" alt="" style={{ objectFit: 'cover' }} /> : <Image src="../images/profile-placeholder.png" alt="default-avatar" style={{ objectFit: 'cover', width: '107px', height: '107px' }} />}
                </Col>
                <Col xs={{ order: 1, span: 12 }} sm={{ order: 2, span: 6 }}>
                  <Link to="/profile-settings">
                    <FontAwesomeIcon icon={faPenToSquare} size="xl" className="float-end text-black" />
                  </Link>
                </Col>
              </Row>
            </Card.Body>
            <div className="d-flex mb-0">
              <h3>{name}</h3>
              {age && <p className={styles.card__age}>{inputs.age}</p>}
            </div>
            <p className="mb-0">Hi I&apos;m a full stack developer and I have built dashboards with React, Typescript, Bootstrap on the frontend and Nodejs, SQL, Graphql for the backend</p>
            <small>Singapore</small>

            <p className="mb-0 mt-2">
              <FontAwesomeIcon icon={faEnvelope} size="xl" className="me-2" />
              {email}
            </p>
            <p className="mb-0">
              <FontAwesomeIcon icon={faWhatsapp} size="xl" className="me-2" />
              +65 {whatsapp}
            </p>
            <a className="mb-3 text-black" href="https://www.linkedin.com/in/shilong-foo/">
              <FontAwesomeIcon icon={faLinkedin} size="xl" className="me-2" />
              https://www.linkedin.com/in/shilong-foo/
            </a>
            <h3>Career</h3>
            {jobTitle && <h6 className="mb-0">{jobTitle}</h6>}
            {company && (
              <p className="mb-0">
                {company}{' '}
                {startDate && (
                  <small className="mb-3 d-block">
                    {startDate} - {endDate ? endDate : 'Present'}
                  </small>
                )}
              </p>
            )}
            {jobDescription && (
              <div className="mb-3">
                <h6 className="mb-0">Job Description:</h6>
                <small>{jobDescription}</small>
              </div>
            )}
          </Card>
        </Col>

        <Col>
          <Card className="mt-2 mt-sm-5">
            <Card.Body>
              <Link to="/public-profile">Edit public settings</Link>
              <small className="d-block text-secondary">Edit how your profile looks like to the public and employers</small>
            </Card.Body>
          </Card>
          <Card className="mt-2">
            <Card.Body>
              <p>People you may know</p>
              {[
                { name: 'John Lee', jobTitle: 'Developer at Google' },
                { name: 'Susan Koh', jobTitle: 'Designer at Mavrick' },
                { name: 'Shakesphere Tan', jobTitle: 'Poet lecturer at Singapore Polytechnic' },
                { name: 'Hafiz', jobTitle: 'Engineer at NTU' },
                { name: 'Lambert Lahm', jobTitle: 'QA Engineer at PlatsOrg' },
              ].map((ele, i) => {
                return (
                  <Row className="d-flex justify-content-between mt-3" key={i}>
                    <Col xs={3}>
                      <Image src="../images/profile-placeholder.png" alt="default-avatar" style={{ objectFit: 'cover', width: '70px', height: '70px' }} />
                    </Col>
                    <Col>
                      <p className="mb-0">{ele.name}</p>
                      <small className="d-block text-secondary">{ele.jobTitle}</small>
                      <Button variant="outline-secondary" className="mt-1">
                        <FontAwesomeIcon icon={faPlus} size="xs" className="me-2" />
                        Add
                      </Button>
                    </Col>
                  </Row>
                )
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default PublicProfile
