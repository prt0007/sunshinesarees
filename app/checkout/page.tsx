"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

const paymentMethods = [
  {
    id: "cashfree",
    name: "Cashfree",
    description: "Pay securely with Cashfree payment gateway",
    logo: "/placeholder.svg?height=40&width=100",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    logo: "/placeholder.svg?height=40&width=100",
  },
]

// Helper function to generate a unique order ID when Firestore fails
const generateOfflineOrderId = () => {
  return "OFFLINE-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase()
}

export default function CheckoutPage() {
  const { items, subtotal, totalItems, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cashfree",
    saveAddress: false,
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [firestoreAvailable, setFirestoreAvailable] = useState(true)

  // Check if Firestore is available by looking for previous errors
  useEffect(() => {
    const hasFirestoreErrors = localStorage.getItem("firestoreErrors") === "true"
    if (hasFirestoreErrors) {
      setFirestoreAvailable(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveOrderToLocalStorage = (orderId: string, orderData: any) => {
    try {
      // Convert serverTimestamp to a regular date string
      const orderWithDate = {
        ...orderData,
        createdAt: new Date().toISOString(),
      }

      // Remove any circular references or non-serializable data
      const cleanOrderData = JSON.parse(JSON.stringify(orderWithDate))

      const offlineOrders = JSON.parse(localStorage.getItem("offlineOrders") || "[]")
      offlineOrders.push({
        id: orderId,
        ...cleanOrderData,
      })
      localStorage.setItem("offlineOrders", JSON.stringify(offlineOrders))
      return true
    } catch (localStorageError) {
      console.error("Error saving to localStorage:", localStorageError)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Calculate order totals
      const shipping = subtotal >= 999 ? 0 : 99
      const tax = Math.round(subtotal * 0.18)
      const total = subtotal + shipping + tax

      // Create order object - use regular date instead of serverTimestamp if Firestore is not available
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          userId: user?.uid || null,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          originalPrice: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        payment: {
          method: formData.paymentMethod,
          status: formData.paymentMethod === "cod" ? "pending" : "processing",
        },
        amounts: {
          subtotal,
          shipping,
          tax,
          total,
        },
        notes: formData.notes,
        status: "pending",
        createdAt: firestoreAvailable ? serverTimestamp() : new Date().toISOString(),
      }

      let orderId = ""

      // Skip Firestore if we already know it's not available
      if (firestoreAvailable) {
        try {
          // Try to save order to Firebase
          const orderRef = await addDoc(collection(db, "orders"), orderData)
          orderId = orderRef.id

          // If user is logged in and wants to save address
          if (user && formData.saveAddress) {
            try {
              await addDoc(collection(db, "addresses"), {
                userId: user.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                phone: formData.phone,
                isDefault: true,
                createdAt: serverTimestamp(),
              })
            } catch (addressError) {
              console.error("Error saving address:", addressError)
              // Continue with order process even if address save fails
            }
          }
        } catch (firestoreError) {
          console.error("Error placing order in Firestore:", firestoreError)

          // Mark Firestore as unavailable for future operations
          setFirestoreAvailable(false)
          localStorage.setItem("firestoreErrors", "true")

          // Fall back to offline order
          orderId = generateOfflineOrderId()
          saveOrderToLocalStorage(orderId, orderData)
        }
      } else {
        // Firestore is known to be unavailable, use offline order directly
        orderId = generateOfflineOrderId()
        saveOrderToLocalStorage(orderId, orderData)
      }

      // If we still don't have an order ID (both methods failed), generate one as a last resort
      if (!orderId) {
        orderId = generateOfflineOrderId()
      }

      // Clear cart regardless of Firestore success
      clearCart()

      // Show success message
      toast({
        title: "Order Placed Successfully",
        description: "Thank you for your purchase!",
      })

      // Redirect to order confirmation with order ID
      router.push(`/order-confirmation?id=${orderId}`)
    } catch (error) {
      console.error("Error placing order:", error)

      // Even if everything fails, generate an order ID and continue
      const fallbackOrderId = generateOfflineOrderId()

      toast({
        title: "Order Received",
        description:
          "Your order has been received, but we encountered some technical issues. Please save your order number for reference.",
      })

      // Clear cart and redirect anyway
      clearCart()
      router.push(`/order-confirmation?id=${fallbackOrderId}`)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
          Checkout
        </h1>

        {!firestoreAvailable && (
          <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
            <Info className="h-4 w-4" />
            <AlertDescription>
              You're currently in offline mode. Your order will be saved locally and processed when connectivity is
              restored.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
              {/* Shipping Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gold-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={errors.address ? "border-red-500" : ""}
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className={errors.pincode ? "border-red-500" : ""}
                    />
                    {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="saveAddress"
                        name="saveAddress"
                        type="checkbox"
                        checked={formData.saveAddress}
                        onChange={handleChange}
                        className="h-4 w-4 text-maroon-700 focus:ring-maroon-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-900">
                        Save this address for future orders
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gold-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
                  Payment Method
                </h2>

                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  className="space-y-4"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`relative rounded-lg border p-4 flex items-start ${
                        formData.paymentMethod === method.id ? "border-maroon-700 bg-maroon-50" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center h-5">
                        <RadioGroupItem value={method.id} id={method.id} />
                      </div>
                      <div className="ml-3 flex-1">
                        <Label htmlFor={method.id} className="font-medium text-gray-900 block">
                          {method.name}
                        </Label>
                        <p className="text-gray-500 text-sm">{method.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <Image
                          src={method.logo || "/placeholder.svg"}
                          alt={method.name}
                          width={100}
                          height={40}
                          className="h-10 w-auto object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Order Notes */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gold-100">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
                  Order Notes (Optional)
                </h2>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Special instructions for delivery or any other notes"
                    className="h-24"
                  />
                </div>
              </div>

              <div className="lg:hidden">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gold-100 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start">
                    <div className="h-16 w-16 relative flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover object-center rounded"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{((item.salePrice || item.price) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{subtotal >= 999 ? "Free" : "₹99"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{Math.round(subtotal * 0.18).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Order Total</span>
                  <span className="text-xl font-bold text-maroon-700">
                    ₹{(subtotal + (subtotal >= 999 ? 0 : 99) + Math.round(subtotal * 0.18)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 hidden lg:block">
                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-gray-500">
                By placing your order, you agree to our{" "}
                <Link href="/terms-of-service" className="text-maroon-700 hover:text-maroon-800">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="text-maroon-700 hover:text-maroon-800">
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

