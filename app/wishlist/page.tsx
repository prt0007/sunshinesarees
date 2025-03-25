"use client"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Heart, ShoppingBag } from "lucide-react"
import { useWishlist } from "@/contexts/wishlist-context"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      salePrice: item.salePrice,
      image: item.image,
    })
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const handleRemoveFromWishlist = (id: number, name: string) => {
    removeItem(id)
    toast({
      title: "Removed from Wishlist",
      description: `${name} has been removed from your wishlist.`,
    })
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <Heart className="h-16 w-16 mx-auto text-gray-400" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added any items to your wishlist yet.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="group relative border border-gray-200 rounded-lg overflow-hidden">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                {item.salePrice && (
                  <div className="absolute top-2 right-2 bg-maroon-700 text-white text-xs font-bold px-2 py-1 rounded">
                    SALE
                  </div>
                )}
              </div>
              <div className="p-4">
                <Link href={`/products/${item.id}`} className="block">
                  <h3 className="text-lg font-medium text-gray-900 hover:text-maroon-700 transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-center mt-2">
                  {item.salePrice ? (
                    <>
                      <span className="text-lg font-bold text-maroon-700">₹{item.salePrice.toLocaleString()}</span>
                      <span className="ml-2 text-sm text-gray-500 line-through">₹{item.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex mt-4 space-x-2">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-black"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                    variant="outline"
                    className="p-2 border-gray-300 text-gray-700 hover:text-red-600 hover:border-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => {
              clearWishlist()
              toast({
                title: "Wishlist Cleared",
                description: "All items have been removed from your wishlist.",
              })
            }}
            variant="outline"
            className="border-2 border-maroon-700 text-maroon-700 hover:bg-maroon-700 hover:text-white"
          >
            Clear Wishlist
          </Button>
        </div>
      </div>
    </div>
  )
}

