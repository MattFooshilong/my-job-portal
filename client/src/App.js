import React from 'react'
import { BrowserRouter } from 'react-router-dom'

// Layout
import Router from './Router'

const App = () => {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App