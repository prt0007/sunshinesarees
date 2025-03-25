"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ShoppingBag, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrderData {
  id: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  shippingAddress: {
    address: string
    city: string
    state: string
    pincode: string
  }
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    image: string
  }>
  amounts: {
    subtotal: number
    shipping: number
    tax: number
    total: number
  }
  payment: {
    method: string
    status: string
  }
  status: string
  createdAt: any
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOfflineOrder, setIsOfflineOrder] = useState(false)
  const { user } = useAuth()

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        router.push("/")
        return
      }

      try {
        // Check if this is an offline order ID
        if (orderId.startsWith("OFFLINE-")) {
          setIsOfflineOrder(true)
          // Try to get the order from localStorage
          const offlineOrders = JSON.parse(localStorage.getItem("offlineOrders") || "[]")
          const offlineOrder = offlineOrders.find((o: any) => o.id === orderId)

          if (offlineOrder) {
            setOrder({
              ...offlineOrder,
              createdAt: new Date(offlineOrder.createdAt),
            })
          } else {
            // If we can't find the offline order, create a fallback order
            createFallbackOrder()
          }
        } else {
          // Try to get the order from Firestore
          try {
            const orderDoc = await getDoc(doc(db, "orders", orderId))
            if (orderDoc.exists()) {
              setOrder({
                id: orderDoc.id,
                ...orderDoc.data(),
              } as OrderData)
            } else {
              // Check if it might be in localStorage as a backup
              const offlineOrders = JSON.parse(localStorage.getItem("offlineOrders") || "[]")
              const offlineOrder = offlineOrders.find((o: any) => o.id === orderId)

              if (offlineOrder) {
                setIsOfflineOrder(true)
                setOrder({
                  ...offlineOrder,
                  createdAt: new Date(offlineOrder.createdAt),
                })
              } else {
                createFallbackOrder()
              }
            }
          } catch (firestoreError) {
            console.error("Error fetching order from Firestore:", firestoreError)

            // Check localStorage as a fallback
            const offlineOrders = JSON.parse(localStorage.getItem("offlineOrders") || "[]")
            const offlineOrder = offlineOrders.find((o: any) => o.id === orderId)

            if (offlineOrder) {
              setIsOfflineOrder(true)
              setOrder({
                ...offlineOrder,
                createdAt: new Date(offlineOrder.createdAt),
              })
            } else {
              createFallbackOrder()
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        createFallbackOrder()
      } finally {
        setLoading(false)
      }
    }

    const createFallbackOrder = () => {
      // Create a fallback order with minimal information
      setOrder({
        id: orderId || "UNKNOWN",
        customer: {
          firstName: "Valued",
          lastName: "Customer",
          email: user?.email || "customer@example.com",
          phone: "1234567890",
        },
        shippingAddress: {
          address: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        items: [],
        amounts: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          total: 0,
        },
        payment: {
          method: "cashfree",
          status: "processing",
        },
        status: "pending",
        createdAt: new Date(),
      })
      setIsOfflineOrder(true)
    }

    fetchOrder()
  }, [orderId, router, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-maroon-700 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="bg-gradient-to-b from-pink-50 to-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gold-100">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
              Order Confirmed!
            </h1>
            <p className="mt-2 text-lg text-gray-600">Thank you for your purchase. Your order has been received.</p>

            {isOfflineOrder && (
              <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This order is currently stored locally on your device. Please save your order number for reference.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
              Order Details
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">
                  {order.createdAt?.toDate
                    ? order.createdAt.toDate().toLocaleDateString()
                    : order.createdAt instanceof Date
                      ? order.createdAt.toLocaleDateString()
                      : new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">{order.payment.method === "cashfree" ? "Cashfree" : "Cash on Delivery"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Shipping Method</p>
                <p className="font-medium">Standard Shipping</p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
              Shipping Information
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{order.customer.email}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  <br />
                  India
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
              Order Summary
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{order.amounts.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {order.amounts.shipping === 0 ? "Free" : `₹${order.amounts.shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">₹{order.amounts.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-base font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-maroon-700">₹{order.amounts.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-6">
              {isOfflineOrder
                ? "Your order information is saved locally. Please keep your order number for reference."
                : "We've sent a confirmation email to your email address with all the details of your order."}
              {user && !isOfflineOrder && " You can also track your order status in your account."}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/shop">
                <Button className="w-full sm:w-auto bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              {user && !isOfflineOrder && (
                <Link href="/account/orders">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-maroon-700 text-maroon-700 hover:bg-maroon-700 hover:text-white"
                  >
                    Track Order
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

