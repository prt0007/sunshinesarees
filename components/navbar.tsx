"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, User, Heart, ShoppingBag, Menu, X, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useRouter, usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import SareeLogo from "./saree-logo"
import Image from "next/image"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-maroon-900 via-maroon-800 to-maroon-900 border-b border-gold-300/20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gold-200 hover:text-gold-100 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center space-x-1">
            <Link
              href="/shop"
              className="px-3 py-2 text-sm font-medium text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/collections"
              className="px-3 py-2 text-sm font-medium text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/new-arrivals"
              className="px-3 py-2 text-sm font-medium text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors"
            >
              New Arrivals
            </Link>
            <Link
              href="/sale"
              className="px-3 py-2 text-sm font-medium text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors"
            >
              Sale
            </Link>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <SareeLogo className="h-8 w-8 text-gold-400" />
              <span className="ml-1 text-lg font-semibold text-white">SunshineSaree</span>
            </Link>
          </div>

          {/* Right navigation */}
          <div className="flex items-center space-x-1">
            {/* Search */}
            <div className="relative">
              <button
                className="p-2 text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg p-2 z-50">
                  <form onSubmit={handleSearch} className="flex">
                    <Input
                      type="text"
                      placeholder="Search for sarees..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-grow"
                      autoFocus
                    />
                    <button type="submit" className="ml-2 p-2 bg-maroon-700 text-white rounded-md">
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* User account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors">
                  {user && user.photoURL ? (
                    <div className="h-5 w-5 rounded-full overflow-hidden">
                      <Image
                        src={user.photoURL || "/placeholder.svg"}
                        alt={user.displayName || "User"}
                        width={20}
                        height={20}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuLabel>Hello, {user.displayName || user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account">My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 text-gold-200 hover:text-white hover:bg-maroon-700 rounded-md transition-colors relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gold-500 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="pt-2 pb-3 space-y-1 bg-maroon-800">
          <Link
            href="/shop"
            className="block px-3 py-2 text-base font-medium text-gold-200 hover:text-white hover:bg-maroon-700"
          >
            Shop
          </Link>
          <Link
            href="/collections"
            className="block px-3 py-2 text-base font-medium text-gold-200 hover:text-white hover:bg-maroon-700"
          >
            Collections
          </Link>
          <Link
            href="/new-arrivals"
            className="block px-3 py-2 text-base font-medium text-gold-200 hover:text-white hover:bg-maroon-700"
          >
            New Arrivals
          </Link>
          <Link
            href="/sale"
            className="block px-3 py-2 text-base font-medium text-gold-200 hover:text-white hover:bg-maroon-700"
          >
            Sale
          </Link>
        </div>
      </div>
    </nav>
  )
}

