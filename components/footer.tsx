import Link from "next/link"
import { Sun, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-maroon-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center">
              <Sun className="h-6 w-6 text-gold-500" />
              <span className="ml-1 text-lg font-semibold text-white">SunshineSaree</span>
            </Link>
            <p className="mt-4 text-gray-400">
              Bringing elegance and tradition to the modern woman with our carefully curated collection of premium
              sarees.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-gold-500">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-500">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-500">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-500">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-gold-500">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/collections" className="text-gray-400 hover:text-gold-500">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="text-gray-400 hover:text-gold-500">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/sale" className="text-gray-400 hover:text-gold-500">
                  Sale
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-gold-500">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-500">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-gold-500">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-gold-500">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-gold-500">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-400 hover:text-gold-500">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/care-instructions" className="text-gray-400 hover:text-gold-500">
                  Care Instructions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gold-500">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">123 Fashion Street, Mumbai, Maharashtra 400001, India</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-gold-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">info@sunshinesaree.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-maroon-900 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} SunshineSaree. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-gray-400 hover:text-gold-500 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-gray-400 hover:text-gold-500 text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

