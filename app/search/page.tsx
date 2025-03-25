"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Sample products data (same as in collections page)
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
      "Elevate your traditional look with this stunning green silk saree, featuring a luxurious golden border that adds a royal touch.",
    tags: ["silk", "wedding", "festive"],
    colors: ["green", "gold"],
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
    tags: ["silk", "wedding", "traditional"],
    colors: ["red", "gold"],
  },
  {
    id: 3,
    name: "Handloom Cotton Saree",
    price: 1499,
    salePrice: 999,
    category: "cotton",
    image: "/placeholder.svg?height=400&width=300",
    onSale: true,
    description: "Comfortable and elegant handloom cotton saree for daily wear.",
    tags: ["cotton", "casual", "daily"],
    colors: ["blue", "white"],
  },
  {
    id: 4,
    name: "Designer Embroidered Saree",
    price: 1899,
    salePrice: null,
    category: "designer",
    image: "/placeholder.svg?height=400&width=300",
    onSale: false,
    description: "Exquisite designer saree with intricate embroidery work.",
    tags: ["designer", "party", "festive"],
    colors: ["purple", "silver"],
  },
  {
    id: 5,
    name: "Linen Handwoven Saree",
    price: 1699,
    salePrice: null,
    category: "cotton",
    image: "/placeholder.svg?height=400&width=300",
    onSale: false,
    description: "Lightweight and breathable linen saree for a comfortable yet elegant look.",
    tags: ["linen", "casual", "summer"],
    colors: ["beige", "brown"],
  },
  {
    id: 6,
    name: "Patola Silk Saree",
    price: 2099,
    salePrice: 1899,
    category: "silk",
    image: "/placeholder.svg?height=400&width=300",
    onSale: true,
    description: "Traditional Patola silk saree with geometric patterns.",
    tags: ["silk", "traditional", "festive"],
    colors: ["maroon", "gold"],
  },
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(queryParam)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const { addItem: addToWishlist, isInWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    setSearchQuery(queryParam)
    performSearch(queryParam)
  }, [queryParam])

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    const lowerCaseQuery = query.toLowerCase()
    const results = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        product.description.toLowerCase().includes(lowerCaseQuery) ||
        product.category.toLowerCase().includes(lowerCaseQuery) ||
        product.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) ||
        product.colors.some((color) => color.toLowerCase().includes(lowerCaseQuery)),
    )

    setSearchResults(results)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Update URL with search query
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchQuery)
    window.history.pushState({}, "", url.toString())
    performSearch(searchQuery)
  }

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
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="flex max-w-md">
            <Input
              type="text"
              placeholder="Search for sarees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" className="ml-2 bg-maroon-700 hover:bg-maroon-800 text-white">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {searchQuery && (
          <p className="text-gray-600 mb-6">
            {searchResults.length === 0
              ? `No results found for "${searchQuery}"`
              : `Showing ${searchResults.length} results for "${searchQuery}"`}
          </p>
        )}

        {searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((product) => (
              <div key={product.id} className="group relative">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.onSale && (
                    <div className="absolute top-2 right-2 bg-maroon-700 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                  <button
                    className={`absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors ${
                      isInWishlist(product.id) ? "text-maroon-700" : "text-gray-700 hover:text-maroon-700"
                    }`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleAddToWishlist(product)
                    }}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? "fill-maroon-700" : ""}`} />
                  </button>
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white p-4 translate-y-full group-hover:translate-y-0 transition-transform">
                    <button
                      className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-black font-medium rounded"
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
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <div className="flex items-center mt-1">
                    {product.salePrice ? (
                      <>
                        <span className="text-lg font-bold text-maroon-700">₹{product.salePrice.toLocaleString()}</span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          ₹{product.price.toLocaleString()}
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
        ) : searchQuery ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">No results found</h2>
            <p className="mt-2 text-gray-500">
              We couldn't find any products matching your search. Try using different keywords or browse our
              collections.
            </p>
            <Link href="/collections">
              <Button className="mt-6 bg-maroon-700 hover:bg-maroon-800 text-white">Browse Collections</Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="h-16 w-16 mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Search for products</h2>
            <p className="mt-2 text-gray-500">Enter keywords to find the perfect saree for your occasion.</p>
          </div>
        )}
      </div>
    </div>
  )
}

