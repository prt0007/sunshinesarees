"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

const slides = [
  {
    id: 1,
    title: "Elevate Your Style with SunshineSaree",
    description:
      "Discover our curated collection of premium sarees designed for the modern woman. Elegance in every thread.",
    image: "/placeholder.svg?height=600&width=1200",
    buttonText: "Shop Now",
    buttonLink: "/shop",
  },
  {
    id: 2,
    title: "Handcrafted Elegance",
    description: "Each saree tells a story of tradition and craftsmanship. Find your perfect match for every occasion.",
    image: "/placeholder.svg?height=600&width=1200",
    buttonText: "Explore Collection",
    buttonLink: "/collections",
  },
  {
    id: 3,
    title: "Festive Season Sale",
    description: "Celebrate in style with our exclusive festive collection. Limited time offers on premium sarees.",
    image: "/placeholder.svg?height=600&width=1200",
    buttonText: "View Offers",
    buttonLink: "/sale",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-[500px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex flex-col justify-center h-full max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{slide.title}</h1>
            <p className="text-lg mb-8">{slide.description}</p>
            <div>
              <Link
                href={slide.buttonLink}
                className="inline-block bg-maroon-700 hover:bg-maroon-800 text-white font-medium py-3 px-6 rounded-md transition-colors border-2 border-gold-500"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 w-8 rounded-full transition-colors ${
              index === currentSlide ? "bg-gold-500" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

