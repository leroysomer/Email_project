'use client'

import { useState } from 'react'
import { Academic } from '@/types'

interface EmailSendOverlayProps {
  academic: Academic
  emailTemplate: string
  emailSubject: string
  onClose: () => void
  onSend: (subject: string, body: string) => Promise<void>
}

export default function EmailSendOverlay({
  academic,
  emailTemplate,
  emailSubject,
  onClose,
  onSend
}: EmailSendOverlayProps) {
  const [subject, setSubject] = useState(
    emailSubject.replace('[ACADEMIC_NAME]', academic.name)
  )
  const [body, setBody] = useState(
    emailTemplate
      .replace(/\[NAME\]/g, academic.name)
      .replace(/\[RESEARCH_INTERESTS\]/g, academic.research_interests || '')
  )
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    setSending(true)
    setError('')
    
    try {
      await onSend(subject, body)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Send Email</h2>
            <p className="text-gray-600 mt-1">To: {academic.name} ({academic.email})</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Email Body
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            />
          </div>

          {/* Attachments placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-md text-center text-gray-500">
              <p className="text-sm">Attachments feature coming soon</p>
              <p className="text-xs mt-1">Your CV will be automatically attached if uploaded</p>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={handleSend}
            disabled={sending || !subject || !body}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : '📧 Send Email'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
