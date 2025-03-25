"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems } = useCart()
  const [couponCode, setCouponCode] = useState("")
  const [couponError, setCouponError] = useState("")
  const router = useRouter()

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }
    // In a real app, you would validate the coupon code with an API
    setCouponError("Invalid coupon code")
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/shop">
            <Button className="mt-6 bg-maroon-700 hover:bg-maroon-800 text-white">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 relative flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover object-center rounded"
                            />
                          </div>
                          <div className="ml-4">
                            <Link
                              href={`/products/${item.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-maroon-700"
                            >
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.salePrice ? (
                            <>
                              <span className="font-medium text-maroon-700">₹{item.salePrice.toLocaleString()}</span>
                              <span className="ml-2 text-xs text-gray-500 line-through">
                                ₹{item.price.toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <span className="font-medium">₹{item.price.toLocaleString()}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center border border-gray-300 rounded-md w-24">
                          <button
                            type="button"
                            className="px-3 py-1 text-gray-500 hover:text-gray-700"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Math.max(1, Number.parseInt(e.target.value) || 1))}
                            className="w-12 text-center border-0 focus:ring-0"
                          />
                          <button
                            type="button"
                            className="px-3 py-1 text-gray-500 hover:text-gray-700"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{((item.salePrice || item.price) * item.quantity).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between">
              <Link href="/shop">
                <Button
                  variant="outline"
                  className="border-2 border-maroon-700 text-maroon-700 hover:bg-maroon-700 hover:text-white"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
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

                <form onSubmit={handleApplyCoupon} className="pt-4 border-t border-gray-200">
                  <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                    Apply Coupon Code
                  </label>
                  <div className="flex">
                    <Input
                      type="text"
                      id="coupon"
                      name="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="rounded-r-none"
                    />
                    <Button type="submit" className="rounded-l-none bg-maroon-700 hover:bg-maroon-800 text-white">
                      Apply
                    </Button>
                  </div>
                  {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
                </form>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900">Order Total</span>
                    <span className="text-xl font-bold text-maroon-700">
                      ₹{(subtotal + (subtotal >= 999 ? 0 : 99) + Math.round(subtotal * 0.18)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <Button onClick={handleCheckout} className="w-full bg-maroon-700 hover:bg-maroon-800 text-white">
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

