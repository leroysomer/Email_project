'use client'

import { useState } from 'react'
import { emailApi } from '@/lib/api'
import { Academic } from '@/types'
import EmailPreview from './EmailPreview'

interface AcademicCardProps {
  academic: Academic
}

export default function AcademicCard({ academic }: AcademicCardProps) {
  const [generating, setGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [campaignData, setCampaignData] = useState<any>(null)
  const [error, setError] = useState('')

  const handleGenerateEmail = async () => {
    setGenerating(true)
    setError('')

    try {
      const data = await emailApi.generate(academic.id)
      setCampaignData(data)
      setShowPreview(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate email')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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

      {error && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 text-xs rounded">{error}</div>
      )}

      <button
        onClick={handleGenerateEmail}
        disabled={generating || !academic.email}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {generating ? 'Generating...' : 'Generate & Send Email'}
      </button>

      {showPreview && campaignData && (
        <EmailPreview
          campaignId={campaignData.campaign_id}
          academicEmail={campaignData.academic_email}
          generatedEmail={campaignData.generated_email}
          academicName={campaignData.academic_name}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
