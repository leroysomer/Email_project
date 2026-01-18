'use client'

import { useState, useEffect } from 'react'
import { searchApi, campaignApi } from '@/lib/api'
import { Academic } from '@/types'

export default function SearchResultsTab() {
  const [academics, setAcademics] = useState<Academic[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadAcademics()
  }, [])

  const loadAcademics = async () => {
    try {
      const [allAcademics, selectedAcademics] = await Promise.all([
        searchApi.getAcademics(),
        campaignApi.getSelectedAcademics()
      ])
      
      setAcademics(allAcademics)
      const selectedSet = new Set(selectedAcademics.map((a: Academic) => a.id))
      setSelectedIds(selectedSet)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load academics')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelection = async (academicId: number, isSelected: boolean) => {
    try {
      if (isSelected) {
        await campaignApi.removeFromList(academicId)
        setSelectedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(academicId)
          return newSet
        })
      } else {
        await campaignApi.addToList(academicId)
        setSelectedIds(prev => new Set(prev).add(academicId))
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update selection')
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
    return <div className="text-center py-8 text-gray-900">Loading search results...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Search Results</h2>
        <p className="text-gray-600 mb-4">
          Browse all academics from your searches. Add them to your campaign list to generate and send emails.
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
              <p className="mb-4">No academics found yet.</p>
              <p className="text-sm">Go to "Research Parameters" tab to start searching!</p>
            </div>
          ) : (
            'No academics match your search filter.'
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAcademics.map((academic) => {
            const isSelected = selectedIds.has(academic.id)
            return (
              <div key={academic.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{academic.name}</h3>

                {academic.university_name && (
                  <p className="text-sm text-gray-600 mb-2">{academic.university_name}</p>
                )}

                {academic.research_interests && (
                  <p className="text-sm text-gray-700 mb-3">{academic.research_interests}</p>
                )}

                {academic.bio && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-3">{academic.bio}</p>
                )}

                {academic.email && (
                  <p className="text-xs text-gray-500 mb-3">Email: {academic.email}</p>
                )}

                <button
                  onClick={() => handleToggleSelection(academic.id, isSelected)}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-green-100 text-green-700 border-2 border-green-500 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSelected ? '✓ In Campaign List' : '+ Add to Campaign'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {academics.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-gray-700">
            <strong>{selectedIds.size}</strong> academic{selectedIds.size !== 1 ? 's' : ''} in your campaign list. 
            Go to "My Research Campaigns" to generate and send emails.
          </p>
        </div>
      )}
    </div>
  )
}
