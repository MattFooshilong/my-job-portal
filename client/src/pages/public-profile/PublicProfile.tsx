import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styles from "./ProfileForms.module.scss";
import Alert from "react-bootstrap/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";
import useLogout from "../../hooks/useLogout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "react-bootstrap/Spinner";
import placeHolderData from "../my-profile/placeHolderData";

type AllowedKeys = "age" | "job_title" | "company_name" | "job_description" | "company_logo_pref" | "start_date" | "end_date";
type Headers = {
  value: AllowedKeys;
  label: string;
};
type ProfileDataType = {
  name: string;
  age: string;
  job_title: string;
  company_name: string;
  job_description: string;
  start_date: string;
  end_date: string;
  email: string;
  whatsapp: string;
  company_logo_path: string;
  signed_avatar_url: string;
  avatar_path: string;
  signed_company_logo_url: string;
};
type PublicProfilePrefDataType = {
  age: boolean;
  end_date: boolean;
  company_name: boolean;
  company_logo_pref: boolean;
  job_description: boolean;
  job_title: boolean;
  start_date: boolean;
};
const PublicProfile = () => {
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [err, setErr] = useState(false);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosWithInterceptors();
  const { auth } = useAuth();
  const logout = useLogout();
  const queryClient = useQueryClient();

  const [switches, setSwitches] = useState({
    age: true,
    job_title: true,
    company_name: true,
    company_logo_pref: true,
    job_description: true,
    start_date: true,
    end_date: true
  });
  const handleSubmit = async () => {
    try {
      const dataObj = {
        switches,
        user_id: auth.user.userId
      };
      const response = await axiosPrivate.post(`/user-public-pref`, dataObj);
      const updated = response?.data?.updated;
      setPreferencesSaved(updated);
      setErr(false);
      queryClient.invalidateQueries({ queryKey: ["getPublicProfilePrefData"] });
    } catch (err) {
      console.error(err);
      setErr(true);
    }
  };

  const getMyProfileData = async () => {
    try {
      const hideIdObj = { user_id: auth.user.userId };
      const res = await axiosPrivate.post(`/my-profile`, hideIdObj);
      return res.data;
    } catch (err) {
      console.error(err);
      try {
        await logout();
      } catch (err) {
        console.error(err);
      }
    }
  };
  const getPublicProfilePrefData = async () => {
    try {
      const hideIdObj = { user_id: auth.user.userId };
      const res = await axiosPrivate.post(`/public-profile-pref`, hideIdObj);
      return res.data;
    } catch (err) {
      console.error(err);
      try {
        await logout();
      } catch (err) {
        console.error(err);
      }
    }
  };
  //on load + cache
  const {
    isPending,
    isError,
    data: profileDataObj
  } = useQuery<ProfileDataType>({
    queryKey: ["getMyProfileData"],
    queryFn: getMyProfileData,
    placeholderData: placeHolderData,
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });
  const {
    isPending: publicProfilePrefIsPending,
    isError: publicProfilePrefIsError,
    data: publicProfilePrefObj
  } = useQuery<PublicProfilePrefDataType>({
    queryKey: ["getPublicProfilePrefData"],
    queryFn: getPublicProfilePrefData,
    placeholderData: {
      age: true,
      end_date: true,
      company_name: true,
      company_logo_pref: true,
      job_description: true,
      job_title: true,
      start_date: true
    },
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });

  useEffect(() => {
    //set data on first fetch
    if (publicProfilePrefObj) setSwitches(publicProfilePrefObj);
  }, [publicProfilePrefObj]);

  const formattedStartDate = dayjs(profileDataObj?.start_date).format("DD-MM-YYYY");
  const formattedEndDate = dayjs(profileDataObj?.end_date).format("DD-MM-YYYY");

  if (publicProfilePrefIsPending || isPending) {
    return <Spinner animation="border" className="mt-5" />;
  }

  if (publicProfilePrefIsError || isError) {
    return <span>Error: fetching data went wrong</span>;
  }

  return (
    <Container>
      <Card className={styles.card}>
        <Row>
          <Col sm={3}>
            <Button variant="link" className="text-black ps-0" onClick={() => navigate("/my-profile")}>
              <FontAwesomeIcon icon={faArrowLeft} size="lg" className="me-2" />
              My profile
            </Button>
          </Col>
        </Row>

        <h1>Public profile settings</h1>
        <Row className="mb-2">
          <Col sm={5}>
            <p>You control your profile and limit what is shown to the public. Toggle your preferences on the left and your public profile is as shown on the right.</p>
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
                { value: "age", label: "Age" },
                { value: "job_title", label: "Job Title" },
                { value: "company_name", label: "Company" },
                { value: "job_description", label: "Job Description" },
                { value: "company_logo_pref", label: "Company Logo" },
                { value: "start_date", label: "Start Date" },
                { value: "end_date", label: "End Date" }
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
                  <Col className="mt-1 ps-0">{switches[obj.value] && <span style={{ fontWeight: "bold" }}>Public</span>}</Col>
                </Row>
              );
            })}
          </Col>

          <Col>
            <Card className={styles.card__col}>
              <Card.Body style={{ paddingLeft: 0 }}>{profileDataObj?.signed_avatar_url ? <Image roundedCircle src={profileDataObj?.signed_avatar_url} width="107" height="107" alt="" style={{ objectFit: "cover" }} /> : <Image src="../images/profile-placeholder.png" alt="default-avatar" style={{ objectFit: "cover", width: "107px", height: "107px" }} />}</Card.Body>
              <div className="d-flex">
                <h3>{profileDataObj?.name}</h3>
                {switches?.age && profileDataObj?.age && <p className={styles.card__age}>{profileDataObj?.age} years old</p>}
              </div>
              <h3>Career</h3>
              {switches?.job_title && profileDataObj?.job_title && <h6 className="mb-0">{profileDataObj?.job_title}</h6>}
              {switches?.company_logo_pref && profileDataObj?.company_logo_path && <Image roundedCircle src={profileDataObj?.company_logo_path || ""} width="100" height="100" alt="" style={{ objectFit: "cover" }} />}
              {switches?.company_name && profileDataObj?.company_name && <p className="text-muted">{profileDataObj?.company_name}</p>}
              {switches?.job_description && profileDataObj?.job_description && (
                <div className="mb-3">
                  <h6 className="mb-0">Job Description:</h6>
                  <small>{profileDataObj?.job_description}</small>
                </div>
              )}
              {switches?.start_date && formattedStartDate && <p className="text-muted mb-0">From: {formattedStartDate} </p>}
              {switches?.end_date && formattedEndDate && <p className="text-muted">To: {formattedEndDate}</p>}
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
            <Button onClick={() => handleSubmit()} variant="primary" type="button" className={"mt-3 w-100 text-white"}>
              Save
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default PublicProfile;
