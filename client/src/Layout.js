import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <main>
      {/* The outlet component represents all the children of the layout component. So anything nested inside the Layout component is represented by the Outlet component */}
      {/* Routes such as <Route path="/login" element={<Login />} /> will be rendered by Outlet */}
      <Outlet />
    </main>
  )
}
export default Layout
