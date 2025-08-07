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
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import { FC } from "react";
import styles from "./ProfileSettings.module.scss";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "react-bootstrap/Spinner";
import placeHolderData from "../my-profile/placeHolderData";

type InputTypes = {
  name: string;
  age: string;
  job_title: string;
  company_name: string;
  company_logo_path: string;
  job_description: string;
  start_date: Date | null;
  end_date: Date | null;
  csrfToken: string;
  signed_avatar_url: string;
  avatar_path: string;
  signed_company_logo_url: string;
};
type DatePickerFieldProps = {
  name: string;
  [key: string]: any; //allows more props in the future
};
type AllowedKeys = "job_title" | "company_name" | "job_description";
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

const ProfileSettings = () => {
  const [inputs, setInputs] = useState<InputTypes>({
    name: "",
    age: "",
    job_title: "",
    company_name: "",
    company_logo_path: "",
    job_description: "",
    start_date: null,
    end_date: null,
    csrfToken: "",
    signed_avatar_url: "",
    avatar_path: "",
    signed_company_logo_url: ""
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [err, setErr] = useState(false);
  const [showEndDate, setShowEndDate] = useState(() => {
    if (inputs.name === "") return true;
    else return false;
  });
  const navigate = useNavigate();
  const axiosPrivate = useAxiosWithInterceptors();
  const logout = useLogout();
  const { auth } = useAuth();
  const queryClient = useQueryClient();

  // for image upload
  const [imgPreview, setImgPreview] = useState("");
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

  // event handlers
  const handleImgPreview = () => {
    if (imgPreview === "") {
      return inputs.signed_avatar_url;
    } else return imgPreview;
  };
  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileType = event.target.accept;
    const files = event.target.files;
    const tagId = event.target.id;
    if (!files || files.length === 0 || fileType !== "image/*") return;
    const file = files[0];
    if (tagId === "avatarUpload") {
      setImgPreview(URL.createObjectURL(file));
      setAvatarFile(file);
    } else if (tagId === "companyLogoUpload") {
      setCompanyLogoFile(file);
    }
  };

  const handleSubmit = async (values: InputTypes) => {
    const formData = new FormData();
    formData.append("values", JSON.stringify(values));
    formData.append("csrfToken", values.csrfToken);
    formData.append("showEndDate", String(showEndDate));
    formData.append("user_id", auth.user.userId);
    avatarFile && formData.append("avatar_file", avatarFile);
    companyLogoFile && formData.append("company_logo_file", companyLogoFile);
    try {
      const response = await axiosPrivate.post(`/updateProfileSettings`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const updated = response?.data?.updated;
      setProfileSaved(updated);
      setErr(false);
      queryClient.invalidateQueries({ queryKey: ["getMyProfileData"] });
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
    job_title: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, "Please remove any special characters and try again"),
    company_name: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9~!@^&*()_'"/_ ]*$/, "Please remove any special characters and try again"),
    job_description: Yup.string()
      .required("required")
      .matches(/^[a-zA-Z0-9~!@^&,*()_'"/_ ]*$/, "Please remove any special characters and try again"),
    start_date: Yup.date().nullable().required("required"),
    end_date: Yup.date()
      .nullable()
      .min(Yup.ref("start_date"), ({ min }) => `End date needs to be after ${formatDate(min)}`)
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

  useEffect(() => {
    const setInputsOnLoad = async () => {
      try {
        const antiCSRFRes = await axiosPrivate.get("/antiCSRF");
        if (profileDataObj) {
          setInputs({
            name: profileDataObj.name,
            age: profileDataObj.age,
            job_title: profileDataObj.job_title,
            company_name: profileDataObj.company_name,
            company_logo_path: profileDataObj.company_logo_path,
            job_description: profileDataObj.job_description,
            start_date: isNaN(new Date(profileDataObj.start_date).valueOf()) ? new Date() : new Date(profileDataObj.start_date),
            end_date: isNaN(new Date(profileDataObj.end_date).valueOf()) ? new Date() : new Date(profileDataObj.end_date),
            csrfToken: antiCSRFRes.data.csrfToken,
            signed_avatar_url: profileDataObj.signed_avatar_url,
            avatar_path: profileDataObj.avatar_path,
            signed_company_logo_url: profileDataObj.signed_company_logo_url
          });
        }
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
    setInputsOnLoad();
  }, [profileDataObj]);

  if (isPending) {
    return <Spinner animation="border" className="mt-5" />;
  }

  if (isError) {
    return <span>Error: {error?.message}</span>;
  }

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
                    {imgPreview !== "" || inputs.signed_avatar_url ? (
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
                  { value: "job_title", label: "Job Title" },
                  { value: "company_name", label: "Company" },
                  { value: "job_description", label: "Job Description" }
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
                    {inputs.company_logo_path && (
                      <div className="mt-2">
                        <span className="text-muted">Previously uploaded: </span>
                        <a href={inputs.signed_company_logo_url} target="_blank" rel="noopener noreferrer">
                          {inputs.company_logo_path.split("/")[1]}
                        </a>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col className="mb-3">
                  <label className="form-label">Start Date</label>
                  <br />
                  <DatePickerField name="start_date" />
                  {errors.start_date && touched.start_date && <div className="errMessage">{errors.start_date}</div>}
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
                    setInputs({ ...inputs, end_date: null });
                  }}
                />
              </div>
              {showEndDate && (
                <Row>
                  <Col className="mb-3">
                    <label className="form-label">End Date</label>
                    <br />
                    <DatePickerField name="end_date" />
                    {errors.end_date && touched.end_date && <div className="errMessage">{errors.end_date}</div>}
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
