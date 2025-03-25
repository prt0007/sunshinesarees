"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
} from "firebase/auth"
import { auth, googleProvider, db } from "@/lib/firebase"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  authError: string | null
  isGoogleAuthAvailable: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
  authError: null,
  isGoogleAuthAvailable: true,
})

export const useAuth = () => useContext(AuthContext)

// List of domains where Google Auth is known to work
const AUTHORIZED_DOMAINS = [
  "localhost",
  "sunshinesaree.vercel.app",
  // Add other authorized domains here
]

// Local storage key for user data backup
const USER_DATA_KEY = "sunshinesaree_user_data"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(false)
  const [firestoreAvailable, setFirestoreAvailable] = useState(true)

  // Check if current domain is authorized for Google Auth
  useEffect(() => {
    const checkDomain = () => {
      if (typeof window !== "undefined") {
        const hostname = window.location.hostname
        const isAuthorized = AUTHORIZED_DOMAINS.includes(hostname)
        setIsGoogleAuthAvailable(isAuthorized)
      }
    }

    checkDomain()
  }, [])

  // Save user data to localStorage as a fallback
  const saveUserDataLocally = (userData: any) => {
    try {
      localStorage.setItem(
        USER_DATA_KEY,
        JSON.stringify({
          ...userData,
          lastUpdated: new Date().toISOString(),
        }),
      )
    } catch (error) {
      console.error("Error saving user data to localStorage:", error)
    }
  }

  // Update user profile in Firestore with fallback to localStorage
  const updateUserProfile = async (userId: string, userData: any) => {
    if (!firestoreAvailable) {
      saveUserDataLocally(userData)
      return
    }

    try {
      const userRef = doc(db, "users", userId)
      await setDoc(
        userRef,
        {
          ...userData,
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      console.error("Error updating user profile in Firestore:", error)
      setFirestoreAvailable(false)
      saveUserDataLocally(userData)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)

      // If user exists, update their profile
      if (user) {
        const userData = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }

        try {
          // First, try to get the user document to check if it exists
          if (firestoreAvailable) {
            try {
              const userRef = doc(db, "users", user.uid)
              const userSnap = await getDoc(userRef)

              // If user doesn't exist in Firestore, create a profile
              if (!userSnap.exists()) {
                await updateUserProfile(user.uid, {
                  ...userData,
                  createdAt: serverTimestamp(),
                })
              } else {
                // Just update the last login time
                await updateUserProfile(user.uid, {})
              }
            } catch (error) {
              console.error("Error checking user profile in Firestore:", error)
              setFirestoreAvailable(false)
              saveUserDataLocally(userData)
            }
          } else {
            saveUserDataLocally(userData)
          }
        } catch (error) {
          console.error("Error in auth state change handler:", error)
          // Continue even if operations fail
        }
      }
    })

    return () => unsubscribe()
  }, [firestoreAvailable])

  const signUp = async (email: string, password: string, displayName: string) => {
    setAuthError(null)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName })

      // Create user profile
      const userData = {
        displayName,
        email,
        photoURL: null,
        createdAt: serverTimestamp(),
      }

      await updateUserProfile(userCredential.user.uid, userData)
    } catch (error: any) {
      console.error("Error signing up:", error)

      // Set user-friendly error message
      if (error.code === "auth/email-already-in-use") {
        setAuthError("This email is already in use. Please try another email or sign in.")
      } else if (error.code === "auth/weak-password") {
        setAuthError("Password is too weak. Please use a stronger password.")
      } else {
        setAuthError(error.message || "Failed to sign up. Please try again.")
      }

      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Error signing in:", error)

      // Set user-friendly error message
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setAuthError("Invalid email or password. Please try again.")
      } else {
        setAuthError(error.message || "Failed to sign in. Please try again.")
      }

      throw error
    }
  }

  const signInWithGoogle = async () => {
    setAuthError(null)

    if (!isGoogleAuthAvailable) {
      const error = new Error("Google sign-in is not available in this environment.")
      setAuthError("Google sign-in is not available in this environment. Please use email/password sign-in instead.")
      throw error
    }

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      console.error("Error signing in with Google:", error)

      if (error.code === "auth/unauthorized-domain") {
        setIsGoogleAuthAvailable(false)
        setAuthError("Google sign-in is not available in this environment. Please use email/password sign-in instead.")
      } else {
        setAuthError(error.message || "Failed to sign in with Google. Please try again.")
      }

      throw error
    }
  }

  const logout = async () => {
    setAuthError(null)
    try {
      await signOut(auth)
    } catch (error: any) {
      console.error("Error signing out:", error)
      setAuthError(error.message || "Failed to sign out. Please try again.")
      throw error
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    authError,
    isGoogleAuthAvailable,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

