import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Nav from 'react-bootstrap/Nav'
import styles from './Nav.module.scss'
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react'

const NavBar = () => {
    let location = useLocation();
    const [token, setToken] = useState(null)
    useEffect(() => {
        const temp = localStorage.getItem('token')
        setToken(temp)
    }, [location])
    return (
        <Navbar bg="light" expand='lg' collapseOnSelect className={styles.navbar}>
            <Container fluid className='px-sm-0 mx-sm-4'>
                <Navbar.Brand href='/'>
                    <Image src='/logo192.png' alt='' width='35' height='35' />
                </Navbar.Brand>
                <>
                    <Navbar.Toggle aria-controls='basic-navbar-nav' />
                    <Navbar.Collapse id='basic-navbar-nav' style={{ justifyContent: 'flex-end' }}>
                        <Nav className={styles.nav}>

                            {token && <Nav.Link href='/logout'>Logout</Nav.Link>}

                        </Nav>
                    </Navbar.Collapse>
                </>
            </Container>

        </Navbar>
    )
}


export default NavBar