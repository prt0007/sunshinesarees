"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db, storage } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Star, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Sample reviews data (static)
const sampleReviews = [
  {
    id: "1",
    userId: "user1",
    userName: "Priya Sharma",
    userImage: null,
    rating: 5,
    comment:
      "This saree is absolutely gorgeous! The color is vibrant and the fabric feels luxurious. I received so many compliments when I wore it to a wedding. Highly recommend!",
    images: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: "2",
    userId: "user2",
    userName: "Ananya Patel",
    userImage: null,
    rating: 4,
    comment:
      "Beautiful saree with excellent craftsmanship. The gold border adds a royal touch. The only reason I'm giving 4 stars instead of 5 is that the color was slightly different from what I expected, but still beautiful.",
    images: [],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
  },
  {
    id: "3",
    userId: "user3",
    userName: "Meera Desai",
    userImage: null,
    rating: 5,
    comment:
      "Perfect for special occasions! The silk is of high quality and the saree drapes beautifully. Shipping was fast and the packaging was excellent.",
    images: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
]

interface ProductReviewSimplifiedProps {
  productId: number
}

export default function ProductReviewSimplified({ productId }: ProductReviewSimplifiedProps) {
  const [reviews, setReviews] = useState(sampleReviews)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleRatingChange = (value: number) => {
    setRating(value)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      if (images.length + newImages.length > 3) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 3 images per review.",
          variant: "destructive",
        })
        return
      }
      setImages([...images, ...newImages])

      // Create preview URLs
      const newImageUrls = newImages.map((file) => URL.createObjectURL(file))
      setImageUrls([...imageUrls, ...newImageUrls])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)

    const newImageUrls = [...imageUrls]
    URL.revokeObjectURL(newImageUrls[index])
    newImageUrls.splice(index, 1)
    setImageUrls(newImageUrls)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to submit a review.",
        variant: "destructive",
      })
      return
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating.",
        variant: "destructive",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Upload images if any
      const uploadedImageUrls: string[] = []
      if (images.length > 0) {
        for (const image of images) {
          try {
            const storageRef = ref(storage, `reviews/${productId}/${user.uid}/${Date.now()}_${image.name}`)
            await uploadBytes(storageRef, image)
            const downloadUrl = await getDownloadURL(storageRef)
            uploadedImageUrls.push(downloadUrl)
          } catch (error) {
            console.error("Error uploading image:", error)
            toast({
              title: "Image Upload Error",
              description:
                "There was an error uploading one of your images. Your review will be submitted without images.",
              variant: "destructive",
            })
            break
          }
        }
      }

      // Add review to Firestore
      const reviewData = {
        productId,
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userImage: user.photoURL || null,
        rating,
        comment,
        images: uploadedImageUrls,
        createdAt: serverTimestamp(),
      }

      try {
        // Try to save to Firestore
        await addDoc(collection(db, "reviews"), reviewData)
      } catch (error) {
        console.error("Error saving review to Firestore:", error)
        // Continue with local state update even if Firestore fails
      }

      // Add the new review to the local state regardless of Firestore success
      const newReview = {
        id: Date.now().toString(),
        ...reviewData,
        createdAt: new Date(),
        images: uploadedImageUrls,
      }

      setReviews([newReview, ...reviews])

      // Reset form
      setRating(0)
      setComment("")
      setImages([])
      setImageUrls([])

      toast({
        title: "Review Submitted",
        description: "Thank you for your review!",
      })
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>

      {/* Review Form */}
      {user && (
        <div className="bg-gradient-to-r from-pink-50 to-gold-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRatingChange(value)}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`h-6 w-6 ${value <= rating ? "text-gold-500 fill-gold-500" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Optional)</label>
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors">
                  <Upload className="h-5 w-5 inline mr-2" />
                  <span>Add Photos</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
                <span className="text-sm text-gray-500">{images.length}/3 images (max 3)</span>
              </div>

              {imageUrls.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <Image
                        src={url || "/placeholder.svg"}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="bg-gradient-to-r from-maroon-700 to-maroon-800 hover:from-maroon-800 hover:to-maroon-900 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
            {!user && (
              <Button
                className="mt-4 bg-maroon-700 hover:bg-maroon-800 text-white"
                onClick={() => (window.location.href = "/login")}
              >
                Login to Write a Review
              </Button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {review.userImage ? (
                    <Image
                      src={review.userImage || "/placeholder.svg"}
                      alt={review.userName}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-maroon-700 flex items-center justify-center text-white font-medium">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{review.userName}</h4>
                    <p className="text-sm text-gray-500">
                      {review.createdAt instanceof Date
                        ? review.createdAt.toLocaleDateString()
                        : new Date(review.createdAt?.seconds * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star
                        key={value}
                        className={`h-4 w-4 ${
                          value <= review.rating ? "text-gold-500 fill-gold-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((image, index) => (
                        <div key={index} className="relative w-16 h-16 sm:w-20 sm:h-20">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Review image ${index + 1}`}
                            fill
                            className="object-cover rounded-md cursor-pointer"
                            onClick={() => window.open(image, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

