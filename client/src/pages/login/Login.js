import { useState, useContext } from 'react'
import AuthContext from '../../context/AuthProvider'
import { Formik, Form as FormikForm } from 'formik'
import * as Yup from 'yup'
import axios from 'axios'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import styles from './Login.module.scss'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [inputs, setInputs] = useState({
    email: 'admin@gmail.com',
    password: 'Abc123!',
  })
  const [err, setErr] = useState(false)
  const { setAuth } = useContext(AuthContext)

  const navigate = useNavigate()
  const handleSubmit = async (values) => {
    const data = {
      email: values.email.toLowerCase().trim() || '',
      password: values.password,
    }
    try {
      const res = await axios.post('/api/login', data)
      const accessToken = res?.data?.accessToken
      setAuth({ user: inputs, accessToken })
      setErr(false)
      navigate('/jobs')
    } catch (err) {
      console.log(err)
      setErr(true)
    }
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Not a valid email').required('Required'),
    password: Yup.string()
      .required('Required')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,}$/, 'Password must contain one digit, one lowercase, one uppercase and a special character'),
  })

  return (
    <Container className="py-3 pt-sm-5">
      <Card className={`p-sm-5 p-4 mt-5 ${styles.card}`}>
        <h4>Hi! Welcome to My Job Portal</h4>
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
              <Form.Group className="mt-3 mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control id="email" type="email" placeholder="Enter email" name="email" value={values.email} onChange={handleChange} />
                {errors.email && touched.email && <div className="err-message">{errors.email}</div>}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Password" name="password" value={values.password} onChange={handleChange} />
                {errors.password && touched.password && <div className="err-message">{errors.password}</div>}
              </Form.Group>
              {err && <Alert variant="danger">Incorrect email or password</Alert>}
              <Button variant="primary" type="submit" className={'mt-3 w-100 text-white'}>
                Login
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  )
}

export default Login
