import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import Spinner from "react-bootstrap/Spinner";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();
  useEffect(() => {
    let isMounted = true; //fix memory leak (setting a set to a unmounted component)
    const verifyRefreshToken = async () => {
      try {
        //get a new access token and set in auth state
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        isMounted && setIsLoading(false);
      }
    };
    //when user clicks refresh or comes back from another page (eg google), auth will have no accessToken
    //if no access token, get a new one
    console.log("accessToken from PersistLogin: ", auth.accessToken);
    !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);
    return () => {
      isMounted = false;
    };
  }, []);
  //  useEffect(() => {
  //    console.log(`isLoading: ${isLoading}`)
  //    console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
  //  }, [isLoading])

  //all the nested routes under PersistLogin in App.js will appear under here in Outlet
  //if persist is false, upon refresh will kick user out to login page - for trust this device
  return <>{!persist ? <Outlet /> : isLoading ? <Spinner animation="border" className="mt-5" /> : <Outlet />}</>;
};
export default PersistLogin;
