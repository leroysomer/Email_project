'use client'

import { useState } from 'react'
import { searchApi } from '@/lib/api'

interface ResearchParametersTabProps {
  onSearchComplete: () => void
}

export default function ResearchParametersTab({ onSearchComplete }: ResearchParametersTabProps) {
  const [universities, setUniversities] = useState<string[]>([''])
  const [researchDomain, setResearchDomain] = useState('')
  const [researchType, setResearchType] = useState<string>('all')
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
      onSearchComplete()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to search for academics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Research Parameters</h2>

      <p className="text-gray-600 mb-6">
        Configure your search criteria to find relevant academics and research opportunities.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Universities / Institutions
          </label>
          {universities.map((university, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={university}
                onChange={(e) => handleUniversityChange(index, e.target.value)}
                placeholder="e.g., MIT, Stanford, Cambridge"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {universities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUniversity(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addUniversity}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Research Type / Criteria
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="all"
                checked={researchType === 'all'}
                onChange={(e) => setResearchType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-900">All Research Types</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="public"
                checked={researchType === 'public'}
                onChange={(e) => setResearchType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-900">Public/Open Research</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="private"
                checked={researchType === 'private'}
                onChange={(e) => setResearchType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-900">Private/Funded Research</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="academic"
                checked={researchType === 'academic'}
                onChange={(e) => setResearchType(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-900">Academic Research Only</span>
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Note: Research type filtering is for future implementation
          </p>
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
