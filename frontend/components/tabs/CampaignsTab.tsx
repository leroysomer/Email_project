'use client'

import { useState, useEffect } from 'react'
import { campaignApi } from '@/lib/api'
import { Academic } from '@/types'
import AcademicCard from '../AcademicCard'

export default function CampaignsTab() {
  const [academics, setAcademics] = useState<Academic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadAcademics()
  }, [])

  const loadAcademics = async () => {
    try {
      const data = await campaignApi.getSelectedAcademics()
      setAcademics(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load campaign list')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (academicId: number) => {
    try {
      await campaignApi.removeFromList(academicId)
      setAcademics(academics.filter(a => a.id !== academicId))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove academic')
    }
  }

  const filteredAcademics = academics.filter(academic => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      academic.name.toLowerCase().includes(searchTerm) ||
      academic.research_interests?.toLowerCase().includes(searchTerm) ||
      academic.university_name?.toLowerCase().includes(searchTerm)
    )
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-900">Loading campaign list...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">My Research Campaigns</h2>
        <p className="text-gray-600 mb-4">
          Professors you've added to your campaign list. Generate and send personalized emails to each.
        </p>
        
        {academics.length > 0 && (
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by name, university, or research interests..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {filteredAcademics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {academics.length === 0 ? (
            <div>
              <p className="mb-4">Your campaign list is empty.</p>
              <p className="text-sm">Go to "Search Results" tab to add academics to your campaign!</p>
            </div>
          ) : (
            'No academics match your search filter.'
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-gray-700">
              <strong>{academics.length}</strong> academic{academics.length !== 1 ? 's' : ''} in your campaign list
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAcademics.map((academic) => (
              <div key={academic.id} className="relative">
                <AcademicCard academic={academic} />
                <button
                  onClick={() => handleRemove(academic.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-xs"
                  title="Remove from campaign"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
