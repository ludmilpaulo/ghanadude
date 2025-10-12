'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { fetchRewards, fetchRewardBalance, Reward, RewardBalance } from '@/services/rewardsService'
import { Gift, Star, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function RewardsPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [balance, setBalance] = useState<RewardBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.token && user?.user_id) {
      loadRewardsData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadRewardsData = async () => {
    if (!user?.token || !user?.user_id) return
    
    setLoading(true)
    try {
      const [rewardsData, balanceData] = await Promise.all([
        fetchRewards(user.user_id, user.token),
        fetchRewardBalance(user.user_id, user.token)
      ])
      setRewards(rewardsData)
      setBalance(balanceData)
      setError(null)
    } catch (err) {
      console.error('Load rewards error:', err)
      setError('Failed to load rewards data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'used':
        return <XCircle className="w-5 h-5 text-gray-400" />
      case 'expired':
        return <Clock className="w-5 h-5 text-red-400" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-gray-100 text-gray-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const pointsToRand = (points: number) => {
    return (points / 100).toFixed(2) // 100 points = R1
  }

  if (!user) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold">Please log in to view your rewards</h1>
        <a href="/Login" className="inline-block mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl">
          Login
        </a>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading rewards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-12 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadRewardsData}
          className="mt-4 bg-brand-600 text-white px-6 py-3 rounded-xl"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-brand-600" />
            <h1 className="text-3xl font-bold">Rewards & Loyalty</h1>
          </div>
          <p className="text-gray-600">Earn points with every purchase and redeem them for discounts</p>
        </div>

        {/* Balance Cards */}
        {balance && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available Points</p>
                  <p className="text-2xl font-bold">{balance.available_points}</p>
                  <p className="text-green-100 text-sm">R{pointsToRand(balance.available_points)} value</p>
                </div>
                <Star className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold">{balance.total_points}</p>
                  <p className="text-blue-100 text-sm">R{pointsToRand(balance.total_points)} value</p>
                </div>
                <Gift className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Used Points</p>
                  <p className="text-2xl font-bold">{balance.used_points}</p>
                  <p className="text-purple-100 text-sm">R{pointsToRand(balance.used_points)} saved</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How Rewards Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Shop & Earn</h3>
              <p className="text-sm text-gray-600">Earn 1 point for every R1 spent on your purchases</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Accumulate</h3>
              <p className="text-sm text-gray-600">Points never expire and can be saved for bigger rewards</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-brand-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Redeem</h3>
              <p className="text-sm text-gray-600">Use 100 points = R1 discount on your next order</p>
            </div>
          </div>
        </div>

        {/* Rewards History */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Rewards History</h2>
            <span className="text-sm text-gray-500">{rewards.length} transactions</span>
          </div>

          {rewards.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">No rewards earned yet</p>
              <Link href="/" className="text-brand-600 hover:underline">
                Start shopping to earn points
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(reward.status)}
                    <div>
                      <p className="font-medium">{reward.description}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Earned: {formatDate(reward.earned_date)}
                        {reward.expiry_date && (
                          <> • Expires: {formatDate(reward.expiry_date)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reward.status)}`}>
                        {reward.status}
                      </span>
                      <span className="font-semibold text-lg">
                        +{reward.points}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      R{pointsToRand(reward.points)} value
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
