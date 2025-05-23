import { initializeApp } from "firebase/app"

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "eliza-a87cf.firebaseapp.com",
  projectId: "eliza-a87cf",
  storageBucket: "eliza-a87cf.appspot.com",
  messagingSenderId: "21692781869",
  appId: "1:21692781869:web:5be8ae7656100d945e6fa4",
}

export const firebaseApp = initializeApp(firebaseConfig)
