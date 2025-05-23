import { useState, useRef, useEffect } from "react";
import { Formik, Form as FormikForm, FormikProps, useField, useFormikContext } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { firebaseApp } from "../../firebase/firebaseInit";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { FirebaseError } from "firebase/app";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import { FC } from "react";
import styles from "./ProfileSettings.module.scss";

type InputTypes = {
  name: string;
  age: string;
  dob: Date | null;
  jobTitle: string;
  company: string;
  companyLogo: string;
  jobDescription: string;
  startDate: Date | null;
  endDate: Date | null;
  csrfToken: string;
};
type DatePickerFieldProps = {
  name: string;
  [key: string]: any; //allows more props in the future
};
type AllowedKeys = "jobTitle" | "company" | "jobDescription";
type Headers = {
  value: AllowedKeys;
  label: string;
};

const ProfileSettings = () => {
  const [inputs, setInputs] = useState<InputTypes>({
    name: "",
    age: "",
    dob: null,
    jobTitle: "",
    company: "",
    companyLogo: "",
    jobDescription: "",
    startDate: null,
    endDate: null,
    csrfToken: ""
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [err, setErr] = useState(false);
  const logout = useLogout();

  const [showEndDate, setShowEndDate] = useState(() => {
    if (inputs.name === "") return true;
    else return false;
  });
  const navigate = useNavigate();
  const axiosPrivate = useAxiosWithInterceptors();

  const { auth } = useAuth();

  // for image upload
  const [imgPreview, setImgPreview] = useState("");
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const [avatar, setAvatar] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");

  // event handlers
  const handleImgPreview = () => {
    if (imgPreview === "") {
      return avatar;
    } else return imgPreview;
  };
  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileType = event.target.accept;
    const files = event.target.files;
    const tagId = event.target.id;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file !== undefined && fileType === "image/*") {
      tagId === "avatarUpload" && setImgPreview(URL.createObjectURL(file));

      try {
        //host img on firebase
        const storage = getStorage(firebaseApp);
        const imagesRef = ref(storage, `images/${dayjs().format("DD-MM-YYYY, hh:mm:ssA")}, ${file.name}`);
        await uploadBytesResumable(imagesRef, file);
        const url = await getDownloadURL(imagesRef);
        tagId === "avatarUpload" ? setAvatar(url) : setCompanyLogoUrl(url);
      } catch (error) {
        console.log("error: ", error);
        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "storage/object-not-found":
              console.log("File doesn't exist");
              break;
            case "storage/unauthorized":
              console.log("User doesn't have permission to access the object");
              break;
            case "storage/canceled":
              console.log("User canceled the upload");
              break;
            case "storage/unknown":
              console.log("Unknown error occurred, inspect the server response");
              break;
          }
        }
      }
    }
  };

  const handleSubmit = async (values: InputTypes) => {
    const dataObject = {
      values,
      companyLogoUrl,
      avatar: avatar,
      showEndDate
    };
    try {
      const response = await axiosPrivate.post(`/user/${auth.user.userId}`, dataObject);
      const updated = response?.data?.updated;
      setProfileSaved(updated);
      setErr(false);
    } catch (err) {
      console.error(err);
      setErr(true);
    }
  };

  // validation
  function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString();
  }
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9_ ]*$/, "Please remove any numbers or special characters and try again"),
    age: Yup.number().required("required").typeError("Age must be a number").positive("age must be greater than zero"),
    dob: Yup.date().nullable().required("required"),
    jobTitle: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, "Please remove any special characters and try again"),
    company: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, "Please remove any special characters and try again"),
    jobDescription: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9~!@^&,*()_'"/_ ]*$/, "Please remove any special characters and try again"),
    startDate: Yup.date().nullable().required("required"),
    endDate: Yup.date()
      .nullable()
      .min(Yup.ref("startDate"), ({ min }) => `End date needs to be after ${formatDate(min)}`)
  });

  // date picker
  const DatePickerField: FC<DatePickerFieldProps> = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);
    return (
      <DatePicker
        dateFormat="dd-MM-yyyy"
        {...field}
        {...props}
        selected={(field.value && new Date(field.value)) || null}
        onChange={(val: Date | null) => {
          setFieldValue(field.name, val);
        }}
        className="form-control"
        placeholderText="Select date"
        wrapperClassName={styles.datepicker}
      />
    );
  };

  // on load
  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axiosPrivate.get(`/user/${auth.user.userId}`); //protected route, will throw an error if refreshToken is expired
        const antiCSRFRes = await axiosPrivate.get("/antiCSRF");
        const data = response?.data;
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
          csrfToken: antiCSRFRes.data.csrfToken
        });
        setAvatar(data.avatar ?? "");
      } catch (err) {
        console.error(err);
        try {
          await logout(); // Will throw if logout fails
        } catch (logoutError) {
          console.error("Error during logout:", logoutError);
          // Handle logout-specific errors here
        }
      }
    };

    getUser();
  }, []);
  return (
    <Container>
      <Card className="mt-5 p-3 p-sm-5">
        <Row>
          <Col sm={3}>
            <Button variant="link" className="text-black ps-0" onClick={() => navigate("/my-profile")}>
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
          onSubmit={(values: InputTypes) => {
            handleSubmit(values);
          }}
        >
          {({ values, handleChange, errors, touched }: FormikProps<InputTypes>) => (
            <FormikForm>
              <input type="hidden" name="csrfToken" value={values.csrfToken} onChange={handleChange} />
              <Row>
                <Col sm={6}>
                  <div>
                    {imgPreview !== "" || avatar ? (
                      <Image roundedCircle src={handleImgPreview()} width="107" height="107" alt="" style={{ objectFit: "cover" }} />
                    ) : (
                      <Image
                        src="../images/profile-placeholder.png"
                        alt="default-avatar"
                        style={{
                          objectFit: "cover",
                          width: "107px",
                          height: "107px"
                        }}
                      />
                    )}
                    <input id="avatarUpload" type="file" ref={imgInputRef} onChange={uploadImage} hidden accept="image/*" name="avatar" />
                    <div className="mt-3">
                      <Col sm={12}>
                        <Row>
                          <Col>
                            <Button
                              variant="primary"
                              className="text-white w-100"
                              onClick={() => {
                                if (imgInputRef !== null && imgInputRef.current !== null) imgInputRef.current.click();
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
                                setImgPreview("");
                                setAvatar("");
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
                    <Form.Control type="text" placeholder={"Enter Name"} name="name" value={values.name} onChange={handleChange} />
                    {errors.name && touched.name && <div className="errMessage">{errors.name}</div>}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="mb-3">
                  <label className="form-label">Date of birth</label>
                  <br />
                  <DatePickerField name="dob" />
                  {errors.dob && touched.dob && <div className="errMessage">{errors.dob}</div>}
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Age</Form.Label>
                    <Form.Control type="text" placeholder={"Enter Age"} name="age" value={values.age} onChange={handleChange} />
                    {errors.age && touched.age && <div className="errMessage">{errors.age}</div>}
                  </Form.Group>
                </Col>
              </Row>
              {(
                [
                  { value: "jobTitle", label: "Job Title" },
                  { value: "company", label: "Company" },
                  { value: "jobDescription", label: "Job Description" }
                ] as Headers[]
              ).map((obj, i) => {
                return (
                  <Row key={i}>
                    <Col>
                      <Form.Group className="mb-3">
                        <Form.Label>{obj.label}</Form.Label>
                        <Form.Control type="text" placeholder={`Enter ${obj.label}`} name={obj.value} value={values[obj.value]} onChange={handleChange} />
                        {errors[obj.value] && touched[obj.value] && <div className="errMessage">{errors[obj.value]}</div>}
                      </Form.Group>
                    </Col>
                  </Row>
                );
              })}
              <Row>
                <Col className="mb-3">
                  <Form.Group controlId="companyLogoUpload">
                    <Form.Label>Company Logo Upload</Form.Label>
                    <Form.Control type="file" size="sm" accept="image/*" onChange={uploadImage} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="mb-3">
                  <label className="form-label">Start Date</label>
                  <br />
                  <DatePickerField name="startDate" />
                  {errors.startDate && touched.startDate && <div className="errMessage">{errors.startDate}</div>}
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
                    setShowEndDate(!showEndDate);
                    setInputs({ ...inputs, endDate: null });
                  }}
                />
              </div>
              {showEndDate && (
                <Row>
                  <Col className="mb-3">
                    <label className="form-label">End Date</label>
                    <br />
                    <DatePickerField name="endDate" />
                    {errors.endDate && touched.endDate && <div className="errMessage">{errors.endDate}</div>}
                  </Col>
                </Row>
              )}
              <Row>
                <Col>
                  {profileSaved && (
                    <Alert variant="success" className="mt-3">
                      Profile saved!
                    </Alert>
                  )}
                  {err && <Alert variant="danger">Something went wrong</Alert>}
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-end" sm={3}>
                  <Button variant="primary" type="submit" className={"mt-3 w-100 text-white "}>
                    Submit
                  </Button>
                </Col>
              </Row>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  );
};

export default ProfileSettings;
