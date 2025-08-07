import { Router } from "express";
import { login, signUp, logout } from "../controllers/authController";
import { refreshToken } from "../controllers/refreshTokenController";
import { getAllJobs } from "../controllers/jobsController";
import cookieParser from "cookie-parser";
const router = Router();
router.use(cookieParser());

//use - http://localhost:3001/public/
router.get("/", (req, res) => {
  console.log("testing");
  res.status(200).send("welcome");
});
router.post("/testcsrf", (req, res) => {
  console.log("testcsrf fn in req.body.csrfToken: ", req.body.csrfToken);
  res.status(200).send("csrf successful");
});
router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.get("/refreshToken", refreshToken);
router.get("/jobs", getAllJobs);

router.get("/test-read-cookie", (req, res) => {
  res.status(200).send("cookie read");
});

export default router;
