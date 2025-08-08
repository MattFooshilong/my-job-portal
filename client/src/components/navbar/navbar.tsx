import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import Nav from "react-bootstrap/Nav";
import styles from "./Nav.module.scss";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useLogout from "../../hooks/useLogout";
import { useQueryClient } from "@tanstack/react-query";
import useAxiosWithInterceptors from "../../hooks/useAxiosWithInterceptors";

const NavBar = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const signOut = async () => {
    queryClient.clear();
    await logout();
  };
  const userOnly = auth?.roles?.includes(2);
  const adminOnly = auth?.roles?.includes(1);
  const axiosPrivate = useAxiosWithInterceptors();

  const prefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ["getJobApplications"],
      queryFn: async () => {
        const dataObject = {
          user_id: auth.user.userId,
          status: "InProgress"
        };
        const response = await axiosPrivate.post("/job-applications-and-company-info", dataObject); //protected route, will throw an error if refreshToken is expired
        return response?.data?.infoOfAppliedJobs;
      },
      staleTime: 1 * 24 * 60 * 60 //cacheTime 1 day
    });
  };
  return (
    <Navbar bg="light" expand="lg" collapseOnSelect className={styles.navbar}>
      <Container fluid className="px-sm-0 mx-sm-4">
        <Navbar.Brand onClick={() => navigate("/")} className={styles.navBrand}>
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
                    <Link to="/job-applications" onMouseEnter={prefetch}>
                      Job Applications
                    </Link>
                    <Link to="/my-profile">My Profile</Link>
                    <Link to="/profile-settings">Profile Settings</Link>
                    <Link to="/public-profile">Edit Public Profile</Link>
                  </>
                )}
                {adminOnly && <Link to="/admin-dashboard">Admin Dashboard</Link>}
                <div className={styles.logoutButton} onClick={() => signOut()}>
                  Logout
                </div>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Sign up</Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
