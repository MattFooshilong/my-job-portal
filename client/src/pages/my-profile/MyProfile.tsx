import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import styles from "./MyProfile.module.scss";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faEnvelope } from "@fortawesome/free-regular-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";
import useLogout from "../../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import Spinner from "react-bootstrap/Spinner";
import placeHolderData from "./placeHolderData";

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
};

const PublicProfile = () => {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosWithInterceptors();
  const logout = useLogout();

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
  // onload + cache
  const {
    isPending,
    isError,
    data: profileDataObj,
    error
  } = useQuery<ProfileDataType>({
    queryKey: ["getMyProfileData"],
    queryFn: getMyProfileData,
    placeholderData: placeHolderData,
    staleTime: 3 * 24 * 60 * 60 //cacheTime 3 days
  });

  if (isPending) {
    return <Spinner animation="border" className="mt-5" />;
  }

  if (isError) {
    return <span>Error: {error?.message}</span>;
  }

  const formattedStartDate = dayjs(profileDataObj?.start_date).format("DD-MM-YYYY");
  const formattedEndDate = dayjs(profileDataObj?.end_date).format("DD-MM-YYYY");
  return (
    <Container>
      <Row>
        <Col sm={8}>
          <Card className={styles.card}>
            <Card.Body>
              <Row className="d-flex justify-content-between">
                <Col style={{ paddingLeft: 0 }} xs={{ order: 2, span: 12 }} sm={{ order: 1, span: 6 }}>
                  {profileDataObj?.signed_avatar_url ? <Image roundedCircle src={profileDataObj?.signed_avatar_url} width="107" height="107" alt="" style={{ objectFit: "cover" }} /> : <Image src="../images/profile-placeholder.png" alt="default-avatar" style={{ objectFit: "cover", width: "107px", height: "107px" }} />}
                </Col>
                <Col xs={{ order: 1, span: 12 }} sm={{ order: 2, span: 6 }}>
                  <Link to="/profile-settings">
                    <FontAwesomeIcon icon={faPenToSquare} size="xl" className="float-end text-black" />
                  </Link>
                </Col>
              </Row>
            </Card.Body>
            <div className="d-flex mb-0">
              <h3>{profileDataObj?.name}</h3>
              {profileDataObj?.age && <p className={styles.card__age}>{profileDataObj?.age} years old</p>}
            </div>
            <p className="mb-0">This is a profile summary - Hi I&apos;m a full stack developer and I have built dashboards with React, Typescript, Bootstrap on the frontend and Nodejs, SQL, Graphql for the backend</p>
            <small>Singapore</small>

            <p className="mb-0 mt-2">
              <FontAwesomeIcon icon={faEnvelope} size="xl" className="me-2" />
              {profileDataObj?.email}
            </p>
            <p className="mb-0">
              <FontAwesomeIcon icon={faWhatsapp} size="xl" className="me-2" />
              +65 {profileDataObj?.whatsapp}
            </p>
            <a className="mb-3 text-black" href="https://www.linkedin.com/in/shilong-foo/">
              <FontAwesomeIcon icon={faLinkedin} size="xl" className="me-2" />
              https://www.linkedin.com/in/shilong-foo/
            </a>
            <h3>Career</h3>
            {profileDataObj?.job_title && <h6 className="mb-0">Job Title: {profileDataObj?.job_title}</h6>}
            {profileDataObj?.company_name && (
              <p className="mb-0">
                Company: {profileDataObj?.company_name}{" "}
                {profileDataObj?.start_date && (
                  <small className="mb-3 d-block">
                    {formattedStartDate} - {formattedEndDate ? formattedEndDate : "Present"}
                  </small>
                )}
              </p>
            )}
            {profileDataObj?.job_description && (
              <div className="mb-3">
                <h6 className="mb-0">Job Description:</h6>
                <small>{profileDataObj?.job_description}</small>
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
                { name: "John Lee", jobTitle: "Developer at Google" },
                { name: "Susan Koh", jobTitle: "Designer at Mavrick" },
                { name: "Shakesphere Tan", jobTitle: "Poet lecturer at Singapore Polytechnic" },
                { name: "Hafiz", jobTitle: "Engineer at NTU" },
                { name: "Lambert Lahm", jobTitle: "QA Engineer at PlatsOrg" }
              ].map((ele, i) => {
                return (
                  <Row className="d-flex justify-content-between mt-3" key={i}>
                    <Col xs={3}>
                      <Image src="../images/profile-placeholder.png" alt="default-avatar" style={{ objectFit: "cover", width: "70px", height: "70px" }} />
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
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PublicProfile;
