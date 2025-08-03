export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      NODE_ENV: string;
      ENV: "test" | "dev" | "prod";
      SUPABASE_URL: string;
      SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_KEY: string;
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
