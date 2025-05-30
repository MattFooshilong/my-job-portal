import { render, screen, fireEvent } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthProvider'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import App from '../../App'
import '../../matchmedia.mock'
import axios from '../../config/axiosConfig'
import { axiosPrivate } from '../../config/axiosConfig'

jest.mock('../../config/axiosConfig', () => {
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn()
    },
    axiosPrivate: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() }
      }
    }
  }
})
const loginMockResponse = {
  data: {
    accessToken: '',
    user: {
      roles: []
    }
  }
}
const appliedJobsMockResponse = {
  data: {
    appliedJobs: [1, 2, 3, 4]
  }
}
it('should render login box', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
  const h4Tag = screen.getByRole('heading', { name: /Hi! Welcome to My Job Portal/i })
  expect(h4Tag).toBeInTheDocument()
})
it('should be able to type in email', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
  const emailInput = screen.getByPlaceholderText(/Enter Email/i)
  fireEvent.change(emailInput, { target: { value: 'user1@gmail.com' } })
  expect(emailInput.value).toBe('user1@gmail.com')
})
it('should be able to type  password', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
  const passwordInput = screen.getByPlaceholderText(/Password/i)
  fireEvent.change(passwordInput, { target: { value: 'Abc123!' } })
  expect(passwordInput.value).toBe('Abc123!')
})
it('should be able to login with email and password', async () => {
  axios.post.mockResolvedValue(loginMockResponse)
  axiosPrivate.get.mockResolvedValue(appliedJobsMockResponse)

  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )

  const navLoginElement = screen.getByText(/Login/i)
  fireEvent.click(navLoginElement)

  const emailInput = screen.getByPlaceholderText(/Enter Email/i)
  expect(emailInput).toBeInTheDocument()
  fireEvent.change(emailInput, { target: { value: 'user1@gmail.com' } })

  const passwordInput = screen.getByPlaceholderText(/Password/i)
  fireEvent.change(passwordInput, { target: { value: 'Abc123!' } })

  const loginButton = screen.getByRole('button', { name: /Login/i })
  fireEvent.click(loginButton)

  const logoutElement = await screen.findByText(/Logout/i)
  expect(logoutElement).toBeInTheDocument()
})
