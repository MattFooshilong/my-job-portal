import express from "express"

declare global {
  namespace Express {
    interface Request {
      csrfToken?: string
      email?: string
      roles?: number[]
    }
  }
}
