'use client'

import { useState } from 'react'
import { emailApi } from '@/lib/api'

interface EmailPreviewProps {
  campaignId: number
  academicEmail: string
  generatedEmail: string
  academicName: string
  onClose: () => void
}

export default function EmailPreview({
  campaignId,
  academicEmail,
  generatedEmail,
  academicName,
  onClose,
}: EmailPreviewProps) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async (emailService: string = 'smtp') => {
    setSending(true)
    setError('')

    try {
      await emailApi.send(campaignId, emailService)
      setSent(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-xl font-bold mb-4">Email Sent!</h3>
          <p className="mb-4">Your email has been sent to {academicName}.</p>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Email Preview</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>To:</strong> {academicEmail}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Subject:</strong> Inquiry about Research Opportunities - {academicName}
          </p>
        </div>

        <div className="border border-gray-300 rounded-md p-4 mb-4 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm">{generatedEmail}</pre>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => handleSend('smtp')}
            disabled={sending}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send via SMTP'}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Note: Gmail and Outlook integration requires OAuth setup. SMTP configuration is needed in the backend.
        </p>
      </div>
    </div>
  )
}
