import { firebaseApp } from "../firebaseServerInit/firebaseInit";
import { getDocs, setDoc, getFirestore, query, collection, getCountFromServer, where, doc, updateDoc } from "firebase/firestore";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
const db = getFirestore(firebaseApp);

type Credentials = {
  userId: string;
  email: string;
  password?: string;
  roles: number[];
};

//const maxAgeInSeconds = 3 * 24 * 60 * 60 //3 days

const countUsers = async () => {
  const userCollection = collection(db, "users");
  const result = await getCountFromServer(userCollection);
  return result.data().count;
};

//functions
const getUserCredentials = async (email: string) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    const credentials: Credentials = {
      userId: "",
      email: "",
      password: "",
      roles: []
    };
    snapshot.forEach((doc: { data: () => any; id: string }) => {
      const data = doc.data();
      credentials.userId = doc?.id;
      credentials.email = data?.email;
      credentials.password = data?.password;
      credentials.roles = data?.roles;
    });
    return credentials;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const addUser = async (email: string, hashedPassword: string) => {
  try {
    const usersCount = await countUsers();
    await setDoc(doc(db, "users", `user${usersCount}`), {
      email: email,
      password: hashedPassword,
      roles: [2], //manually add admin for now
      publicProfilePref: {
        age: true,
        dob: true,
        jobTitle: true,
        company: true,
        companyLogo: true,
        jobDescription: true,
        startDate: true,
        endDate: true
      },
      appliedJobs: []
    });
    return {
      email,
      roles: [2],
      userId: `user${usersCount}`
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const createAccessToken = (email: string, roles: number[]) => {
  return jwt.sign(
    {
      roles: roles,
      email: email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1d"
    }
  );
};
const createRefreshToken = (email: string) => {
  return jwt.sign(
    {
      email: email
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "2d"
    }
  );
};
const saveRefreshTokenToDb = async (email: string, token: string) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    let userId = "";
    snapshot.forEach((doc: { id: string }) => {
      userId = doc.id;
    });
    await updateDoc(doc(db, "users", userId), { refreshToken: token });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// authentication
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const userCredentials = await getUserCredentials(email);
    if (email !== userCredentials.email) {
      res.status(403).send({ message: "Wrong email" });
      return;
    }
    if (!userCredentials.password) {
      res.status(403).send({ message: "Unable to retrieve password" });
      return;
    }
    const passwordMatched = await bcrypt.compare(password, userCredentials.password);
    if (!passwordMatched) {
      res.status(403).send({ message: "Wrong password" });
      return;
    }
    const accessToken = createAccessToken(email, [2]);
    const refreshToken = createRefreshToken(email);
    // saving refreshToken with current user
    // send refreshToken back in a cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    delete userCredentials.password;
    res.status(201).json({ user: userCredentials, accessToken });
    saveRefreshTokenToDb(email, refreshToken);
  } catch (error) {
    return res.status(500).send({ error });
  }
};

export const signUp = async (req: Request, res: Response): Promise<any> => {
  try {
    const email = req.body.email;
    const userCredentials = await getUserCredentials(email);
    //check duplicate email
    if (userCredentials.email) {
      delete userCredentials.password;
      return res.status(403).send({ message: "Email is already in use" });
    }
    let password = req.body.password;
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    password = await bcrypt.hash(password, salt);
    const user = await addUser(email, password);
    //log in and give refresh and access token
    const accessToken = createAccessToken(email, [2]);
    const refreshToken = createRefreshToken(email);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    res.status(201).json({ user, accessToken });
    saveRefreshTokenToDb(email, refreshToken);
  } catch (error) {
    return res.status(500).send({ error });
  }
};
const findUserWithRefreshToken = async (refreshToken: string) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("refreshToken", "==", refreshToken));
    const snapshot = await getDocs(q);
    const user = {
      userId: "",
      email: "",
      roles: []
    };
    snapshot.forEach((doc: { data: () => any; id: string }) => {
      const data = doc.data();
      user.userId = doc?.id;
      user.email = data.email;
      user.roles = data.roles;
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const cookies = req.cookies;
    res.clearCookie("cookieCsrfToken", { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    if (!cookies.refreshToken) return res.sendStatus(204);
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    res.sendStatus(204);
    const refreshToken = cookies.refreshToken;
    //is refreshToken in db?
    const foundUser = await findUserWithRefreshToken(refreshToken);
    //if no user/empty object
    if (Object.keys(foundUser).length !== 0) {
      //delete refreshtoken in db
      saveRefreshTokenToDb(foundUser.email, "");
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
