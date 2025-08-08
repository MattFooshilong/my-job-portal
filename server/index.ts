//Why write .js on imports, tsconfig nodenext
//To match Node’s real behavior, TypeScript ESM imports must end with .js (even though the source file is .ts).
//TypeScript will keep the .js in your import, but during compilation it maps it to your .ts file.
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import routes from "./api/routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { verifyAccessToken } from "./middleware/verifyAccessToken.js";
import { getJobApplications, updateProfileSettings, updateUserPublicProfile, updateUserApplyToJobs, getJobApplicationsAndCompanyInfo, getMyProfile, getPublicProfile } from "./controllers/userController.js";
import { generateCSRFToken, validateCSRFToken } from "./controllers/csrfController.js";
import { getJobsWhereThereIsApplication, updateJob } from "./controllers/jobsController.js";
import cookieParser from "cookie-parser";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

// Globals
const app = express();
app.use(cookieParser());
const port = 3001;
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
//CSP
//app.use(function (req, res, next) {
//  res.setHeader("Content-Security-Policy-Report-Only", "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'")
//  next()
//})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req: Request, res: Response) => {
  res.send("Server up");
});
const upload = multer({ storage: multer.memoryStorage() });
const allowedOrigins = ["http://localhost:3000", "https://my-job-portal-client.vercel.app"];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      //console.log("!origin: ", origin)
      return callback(new Error("CORS: Origin is undefined"));
    }
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV == "staging") {
      //console.log("origin: ", origin)
      return callback(null, true);
    }
    //console.log("last block origin: ", origin)
    return callback(new Error(`origin: ${origin}`));
  },
  optionsSuccessStatus: 200,
  credentials: true //To enable HTTP cookies over CORS
};

const corsAllowAll = {
  optionsSuccessStatus: 200,
  credentials: true
};
app.options("*", cors(corsOptions)); // Handles preflight requests

app.use(cors(corsOptions));

//public routes
app.use("/public/", routes);
//protected routes
app.use(verifyAccessToken);
app.post("/get-job-applications", getJobApplications);
app.post("/my-profile", getMyProfile);
app.post("/public-profile-pref", getPublicProfile);
app.post("/apply-job", updateUserApplyToJobs);
app.get("/antiCSRF", generateCSRFToken, (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken });
});
app.post(
  "/updateProfileSettings",
  upload.fields([
    { name: "avatar_file", maxCount: 1 },
    { name: "company_logo_file", maxCount: 1 }
  ]),
  validateCSRFToken,
  updateProfileSettings
);
app.post("/user-public-pref", updateUserPublicProfile);
app.post("/job-applications-and-company-info", getJobApplicationsAndCompanyInfo);
app.get("/get-jobs-where-there-is-application", getJobsWhereThereIsApplication);
app.get("/check-logged-in", getJobsWhereThereIsApplication);
app.post("/update-job/:user_jobs_id", updateJob);

app.use(express.static(path.join(__dirname, "./client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"), (err) => {
    if (err) res.status(500).send("error");
  });
});

app.listen(process.env.PORT || port, () => console.log(`Server listening on port ${port}!`));
// This overrides the default error handler, and must be called last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message);
  res.status(403).send(err.message);
});

export default app;
