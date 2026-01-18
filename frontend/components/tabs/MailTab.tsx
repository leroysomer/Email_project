'use client'

import { useState, useEffect } from 'react'
import { profileApi } from '@/lib/api'

export default function MailTab() {
  const [emailSubject, setEmailSubject] = useState('')
  const [emailTemplate, setEmailTemplate] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileApi.getProfile()
      setEmailSubject(data.email_subject || '')
      setEmailTemplate(data.email_template || '')
    } catch (err: any) {
      console.log('No profile yet')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const formData = new FormData()
      
      if (emailSubject) formData.append('email_subject', emailSubject)
      if (emailTemplate) formData.append('email_template', emailTemplate)

      await profileApi.upload(formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update email settings')
    } finally {
      setLoading(false)
    }
  }

  if (loadingProfile) {
    return <div className="text-center py-8 text-gray-900">Loading email settings...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">My Mail Configuration</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Email settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-2">
            Email Subject Template
          </label>
          <input
            id="emailSubject"
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            placeholder="e.g., Research Internship Inquiry - [ACADEMIC_NAME]"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Use [ACADEMIC_NAME] as placeholder for the professor's name
          </p>
        </div>

        <div>
          <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700 mb-2">
            Email Body Template
          </label>
          <textarea
            id="emailTemplate"
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
            rows={12}
            placeholder="Dear [NAME],

I am writing to express my interest in potential research opportunities...

Available placeholders:
- [NAME] - Academic's name
- [RESEARCH_INTERESTS] - Their research interests"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            This template will be personalized for each academic using AI. Use placeholders like [NAME] and [RESEARCH_INTERESTS].
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !emailTemplate}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Email Configuration'}
        </button>
      </form>
    </div>
  )
}
