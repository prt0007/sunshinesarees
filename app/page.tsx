import Hero from "@/components/hero"
import FeaturedProducts from "@/components/featured-products"
import Collections from "@/components/collections"
import Testimonials from "@/components/testimonials"

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-pink-50 via-white to-gold-50">
      <Hero />
      <FeaturedProducts />
      <Collections />
      <Testimonials />
    </div>
  )
}

