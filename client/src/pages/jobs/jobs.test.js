import { render, screen } from '@testing-library/react'
import Jobs from './Jobs'
import '../../matchmedia.mock'
import axios from '../../config/axiosConfig'
import { axiosPrivate } from '../../config/axiosConfig'
import { BrowserRouter } from 'react-router-dom'

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
const jobsMockResponse = {
  data: [
    {
      companyDescription: 'testing company',
      companyName: 'abc pte ltd',
      id: 0,
      industry: 'manufacturing',
      isRecruiting: true,
      jobDescription: 'help out',
      jobTitle: 'engineer',
      location: 'amk',
      noOfEmployees: 2,
      skills: 'Record<number, string>',
      tasks: 'Record<number, string>',
      type: 'Full Time'
    }
  ]
}
const appliedJobsMockResponse = {
  data: {
    appliedJobs: [1, 2, 3, 4]
  }
}
it('should have at least 1 job', async () => {
  //mock get jobs
  axios.get.mockResolvedValue(jobsMockResponse)
  //mock get user
  axiosPrivate.get.mockResolvedValue(appliedJobsMockResponse)
  render(
    <BrowserRouter>
      <Jobs />
    </BrowserRouter>
  )
  const jobRow = await screen.findByTestId('job-0')
  expect(jobRow).toBeInTheDocument()
})
