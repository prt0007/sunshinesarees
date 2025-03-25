"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Heart, ShoppingBag, ChevronRight, Star, Truck, RotateCcw, Shield } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useWishlist } from "@/contexts/wishlist-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import ProductReviewSimplified from "@/components/product-review-simplified"
import { db } from "@/lib/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

// This would normally come from a database or API
const products = [
  {
    id: 1,
    name: "Elegant Green Silk Saree with Gold Border",
    price: 1999,
    salePrice: 999,
    category: "silk",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OjkddjA1CXozKJgw2LLlH36P8jRvXb.png",
    onSale: true,
    description:
      "Elevate your traditional look with this stunning green silk saree, featuring a luxurious golden border that adds a royal touch. Crafted from premium silk fabric, this saree offers a smooth texture, elegant drape, and unmatched comfort. Perfect for weddings, festive occasions, and cultural events, this saree enhances your grace effortlessly. Pair it with gold jewelry and matching bangles for a timeless look.",
    features: [
      "Premium silk fabric",
      "Luxurious gold border",
      "Elegant drape",
      "Smooth texture",
      "Comfortable to wear",
    ],
    specifications: {
      material: "Silk",
      length: "5.5 meters",
      width: "1.1 meters",
      weight: "500g",
      care: "Dry clean only",
    },
    thumbnails: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OjkddjA1CXozKJgw2LLlH36P8jRvXb.png",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
  },
  {
    id: 2,
    name: "Kanjivaram Silk Saree",
    price: 1899,
    salePrice: 1299,
    category: "silk",
    image: "/placeholder.svg?height=400&width=300",
    onSale: true,
    description: "A beautiful Kanjivaram silk saree with intricate designs and vibrant colors.",
    features: [
      "Premium Kanjivaram silk",
      "Intricate designs",
      "Vibrant colors",
      "Traditional patterns",
      "Comfortable to wear",
    ],
    specifications: {
      material: "Kanjivaram Silk",
      length: "5.5 meters",
      width: "1.1 meters",
      weight: "550g",
      care: "Dry clean only",
    },
    thumbnails: [
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
      "/placeholder.svg?height=100&width=100",
    ],
  },
  // Add more products as needed
]

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addItem: addToCart } = useCart()
  const { addItem: addToWishlist, isInWishlist, removeItem: removeFromWishlist } = useWishlist()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { user } = useAuth()

  // Find the product by ID
  const product = products.find((p) => p.id === Number(id))

  // If product not found, redirect to 404
  useEffect(() => {
    if (!product) {
      router.push("/404")
    }
  }, [product, router])

  if (!product) {
    return null
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.image,
    })
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleAddToWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from Wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.image,
      })
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  const handleBuyNow = async () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice,
      image: product.image,
    })

    // If user is logged in, save this product view to Firebase
    if (user) {
      try {
        await setDoc(
          doc(db, "productViews", `${user.uid}_${product.id}`),
          {
            userId: user.uid,
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            viewedAt: serverTimestamp(),
            action: "buy_now_click",
          },
          { merge: true },
        )
      } catch (error) {
        console.error("Error saving product view:", error)
      }
    }

    router.push("/checkout")
  }

  return (
    <div className="bg-gradient-to-b from-pink-50 to-white">
      {/* Breadcrumbs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-maroon-700">
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/shop" className="hover:text-maroon-700">
              Shop
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href={`/collections/${product.category}`} className="hover:text-maroon-700">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)} Sarees
            </Link>
          </li>
          <li className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border border-gold-200 shadow-lg bg-white">
              <Image
                src={product.thumbnails[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-cover object-center"
              />
              {product.onSale && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-maroon-700 to-maroon-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                  SALE
                </div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.thumbnails.map((thumbnail, index) => (
                <button
                  key={index}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all transform hover:scale-105 ${
                    selectedImage === index
                      ? "border-maroon-700 shadow-md scale-105"
                      : "border-gray-200 hover:border-gold-300"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={thumbnail || "/placeholder.svg"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover object-center"
                  />
                  {selectedImage === index && <div className="absolute inset-0 bg-maroon-700 bg-opacity-10"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
                {product.name}
              </h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-5 w-5 ${rating <= 4 ? "text-gold-500 fill-gold-500" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">4.0 (24 reviews)</span>
              </div>
            </div>

            <div className="flex items-center">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-maroon-700">₹{product.salePrice.toLocaleString()}</span>
                  <span className="ml-3 text-lg text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                  <span className="ml-3 text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {Math.round(((product.price - product.salePrice) / product.price) * 100)}% off
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            <div className="border-t border-b border-gray-200 py-4">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mr-4">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    type="button"
                    className="px-3 py-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-0 focus:ring-0"
                  />
                  <button
                    type="button"
                    className="px-3 py-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleBuyNow}
                  className="flex-1 bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white"
                >
                  Buy Now
                </Button>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleAddToWishlist}
                  variant="outline"
                  className={`px-4 border-2 ${
                    isInWishlist(product.id)
                      ? "border-maroon-700 text-maroon-700 bg-maroon-50"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-maroon-700" : ""}`} />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-6">
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gold-100">
                <Truck className="h-8 w-8 text-maroon-700 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Free Shipping</h3>
                  <p className="text-xs text-gray-500">On orders over ₹999</p>
                </div>
              </div>
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gold-100">
                <RotateCcw className="h-8 w-8 text-maroon-700 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Easy Returns</h3>
                  <p className="text-xs text-gray-500">10-day return policy</p>
                </div>
              </div>
              <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border border-gold-100">
                <Shield className="h-8 w-8 text-maroon-700 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Secure Payments</h3>
                  <p className="text-xs text-gray-500">Trusted payment methods</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Features and Specifications */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gold-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
              Features
            </h2>
            <ul className="space-y-3">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-black">✓</span>
                  </span>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gold-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
              Specifications
            </h2>
            <div className="border rounded-lg overflow-hidden">
              {Object.entries(product.specifications).map(([key, value], index, arr) => (
                <div key={key} className={`flex ${index !== arr.length - 1 ? "border-b" : ""} border-gray-200`}>
                  <div className="w-1/3 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 capitalize">{key}</div>
                  <div className="w-2/3 px-4 py-3 text-sm text-gray-700">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviewSimplified productId={product.id} />
      </div>
    </div>
  )
}

