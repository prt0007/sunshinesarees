"use client"

import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBPNwqwF7b9vD_0syEFsJ1st9ogJBEV0No",
  authDomain: "sunshinesaree-540e7.firebaseapp.com",
  projectId: "sunshinesaree-540e7",
  storageBucket: "sunshinesaree-540e7.firebasestorage.app",
  messagingSenderId: "445680221786",
  appId: "1:445680221786:web:87d805aa20baad10696263",
  measurementId: "G-LSBMWZ1G63",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Analytics conditionally (only in browser)
export const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported()
    if (analyticsSupported) {
      return getAnalytics(app)
    }
  }
  return null
}

export default app

