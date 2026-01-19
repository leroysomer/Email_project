'use client'

import { useState } from 'react'
import { Academic } from '@/types'

interface AcademicDetailOverlayProps {
  academic: Academic
  onClose: () => void
  onAddToTargets?: () => void
  isInTargets?: boolean
  onSendEmail?: () => void
  canSendEmail?: boolean
  emailConfigured?: boolean
  onUpdate?: (updatedAcademic: Partial<Academic>) => Promise<void>
}

export default function AcademicDetailOverlay({
  academic,
  onClose,
  onAddToTargets,
  isInTargets,
  onSendEmail,
  canSendEmail,
  emailConfigured,
  onUpdate
}: AcademicDetailOverlayProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: academic.title || '',
    email: academic.email || '',
    theme: academic.theme || '',
    research_interests: academic.research_interests || '',
    description: academic.description || '',
    website: academic.website || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!onUpdate) return
    setSaving(true)
    try {
      await onUpdate(editForm)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to update academic:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {academic.title && `${academic.title} `}{academic.name}
            </h2>
            {academic.university_name && (
              <p className="text-gray-600 mt-1">{academic.university_name}</p>
            )}
          </div>
          <div className="flex gap-2">
            {onUpdate && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                ✏️ Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {isEditing ? (
            /* Edit Mode */
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Dr, Prof, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="academic@university.edu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Research Theme</label>
                <input
                  type="text"
                  value={editForm.theme}
                  onChange={(e) => setEditForm({...editForm, theme: e.target.value})}
                  placeholder="Main research area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Research Interests</label>
                <textarea
                  value={editForm.research_interests}
                  onChange={(e) => setEditForm({...editForm, research_interests: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>
            </>
          ) : (
            /* View Mode */
            <>
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
                {academic.email ? (
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${academic.email}`} className="text-blue-600 hover:underline">
                      {academic.email}
                    </a>
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No email available - click Edit to add</p>
                )}
              </div>

              {/* Research Theme */}
              {(academic.theme || isInTargets) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Theme</h3>
                  <p className="text-gray-700">{academic.theme || <span className="text-gray-500 italic">Not set</span>}</p>
                </div>
              )}

              {/* Research Interests */}
              {(academic.research_interests || isInTargets) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Interests</h3>
                  <p className="text-gray-700">{academic.research_interests || <span className="text-gray-500 italic">Not set</span>}</p>
                </div>
              )}

              {/* Description */}
              {(academic.description || isInTargets) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{academic.description || <span className="text-gray-500 italic">Not set</span>}</p>
                </div>
              )}

              {/* Bio */}
              {academic.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Biography</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{academic.bio}</p>
                </div>
              )}

              {/* Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Links</h3>
                <div className="space-y-2">
                  {academic.website && (
                    <p>
                      <span className="font-medium text-gray-700">Website:</span>{' '}
                      <a
                        href={academic.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {academic.website}
                      </a>
                    </p>
                  )}
                  {academic.profile_url && (
                    <p>
                      <span className="font-medium text-gray-700">Profile:</span>{' '}
                      <a
                        href={academic.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {academic.profile_url}
                      </a>
                    </p>
                  )}
                  {!academic.website && !academic.profile_url && (
                    <p className="text-gray-500 italic">No links available</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    title: academic.title || '',
                    email: academic.email || '',
                    theme: academic.theme || '',
                    research_interests: academic.research_interests || '',
                    description: academic.description || '',
                    website: academic.website || ''
                  })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {onAddToTargets && !isInTargets && (
                <button
                  onClick={onAddToTargets}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  + Add to Targets
                </button>
              )}
              
              {canSendEmail && onSendEmail && (
                <div className="flex-1 relative group">
                  <button
                    onClick={emailConfigured ? onSendEmail : undefined}
                    disabled={!emailConfigured}
                    className={`w-full px-4 py-2 rounded-md font-medium ${
                      emailConfigured
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    📧 Send Email
                  </button>
                  {!emailConfigured && (
                    <div className="absolute bottom-full left-0 mb-2 w-full invisible group-hover:visible">
                      <div className="bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
                        Please configure your email settings in the "Mail Setup" tab first
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
