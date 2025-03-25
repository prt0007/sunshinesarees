"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc } from "firebase/firestore"

export interface CartItem {
  id: number
  name: string
  price: number
  salePrice: number | null
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const { user } = useAuth()

  // Load cart from localStorage or Firestore when component mounts or user changes
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // User is logged in, load cart from Firestore
        try {
          const cartDoc = await getDoc(doc(db, "carts", user.uid))
          if (cartDoc.exists()) {
            setItems(cartDoc.data().items || [])
          }
        } catch (error) {
          console.error("Error loading cart from Firestore:", error)
        }
      } else {
        // User is not logged in, load cart from localStorage
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          try {
            setItems(JSON.parse(savedCart))
          } catch (error) {
            console.error("Error parsing cart from localStorage:", error)
          }
        }
      }
    }

    loadCart()
  }, [user])

  // Save cart to localStorage or Firestore when it changes
  useEffect(() => {
    const saveCart = async () => {
      if (user) {
        // User is logged in, save cart to Firestore
        try {
          await setDoc(doc(db, "carts", user.uid), { items }, { merge: true })
        } catch (error) {
          console.error("Error saving cart to Firestore:", error)
        }
      } else {
        // User is not logged in, save cart to localStorage
        localStorage.setItem("cart", JSON.stringify(items))
      }
    }

    if (items.length > 0) {
      saveCart()
    }
  }, [items, user])

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prevItems, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setItems([])
    if (user) {
      setDoc(doc(db, "carts", user.uid), { items: [] }, { merge: true })
    } else {
      localStorage.removeItem("cart")
    }
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const subtotal = items.reduce((total, item) => {
    const price = item.salePrice || item.price
    return total + price * item.quantity
  }, 0)

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

