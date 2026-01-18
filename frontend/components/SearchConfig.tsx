'use client'

import { useState } from 'react'
import { searchApi } from '@/lib/api'

interface SearchConfigProps {
  onComplete: () => void
}

export default function SearchConfig({ onComplete }: SearchConfigProps) {
  const [universities, setUniversities] = useState<string[]>([''])
  const [researchDomain, setResearchDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUniversityChange = (index: number, value: string) => {
    const newUniversities = [...universities]
    newUniversities[index] = value
    setUniversities(newUniversities)
  }

  const addUniversity = () => {
    setUniversities([...universities, ''])
  }

  const removeUniversity = (index: number) => {
    if (universities.length > 1) {
      setUniversities(universities.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validUniversities = universities.filter(u => u.trim() !== '')
    if (validUniversities.length === 0) {
      setError('Please enter at least one university')
      return
    }

    if (!researchDomain.trim()) {
      setError('Please enter a research domain')
      return
    }

    setLoading(true)

    try {
      await searchApi.searchAcademics(validUniversities, researchDomain)
      onComplete()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search for academics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Search for Academics</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Universities
          </label>
          {universities.map((university, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={university}
                onChange={(e) => handleUniversityChange(index, e.target.value)}
                placeholder="Enter university name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {universities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUniversity(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addUniversity}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            + Add University
          </button>
        </div>

        <div>
          <label htmlFor="researchDomain" className="block text-sm font-medium text-gray-700 mb-2">
            Research Domain / Topic
          </label>
          <input
            id="researchDomain"
            type="text"
            value={researchDomain}
            onChange={(e) => setResearchDomain(e.target.value)}
            placeholder="e.g., Machine Learning, Quantum Computing, Neuroscience"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search for Academics'}
        </button>
      </form>
    </div>
  )
}
