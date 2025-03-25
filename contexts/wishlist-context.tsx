"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

export interface WishlistItem {
  id: number
  name: string
  price: number
  salePrice: number | null
  image: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: number) => void
  isInWishlist: (id: number) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
})

export const useWishlist = () => useContext(WishlistContext)

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const { user } = useAuth()

  // Load wishlist from localStorage or Firestore when component mounts or user changes
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        // User is logged in, load wishlist from Firestore
        try {
          const wishlistDoc = await getDoc(doc(db, "wishlists", user.uid))
          if (wishlistDoc.exists()) {
            setItems(wishlistDoc.data().items || [])
          }
        } catch (error) {
          console.error("Error loading wishlist from Firestore:", error)
        }
      } else {
        // User is not logged in, load wishlist from localStorage
        const savedWishlist = localStorage.getItem("wishlist")
        if (savedWishlist) {
          try {
            setItems(JSON.parse(savedWishlist))
          } catch (error) {
            console.error("Error parsing wishlist from localStorage:", error)
          }
        }
      }
    }

    loadWishlist()
  }, [user])

  // Save wishlist to localStorage or Firestore when it changes
  useEffect(() => {
    const saveWishlist = async () => {
      if (user) {
        // User is logged in, save wishlist to Firestore
        try {
          await setDoc(doc(db, "wishlists", user.uid), { items }, { merge: true })
        } catch (error) {
          console.error("Error saving wishlist to Firestore:", error)
        }
      } else {
        // User is not logged in, save wishlist to localStorage
        localStorage.setItem("wishlist", JSON.stringify(items))
      }
    }

    saveWishlist()
  }, [items, user])

  const addItem = (item: WishlistItem) => {
    setItems((prevItems) => {
      if (prevItems.some((i) => i.id === item.id)) {
        return prevItems
      }
      return [...prevItems, item]
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const isInWishlist = (id: number) => {
    return items.some((item) => item.id === id)
  }

  const clearWishlist = () => {
    setItems([])
    if (user) {
      setDoc(doc(db, "wishlists", user.uid), { items: [] }, { merge: true })
    } else {
      localStorage.removeItem("wishlist")
    }
  }

  const value = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

