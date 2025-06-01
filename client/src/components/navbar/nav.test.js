import { render, screen } from '@testing-library/react'
import Nav from './navbar'
import { MemoryRouter } from 'react-router-dom'

it('should have the logo rendered', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Nav />
    </MemoryRouter>
  )

  expect(screen.getByText(/My Job Portal/i)).toBeInTheDocument()
})
