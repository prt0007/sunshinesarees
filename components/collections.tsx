import Link from "next/link"
import Image from "next/image"

const collections = [
  {
    id: 1,
    name: "Wedding Collection",
    description: "Exquisite sarees for your special day",
    image: "/placeholder.svg?height=600&width=400",
    link: "/collections/wedding",
  },
  {
    id: 2,
    name: "Festive Collection",
    description: "Celebrate every occasion with elegance",
    image: "/placeholder.svg?height=600&width=400",
    link: "/collections/festive",
  },
  {
    id: 3,
    name: "Everyday Elegance",
    description: "Comfortable yet stylish sarees for daily wear",
    image: "/placeholder.svg?height=600&width=400",
    link: "/collections/everyday",
  },
]

export default function Collections() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">Our Collections</h2>
        <div className="section-divider"></div>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Explore our thoughtfully curated collections designed for every occasion. From weddings to everyday wear, find
          the perfect saree that speaks to you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div key={collection.id} className="group relative overflow-hidden rounded-lg">
              <div className="relative h-96 w-full">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{collection.name}</h3>
                  <p className="text-sm text-white/80 mb-4">{collection.description}</p>
                  <Link
                    href={collection.link}
                    className="inline-block bg-gold-500 text-black hover:bg-gold-600 font-medium px-4 py-2 rounded-md transition-colors"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

