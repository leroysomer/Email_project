'use client'

import { useState } from 'react'
import { profileApi } from '@/lib/api'

interface UploadFormProps {
  onComplete: () => void
}

export default function UploadForm({ onComplete }: UploadFormProps) {
  const [resume, setResume] = useState<File | null>(null)
  const [interests, setInterests] = useState('')
  const [emailTemplate, setEmailTemplate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData()

      if (resume) {
        formData.append('resume', resume)
      }
      if (interests) {
        formData.append('interests', interests)
      }
      if (emailTemplate) {
        formData.append('email_template', emailTemplate)
      }

      await profileApi.upload(formData)
      setSuccess(true)
      setTimeout(() => {
        onComplete()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Setup Your Profile</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
            Resume (PDF)
          </label>
          <input
            id="resume"
            type="file"
            accept=".pdf"
            onChange={(e) => setResume(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-2">
            Research Interests
          </label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            rows={4}
            placeholder="Describe your research interests, areas of study, and what you're looking for in an internship..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700 mb-2">
            Email Template
          </label>
          <textarea
            id="emailTemplate"
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            rows={8}
            placeholder="Write your base email template here. Placeholders like [NAME] and [RESEARCH_INTERESTS] will be replaced with the academic's information..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            This template will be personalized for each academic using AI.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !interests || !emailTemplate}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
