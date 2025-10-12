'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { fetchProductReviews, fetchReviewStats, createReview, updateReview, deleteReview, Review, ReviewStats } from '@/services/reviewService'
import { Star, MessageSquare, Edit, Trash2, User } from 'lucide-react'

interface ProductReviewsProps {
  productId: number
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const user = useAppSelector((state) => state.auth.user)
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  })

  useEffect(() => {
    loadReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const [reviewsData, statsData] = await Promise.all([
        fetchProductReviews(productId),
        fetchReviewStats(productId)
      ])
      setReviews(reviewsData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      console.error('Load reviews error:', err)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.token) {
      alert('Please log in to write a review')
      return
    }

    try {
      if (editingReview) {
        await updateReview(editingReview.id, formData.rating, formData.comment, user.token)
      } else {
        await createReview(productId, formData.rating, formData.comment, user.token)
      }
      
      setFormData({ rating: 5, comment: '' })
      setShowReviewForm(false)
      setEditingReview(null)
      loadReviews()
    } catch (err) {
      console.error('Submit review error:', err)
      alert('Failed to submit review')
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review)
    setFormData({ rating: review.rating, comment: review.comment })
    setShowReviewForm(true)
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!user?.token) return
    
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(reviewId, user.token)
        loadReviews()
      } catch (err) {
        console.error('Delete review error:', err)
        alert('Failed to delete review')
      }
    }
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading reviews...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadReviews}
          className="mt-2 text-brand-600 hover:underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Customer Reviews
        </h3>
        {user && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700 transition-colors"
          >
            Write Review
          </button>
        )}
      </div>

      {/* Review Stats */}
      {stats && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold">{stats.average_rating.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(stats.average_rating))}
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Rating Breakdown</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.rating_breakdown[rating as keyof typeof stats.rating_breakdown]
                  const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm w-8">{rating}</span>
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <h4 className="font-semibold mb-4">
            {editingReview ? 'Edit Review' : 'Write a Review'}
          </h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              {renderStars(formData.rating, true, (rating) => 
                setFormData({ ...formData, rating })
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                rows={4}
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-brand-600 text-white px-6 py-2 rounded-xl hover:bg-brand-700 transition-colors"
              >
                {editingReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false)
                  setEditingReview(null)
                  setFormData({ rating: 5, comment: '' })
                }}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {review.user.first_name} {review.user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                
                {user?.user_id === review.user.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditReview(review)}
                      className="p-2 text-gray-500 hover:text-brand-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mb-3">
                {renderStars(review.rating)}
              </div>
              
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
