import { useEffect, useState } from "react";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import axios from "../../config/axiosConfig";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Spinner from "react-bootstrap/Spinner";
import styles from "./Login.module.scss";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";

type ValuesType = {
  email: string;
  password: string;
};
const Login = () => {
  const [defaultInputs] = useState({
    email: "user1@gmail.com",
    password: "Abc123!"
  });
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location?.state?.from.pathname || "/"; //where they came from

  const handleSubmit = async (values: ValuesType) => {
    setLoading(true);

    const data = {
      email: values.email.toLowerCase().trim() || "",
      password: values.password
    };
    try {
      const res = await axios.post("/public/login", data);
      const accessToken = res?.data?.accessToken;
      const user = res?.data?.user;
      setAuth({ user, roles: user.roles, accessToken });
      setErr(false);
      setLoading(false);
      navigate(from, { replace: true });
    } catch (err) {
      console.log(err);
      setErr(true);
      setLoading(false);
    }
  };

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Not a valid email").required("Required"),
    password: Yup.string()
      .required("Required")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,}$/, "Password must contain one digit, one lowercase, one uppercase and a special character")
  });
  useEffect(() => {
    localStorage.setItem("persist", JSON.stringify(persist));
  }, [persist]);
  return (
    <Container className="py-3 pt-sm-5">
      <Card className={`p-sm-5 p-4 mt-5 ${styles.card}`}>
        <h4>Hi! Welcome to My Job Portal</h4>
        <Formik
          enableReinitialize
          initialValues={defaultInputs}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
        >
          {({ values, handleChange, errors, touched }) => (
            <FormikForm>
              <Form.Group className="mt-3 mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control id="email" type="email" placeholder="Enter email" name="email" value={values.email} onChange={handleChange} />
                {errors.email && touched.email && <div className="errMessage">{errors.email}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" name="password" value={values.password} onChange={handleChange} />
                {errors.password && touched.password && <div className="errMessage">{errors.password}</div>}
              </Form.Group>
              {err && <Alert variant="danger">Incorrect email or password</Alert>}
              <Button variant="primary" type="submit" className={"mt-3 w-100 text-white"}>
                {loading ? <Spinner animation="border" size="sm" /> : "Login"}
              </Button>
              <Row>
                <Col className={styles.persistCheck}>
                  <input type="checkbox" id="persist" onChange={togglePersist} checked={persist} />
                  <label htmlFor="persist">Trust This Device</label>
                  <OverlayTrigger key="right" placement="right" overlay={<Tooltip id={"tooltip-right"}>Trusting this device allows you to stay logged in on the page after refresh or coming back from another webpage</Tooltip>}>
                    <FontAwesomeIcon icon={faQuestionCircle} size="lg" className="ms-1 me-1" />
                  </OverlayTrigger>
                </Col>
              </Row>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  );
};

export default Login;
