import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import supabase from "./dbConfig";

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
const saveRefreshTokenToDb = async (parameter_id: string, parameter_refresh_token: string) => {
  try {
    const { error } = await supabase.rpc("update_refresh_token", { parameter_id, parameter_refresh_token });
    if (error) throw error;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getUserRoles = async () => {
  try {
    const { data } = await supabase.auth.getClaims();
    const roles: number[] = data?.claims?.app_metadata?.my_roles;
    return roles;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// authentication
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    if (error) {
      console.log("huh: ", error.message);
      res.status(403).send({ message: error.message });
      return;
    }
    if (!data.user) {
      res.status(403).send({ message: "No user found" });
      return;
    }
    const userCredentials = {
      userId: data.user.id,
      email: data.user.email,
      roles: await getUserRoles()
    };
    // using my own refresh token instead of supabase's because their never expires, different security logic
    const refreshToken = createRefreshToken(email);
    // send refreshToken back in a cookie
    await saveRefreshTokenToDb(data.user.id, refreshToken);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    res.status(201).json({ user: userCredentials, accessToken: data.session?.access_token });
  } catch (error) {
    res.status(500).send({ error });
  }
};

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    console.log("signup", data);
    // duplicate email or something went wrong
    if (error) {
      console.log(error);
    }
    if (!data.user) {
      res.status(403).send({ message: error?.message });
      return;
    }
    // a trigger to insert user_role is done on supabase after above
    const userCredentials = {
      userId: data?.user?.id,
      email: data?.user?.email,
      roles: [2] //manually assign role 1 in db
    };
    // using my own refresh token instead of supabase's because their never expires, different security logic
    const refreshToken = createRefreshToken(email);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    res.status(201).json({ user: userCredentials, accessToken: data.session?.access_token });
    saveRefreshTokenToDb(data.user.id, refreshToken);
  } catch (error) {
    res.status(500).send({ error });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const cookies = req.cookies;
    res.clearCookie("cookieCsrfToken", { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
    if (!cookies.refreshToken) {
      // no refreshToken for some reason - cookies deleted or got hacked?
      res.status(500).send({ message: "No user found" });
      return;
    }
    const refreshToken = cookies.refreshToken;
    const { error } = await supabase.rpc("if_refresh_token_exist_delete_it", { p_refresh_token: refreshToken });

    if (error) {
      res.status(500).send({ message: "No user found/db error" });
      console.log(error);
    } else {
      res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "none", maxAge: 1 * 60 * 60 * 1000 });
      res.sendStatus(204);
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
