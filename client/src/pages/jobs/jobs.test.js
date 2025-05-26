import { render, screen } from '@testing-library/react'
import Jobs from './Jobs'
import { MemoryRouter } from 'react-router-dom'
import '../../matchmedia.mock'

it('should have not be loading after awhile', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Jobs />
    </MemoryRouter>
  )
  expect(screen.queryByText(/Jobs not loaded!/i)).not.toBeInTheDocument()
})
