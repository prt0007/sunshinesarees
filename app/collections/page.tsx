"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Filter } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

// Sample products data
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

// Filter options
const categories = [
  { id: "silk", name: "Silk Sarees" },
  { id: "cotton", name: "Cotton Sarees" },
  { id: "designer", name: "Designer Sarees" },
]

const occasions = [
  { id: "wedding", name: "Wedding" },
  { id: "festive", name: "Festive" },
  { id: "casual", name: "Casual" },
  { id: "party", name: "Party" },
  { id: "traditional", name: "Traditional" },
  { id: "daily", name: "Daily Wear" },
]

const colors = [
  { id: "red", name: "Red" },
  { id: "green", name: "Green" },
  { id: "blue", name: "Blue" },
  { id: "purple", name: "Purple" },
  { id: "maroon", name: "Maroon" },
  { id: "gold", name: "Gold" },
  { id: "silver", name: "Silver" },
  { id: "white", name: "White" },
  { id: "beige", name: "Beige" },
  { id: "brown", name: "Brown" },
]

export default function CollectionsPage() {
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    occasions: [] as string[],
    colors: [] as string[],
    priceRange: [700, 2100] as [number, number],
    onSale: false,
  })
  const [sortOption, setSortOption] = useState("featured")
  const [showFilters, setShowFilters] = useState(false)
  const { addItem: addToWishlist, isInWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { toast } = useToast()

  // Filter products based on active filters
  const filteredProducts = products.filter((product) => {
    // Filter by category
    if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(product.category)) {
      return false
    }

    // Filter by occasion/tags
    if (activeFilters.occasions.length > 0 && !product.tags.some((tag) => activeFilters.occasions.includes(tag))) {
      return false
    }

    // Filter by color
    if (activeFilters.colors.length > 0 && !product.colors.some((color) => activeFilters.colors.includes(color))) {
      return false
    }

    // Filter by price range
    const price = product.salePrice || product.price
    if (price < activeFilters.priceRange[0] || price > activeFilters.priceRange[1]) {
      return false
    }

    // Filter by sale status
    if (activeFilters.onSale && !product.onSale) {
      return false
    }

    return true
  })

  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.salePrice || a.price
    const priceB = b.salePrice || b.price

    switch (sortOption) {
      case "price-low-high":
        return priceA - priceB
      case "price-high-low":
        return priceB - priceA
      case "newest":
        return b.id - a.id // Assuming newer products have higher IDs
      default:
        return 0 // Featured - no specific sorting
    }
  })

  const handleFilterChange = (
    filterType: "categories" | "occasions" | "colors" | "priceRange" | "onSale",
    value: any,
  ) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const toggleFilter = (filterType: "categories" | "occasions" | "colors", itemId: string) => {
    setActiveFilters((prev) => {
      const currentFilters = prev[filterType]
      return {
        ...prev,
        [filterType]: currentFilters.includes(itemId)
          ? currentFilters.filter((id) => id !== itemId)
          : [...currentFilters, itemId],
      }
    })
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
            <p className="mt-1 text-gray-500">Discover our exquisite collection of sarees for every occasion</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <Button variant="outline" className="mr-4 md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low-high">Price: Low to High</SelectItem>
                <SelectItem value="price-high-low">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="categories">
                  <AccordionTrigger>Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={activeFilters.categories.includes(category.id)}
                            onCheckedChange={() => toggleFilter("categories", category.id)}
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="occasions">
                  <AccordionTrigger>Occasions</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {occasions.map((occasion) => (
                        <div key={occasion.id} className="flex items-center">
                          <Checkbox
                            id={`occasion-${occasion.id}`}
                            checked={activeFilters.occasions.includes(occasion.id)}
                            onCheckedChange={() => toggleFilter("occasions", occasion.id)}
                          />
                          <Label
                            htmlFor={`occasion-${occasion.id}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {occasion.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="colors">
                  <AccordionTrigger>Colors</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {colors.map((color) => (
                        <div key={color.id} className="flex items-center">
                          <Checkbox
                            id={`color-${color.id}`}
                            checked={activeFilters.colors.includes(color.id)}
                            onCheckedChange={() => toggleFilter("colors", color.id)}
                          />
                          <Label
                            htmlFor={`color-${color.id}`}
                            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {color.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                  <AccordionTrigger>Price Range</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[700, 2100]}
                        min={700}
                        max={2100}
                        step={100}
                        value={activeFilters.priceRange}
                        onValueChange={(value) => handleFilterChange("priceRange", value)}
                      />
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">₹{activeFilters.priceRange[0]}</span>
                        <span className="text-sm text-gray-500">₹{activeFilters.priceRange[1]}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <Checkbox
                    id="on-sale"
                    checked={activeFilters.onSale}
                    onCheckedChange={(checked) => handleFilterChange("onSale", checked)}
                  />
                  <Label
                    htmlFor="on-sale"
                    className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    On Sale
                  </Label>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-maroon-700 hover:bg-maroon-800 text-white"
                onClick={() =>
                  setActiveFilters({
                    categories: [],
                    occasions: [],
                    colors: [],
                    priceRange: [700, 2100],
                    onSale: false,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Filters - Mobile */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    ✕
                  </Button>
                </div>

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <div key={category.id} className="flex items-center">
                            <Checkbox
                              id={`mobile-category-${category.id}`}
                              checked={activeFilters.categories.includes(category.id)}
                              onCheckedChange={() => toggleFilter("categories", category.id)}
                            />
                            <Label
                              htmlFor={`mobile-category-${category.id}`}
                              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="occasions">
                    <AccordionTrigger>Occasions</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {occasions.map((occasion) => (
                          <div key={occasion.id} className="flex items-center">
                            <Checkbox
                              id={`mobile-occasion-${occasion.id}`}
                              checked={activeFilters.occasions.includes(occasion.id)}
                              onCheckedChange={() => toggleFilter("occasions", occasion.id)}
                            />
                            <Label
                              htmlFor={`mobile-occasion-${occasion.id}`}
                              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {occasion.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="colors">
                    <AccordionTrigger>Colors</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {colors.map((color) => (
                          <div key={color.id} className="flex items-center">
                            <Checkbox
                              id={`mobile-color-${color.id}`}
                              checked={activeFilters.colors.includes(color.id)}
                              onCheckedChange={() => toggleFilter("colors", color.id)}
                            />
                            <Label
                              htmlFor={`mobile-color-${color.id}`}
                              className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {color.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Slider
                          defaultValue={[700, 2100]}
                          min={700}
                          max={2100}
                          step={100}
                          value={activeFilters.priceRange}
                          onValueChange={(value) => handleFilterChange("priceRange", value)}
                        />
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">₹{activeFilters.priceRange[0]}</span>
                          <span className="text-sm text-gray-500">₹{activeFilters.priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <Checkbox
                      id="mobile-on-sale"
                      checked={activeFilters.onSale}
                      onCheckedChange={(checked) => handleFilterChange("onSale", checked)}
                    />
                    <Label
                      htmlFor="mobile-on-sale"
                      className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      On Sale
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      setActiveFilters({
                        categories: [],
                        occasions: [],
                        colors: [],
                        priceRange: [700, 2100],
                        onSale: false,
                      })
                    }
                  >
                    Clear All
                  </Button>
                  <Button
                    className="flex-1 bg-maroon-700 hover:bg-maroon-800 text-white"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {sortedProducts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
                <Button
                  className="mt-4 bg-maroon-700 hover:bg-maroon-800 text-white"
                  onClick={() =>
                    setActiveFilters({
                      categories: [],
                      occasions: [],
                      colors: [],
                      priceRange: [700, 2100],
                      onSale: false,
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
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
                            <span className="text-lg font-bold text-maroon-700">
                              ₹{product.salePrice.toLocaleString()}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ₹{product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/products/${product.id}`}
                      className="absolute inset-0"
                      aria-label={`View ${product.name}`}
                    >
                      <span className="sr-only">View details</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

