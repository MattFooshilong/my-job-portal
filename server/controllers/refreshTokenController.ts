import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import supabase from "./dbConfig.js";
import { createClient } from "@supabase/supabase-js";

interface MyPayload extends JwtPayload {
  email: string;
}

const findUserWithRefreshToken = async (refreshToken: string) => {
  try {
    const { data: user_exists, error } = await supabase.rpc("get_user_id_with_refresh_token", { p_refresh_token: refreshToken });
    if (error) {
      console.log(error);
      return;
    } else {
      return user_exists as boolean;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
const getUserRoles = async (user_id: string) => {
  try {
    const supabaseAuthAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { data: rolesArr, error: getUserRolesErr } = await supabaseAuthAdmin.rpc("get_user_roles", { p_id: user_id });
    if (getUserRolesErr) {
      console.log(`couldnt get user roles`);
      return;
    } else {
      return rolesArr;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
//if refresh token is valid issue a new access token
const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const cookies = req.cookies;
  if (!cookies.refreshToken) {
    console.log(`couldnt find refresh token in cookies`);
    return res.sendStatus(401);
  }
  const refreshToken = cookies.refreshToken;
  //verify user with refresh token
  const user_exists = await findUserWithRefreshToken(refreshToken);
  if (!user_exists) {
    console.log(`couldnt find user with refresh token`);
    return res.sendStatus(404);
  }
  //get user id, email
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    console.log(`couldnt find current user`);
    return res.sendStatus(403);
  }
  const rolesArr = await getUserRoles(data.user.id);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
    const payload = decoded as MyPayload;
    if (err || payload.email !== data.user.email) {
      console.log(`refreshToken expired: ${err}`);
      return res.sendStatus(403);
    }
    const accessToken = jwt.sign(
      {
        email: data.user.email,
        roles: rolesArr
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h"
      }
    );
    const userCredentials = {
      userId: data.user.id,
      email: data.user.email,
      roles: rolesArr
    };
    return res.json({ user: userCredentials, accessToken });
  });
};
export { refreshToken };
