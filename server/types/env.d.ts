export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_TOKEN_SECRET: string
      REFRESH_TOKEN_SECRET: string
      NODE_ENV: string
      ENV: "test" | "dev" | "prod"
    }
  }
}
declare module "express-serve-static-core" {
  interface Request {
    csrfToken?: string
  }
}
