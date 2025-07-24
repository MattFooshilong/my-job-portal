import { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import styles from './ProfileForms.module.scss';
import Alert from 'react-bootstrap/Alert';
import 'react-datepicker/dist/react-datepicker.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useAxiosWithInterceptors from '../../hooks/useAxiosWithInterceptors';
import useAuth from '../../hooks/useAuth';
import dayjs from 'dayjs';
import useLogout from '../../hooks/useLogout';
type AllowedKeys = 'age' | 'dob' | 'jobTitle' | 'company' | 'jobDescription' | 'companyLogo' | 'startDate' | 'endDate';
type Headers = {
  value: AllowedKeys;
  label: string;
};

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
  });
  const [switches, setSwitches] = useState({
    age: true,
    dob: true,
    jobTitle: true,
    company: true,
    companyLogo: true,
    jobDescription: true,
    startDate: true,
    endDate: true
  });
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosWithInterceptors();
  const { auth } = useAuth();
  const logout = useLogout();

  const [avatar, setAvatar] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await axiosPrivate.post(`/user-public-pref/${auth.user.userId}`, switches);
      const updated = response?.data?.updated;
      setPreferencesSaved(updated);
      setErr(false);
    } catch (err) {
      console.error(err);
      setErr(true);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axiosPrivate.get(`/user/${auth.user.userId}`); //protected route, will throw an error if refreshToken is expired
        const data = response?.data;
        const publicProfilePref = data.publicProfilePref;
        setInputs({
          name: data.name,
          age: data.age,
          dob: data.dob ? dayjs(data.dob).format('DD-MM-YYYY') : '',
          jobTitle: data.jobTitle,
          company: data.company,
          companyLogo: data.companyLogo,
          jobDescription: data.jobDescription,
          startDate: data.startDate ? dayjs(data.startDate).format('DD-MM-YYYY') : '',
          endDate: data.endDate ? dayjs(data.endDate).format('DD-MM-YYYY') : ''
        });
        setAvatar(data.avatar);
        setSwitches({
          age: publicProfilePref.age,
          dob: publicProfilePref.dob,
          jobTitle: publicProfilePref.jobTitle,
          company: publicProfilePref.company,
          companyLogo: publicProfilePref.companyLogo,
          jobDescription: publicProfilePref.jobDescription,
          startDate: publicProfilePref.startDate,
          endDate: publicProfilePref.endDate
        });
      } catch (err) {
        console.error(err);
        try {
          await logout(); // Will throw if logout fails
        } catch (logoutError) {
          console.error('Error during logout:', logoutError);
          // Handle logout-specific errors here
        }
      }
    };

    getUser();
  }, []);
  return (
    <Container>
      <Card className={styles.card}>
        <Row>
          <Col sm={3}>
            <Button variant="link" className="text-black ps-0" onClick={() => navigate('/my-profile')}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" className="me-2" />
              My profile
            </Button>
          </Col>
        </Row>

        <h1>Public profile settings</h1>
        <Row className="mb-2">
          <Col sm={5}>
            <p>You control your profile and limit what is shown to the public. Toggle your preferences on the left and your public profile is as on the right.</p>
          </Col>
        </Row>

        <Row>
          <Col sm={5}>
            <Row>
              <Col className={styles.colEnd}>
                <h2>Edit visibility</h2>
              </Col>
            </Row>
            {/* switch buttons */}
            {(
              [
                { value: 'age', label: 'Age' },
                { value: 'dob', label: 'Date of birth' },
                { value: 'jobTitle', label: 'Job Title' },
                { value: 'company', label: 'Company' },
                { value: 'jobDescription', label: 'Job Description' },
                { value: 'companyLogo', label: 'Company Logo' },
                { value: 'startDate', label: 'Start Date' },
                { value: 'endDate', label: 'End Date' }
              ] as Headers[]
            ).map((obj, i) => {
              return (
                <Row key={i} className="mt-3">
                  <Col sm={4}>
                    <p>{obj.label}</p>
                  </Col>
                  <Col sm={3}>
                    <Form.Group>
                      <Form.Check
                        type="switch"
                        id="custom-switch"
                        className={styles.formSwitch}
                        checked={switches[obj.value]}
                        onChange={() => {
                          setPreferencesSaved(false);
                          setSwitches({ ...switches, [obj.value]: !switches[obj.value] });
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col className="mt-1 ps-0">{switches[obj.value] && <span style={{ fontWeight: 'bold' }}>Public</span>}</Col>
                </Row>
              );
            })}
          </Col>

          <Col>
            <Card className={styles.card__col}>
              <Card.Body style={{ paddingLeft: 0 }}>{avatar ? <Image fetchPriority="low" roundedCircle src={avatar} width="107" height="107" alt="" style={{ objectFit: 'cover' }} /> : <Image fetchPriority="low" src="../images/profile-placeholder.png" alt="default-avatar" style={{ objectFit: 'cover', width: '107px', height: '107px' }} />}</Card.Body>
              <div className="d-flex">
                <h3>{inputs.name}</h3>
                {switches.age && inputs.age && <p className={styles.card__age}>{inputs.age} years old</p>}
              </div>
              {switches.dob && inputs.dob && <p>Date of birth: {inputs.dob}</p>}
              <h3>Career</h3>
              {switches.jobTitle && inputs.jobTitle && <h6 className="mb-0">{inputs.jobTitle}</h6>}
              {switches.companyLogo && inputs.companyLogo && <Image fetchPriority="low" roundedCircle src={inputs.companyLogo || ''} width="100" height="100" alt="" style={{ objectFit: 'cover' }} />}
              {switches.company && inputs.company && <p className="text-muted">{inputs.company}</p>}
              {switches.jobDescription && inputs.jobDescription && (
                <div className="mb-3">
                  <h6 className="mb-0">Job Description:</h6>
                  <small>{inputs.jobDescription}</small>
                </div>
              )}
              {switches.startDate && inputs.startDate && <p className="text-muted mb-0">From: {inputs.startDate} </p>}
              {switches.endDate && inputs.endDate && <p className="text-muted">To: {inputs.endDate}</p>}
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm={4}>
            {preferencesSaved && (
              <Alert variant="success" className="mt-3">
                Preferences saved!
              </Alert>
            )}
            {err && <Alert variant="danger">Something went wrong</Alert>}
            <Button onClick={() => handleSubmit()} variant="primary" type="button" className={'mt-3 w-100 text-white'}>
              Save
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default PublicProfile;
