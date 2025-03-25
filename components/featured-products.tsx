"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

const categories = [
  { id: "all", name: "All Sarees" },
  { id: "silk", name: "Silk Sarees" },
  { id: "cotton", name: "Cotton Sarees" },
  { id: "designer", name: "Designer Sarees" },
]

const products = [
  {
    id: 1,
    name: "Elegant Green Silk Saree with Gold Border",
    price: 1999,
    salePrice: 999,
    category: "silk",
    image: "/images/green-silk-saree.png",
    onSale: true,
    description:
      "Elevate your traditional look with this stunning green silk saree, featuring a luxurious golden border that adds a royal touch. Crafted from premium silk fabric, this saree offers a smooth texture, elegant drape, and unmatched comfort.",
  },
  {
    id: 2,
    name: "Kanjivaram Silk Saree",
    price: 1899,
    salePrice: 1299,
    category: "silk",
    image: "/placeholder.svg?height=400&width=300",
    onSale: true,
  },
  {
    id: 3,
    name: "Handloom Cotton Saree",
    price: 1499,
    salePrice: 999,
    category: "cotton",
    image: "/placeholder.svg?height=400&width=300",
    onSale: true,
  },
  {
    id: 4,
    name: "Designer Embroidered Saree",
    price: 1899,
    salePrice: null,
    category: "designer",
    image: "/placeholder.svg?height=400&width=300",
    onSale: false,
  },
  {
    id: 5,
    name: "Linen Handwoven Saree",
    price: 1699,
    salePrice: null,
    category: "cotton",
    image: "/placeholder.svg?height=400&width=300",
    onSale: false,
  },
  {
    id: 6,
    name: "Patola Silk Saree",
    price: 2099,
    salePrice: 1899,
    category: "silk",
    image: "/placeholder.svg?height=400&width=300",
    onSale: true,
  },
]

export default function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState("all")
  const { addItem: addToWishlist, isInWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { toast } = useToast()

  const filteredProducts =
    activeCategory === "all" ? products : products.filter((product) => product.category === activeCategory)

  const handleAddToWishlist = (product: any) => {
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

  const handleAddToCart = (product: any) => {
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

  return (
    <section className="py-16 bg-gradient-to-r from-pink-50 via-white to-gold-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title bg-gradient-to-r from-maroon-800 to-maroon-700 bg-clip-text text-transparent">
          Featured Sarees
        </h2>
        <div className="section-divider"></div>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Discover our most popular sarees, carefully selected to enhance your beauty and elegance. Each piece is a
          celebration of tradition with a modern touch.
        </p>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-maroon-700 to-maroon-800 text-white shadow-md"
                  : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative transform transition-all duration-300 hover:scale-105">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-md border border-gold-100">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                {product.onSale && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-maroon-700 to-maroon-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    SALE
                  </div>
                )}
                <button
                  className={`absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md ${
                    isInWishlist(product.id) ? "text-maroon-700" : "text-gray-700 hover:text-maroon-700"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToWishlist(product)
                  }}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-maroon-700" : ""}`} />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                  <button
                    className="w-full py-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black font-medium rounded shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddToCart(product)
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 hover:text-maroon-700 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center mt-1">
                  {product.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-maroon-700">₹{product.salePrice.toLocaleString()}</span>
                      <span className="ml-2 text-sm text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                      <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        {Math.round(((product.price - product.salePrice) / product.price) * 100)}% off
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
              <Link href={`/products/${product.id}`} className="absolute inset-0" aria-label={`View ${product.name}`}>
                <span className="sr-only">View details</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-block border-2 border-maroon-700 text-maroon-700 hover:bg-gradient-to-r hover:from-maroon-700 hover:to-maroon-800 hover:text-white font-medium px-6 py-3 rounded-md transition-colors shadow-md"
          >
            View All Sarees
          </Link>
        </div>
      </div>
    </section>
  )
}

