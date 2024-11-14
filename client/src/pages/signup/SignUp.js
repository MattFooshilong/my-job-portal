import { useState } from 'react'
import { Formik, Form as FormikForm } from 'formik'
import * as Yup from 'yup'
import axios from '../../config/axiosConfig'
import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import styles from './SignUp.module.scss'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const SignUp = () => {
  const [defaultInputs] = useState({
    email: '',
    password: '',
  })
  const [err, setErr] = useState(false)
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location?.state?.from.pathname || '/' //where they came from

  const handleSubmit = async (values) => {
    const data = {
      email: values.email.toLowerCase().trim() || '',
      password: values.password,
    }
    try {
      const res = await axios.post('/api/signup', data)
      const accessToken = res?.data?.accessToken
      const user = res?.data?.user
      setAuth({ user, roles: user.roles, accessToken })
      setErr(false)
      navigate(from, { replace: true })
    } catch (err) {
      console.log(err)
      setErr(true)
    }
  }
  //shift this to server-side
  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Not a valid email').required('Required'),
    password: Yup.string()
      .required('Required')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{4,}$/, 'Password must contain one digit, one lowercase, one uppercase and a special character'),
  })

  return (
    <Container className="py-3 pt-sm-5">
      <Card className={`p-sm-5 p-4 mt-5 ${styles.card}`}>
        <h4 className="text-center">Sign up for an account</h4>
        <Formik
          enableReinitialize
          initialValues={defaultInputs}
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
              {err && <Alert variant="danger">Something went wrong, please try again later</Alert>}
              <Button variant="primary" type="submit" className={'mt-3 w-100 text-white'}>
                Sign Up
              </Button>
            </FormikForm>
          )}
        </Formik>
      </Card>
    </Container>
  )
}

export default SignUp
