'use client'

import { useState, useEffect } from 'react'
import { searchApi, emailApi } from '@/lib/api'
import { Academic } from '@/types'
import AcademicCard from './AcademicCard'

export default function AcademicsDashboard() {
  const [academics, setAcademics] = useState<Academic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadAcademics()
  }, [])

  const loadAcademics = async () => {
    try {
      const data = await searchApi.getAcademics()
      setAcademics(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load academics')
    } finally {
      setLoading(false)
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
    return <div className="text-center py-8">Loading academics...</div>
  }

  if (error) {
    return <div className="text-red-600 py-8">{error}</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Academics Dashboard</h2>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name, university, or research interests..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {filteredAcademics.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {academics.length === 0
            ? 'No academics found. Try searching for some!'
            : 'No academics match your search filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAcademics.map((academic) => (
            <AcademicCard key={academic.id} academic={academic} />
          ))}
        </div>
      )}
    </div>
  )
}
