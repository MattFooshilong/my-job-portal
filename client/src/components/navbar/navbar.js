import React, { useEffect } from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Nav from 'react-bootstrap/Nav'
import axios from 'axios'
import styles from './Nav.module.scss'
import { useNavigate, Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const NavBar = () => {
  const { auth, setAuth } = useAuth()
  const navigate = useNavigate()
  const logout = async () => {
    await axios.get('/api/logout').catch((err) => console.log(err))
    setAuth({})
    navigate('/')
  }

  const userOnly = auth?.user?.roles.includes(2)
  const adminOnly = auth?.user?.roles.includes(1)

  return (
    <Navbar bg="light" expand="lg" collapseOnSelect className={styles.navbar}>
      <Container fluid className="px-sm-0 mx-sm-4">
        <Navbar.Brand href="/">
          <Image src="/logo192.png" alt="" width="35" height="35" className="me-3" />
          My Job Portal
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className={styles.nav}>
            <Link to="/jobs">Jobs</Link>
            {auth?.user ? (
              <>
                {userOnly && (
                  <>
                    <Link to="/job-applications">Job Applications</Link>
                    <Link to="/my-profile">My Profile</Link>
                    <Link to="/profile-settings">Profile Settings</Link>
                    <Link to="/public-profile">Edit Public Profile</Link>
                  </>
                )}
                {adminOnly && <Link to="/admin-dashboard">Admin Dashboard</Link>}
                <div className={styles.logoutButton} onClick={() => logout()}>
                  Logout
                </div>
              </>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default NavBar
