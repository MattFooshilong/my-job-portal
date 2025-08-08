declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      NODE_ENV: string;
      ENV: "test" | "dev" | "prod";
    }
  }
  namespace Express {
    interface Request {
      csrfToken?: string;
      email?: string;
      roles?: number[];
    }
  }
}
