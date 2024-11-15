import axios from 'axios'
const BASE_URL = 'https://my-job-portal-server.vercel.app'

export default axios.create({
  baseURL: BASE_URL,
})
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, //To enable HTTP cookies over CORS
})
export const axiosForImages = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  withCredentials: true, //To enable HTTP cookies over CORS
})
