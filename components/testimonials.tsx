import Image from "next/image"
import { Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Fashion Blogger",
    content:
      "The quality of sarees from SunshineSaree is exceptional. The colors are vibrant and the fabric feels luxurious. I've received countless compliments whenever I wear them.",
    rating: 5,
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Ananya Patel",
    role: "Wedding Planner",
    content:
      "I recommend SunshineSaree to all my clients for their wedding shopping. The collection is diverse, and the customer service is outstanding. They truly understand what modern women want.",
    rating: 5,
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Meera Desai",
    role: "Corporate Professional",
    content:
      "As someone who wears sarees to work regularly, I appreciate the blend of tradition and contemporary designs that SunshineSaree offers. The cotton sarees are perfect for daily wear.",
    rating: 4,
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">What Our Customers Say</h2>
        <div className="section-divider"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-6 rounded-lg shadow-md border border-gold-200 hover:border-gold-300 transition-colors"
            >
              <div className="flex items-center mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-gold-500 fill-gold-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

