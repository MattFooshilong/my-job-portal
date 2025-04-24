import { Request } from "express"
export interface ExtendedRequest extends Request {
  csrfToken: string // or any other type
}
