'use client'

import { useState, useEffect } from 'react'
import { campaignApi, searchApi, emailApi, profileApi } from '@/lib/api'
import { Academic } from '@/types'
import AcademicDetailOverlay from '@/components/AcademicDetailOverlay'
import EmailSendOverlay from '@/components/EmailSendOverlay'

export default function FollowingDashboardTab() {
  const [targets, setTargets] = useState<Academic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [selectedAcademic, setSelectedAcademic] = useState<Academic | null>(null)
  const [showEmailOverlay, setShowEmailOverlay] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [emailTemplate, setEmailTemplate] = useState('')
  const [emailSubject, setEmailSubject] = useState('Research Collaboration Opportunity')
  const [manualForm, setManualForm] = useState({
    name: '',
    title: '',
    email: '',
    university_name: '',
    theme: '',
    research_interests: '',
    description: '',
    website: ''
  })

  useEffect(() => {
    loadTargets()
    checkEmailConfiguration()
    loadEmailTemplate()
  }, [])

  const checkEmailConfiguration = async () => {
    try {
      const result = await emailApi.isConfigured()
      setEmailConfigured(result.configured)
    } catch (err) {
      setEmailConfigured(false)
    }
  }

  const loadEmailTemplate = async () => {
    try {
      const profile = await profileApi.get()
      if (profile.email_template) {
        setEmailTemplate(profile.email_template)
      } else {
        setEmailTemplate('Dear [NAME],\n\nI hope this email finds you well.\n\nI am writing to express my interest in your research on [RESEARCH_INTERESTS]...')
      }
      if (profile.email_subject) {
        setEmailSubject(profile.email_subject)
      }
    } catch (err) {
      // Use default template if profile not found
      setEmailTemplate('Dear [NAME],\n\nI hope this email finds you well.\n\nI am writing to express my interest in your research on [RESEARCH_INTERESTS]...')
    }
  }

  const loadTargets = async () => {
    try {
      const data = await campaignApi.getTargets()
      setTargets(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load targets')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTarget = async (academicId: number) => {
    try {
      await campaignApi.removeFromTargets(academicId)
      setTargets(targets.filter(t => t.id !== academicId))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to remove target')
    }
  }

  const handleAcademicClick = async (academic: Academic) => {
    try {
      const fullAcademic = await searchApi.getAcademic(academic.id)
      setSelectedAcademic(fullAcademic)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load academic details')
    }
  }

  const handleSendEmail = async (subject: string, body: string) => {
    if (!selectedAcademic) return
    await emailApi.sendToAcademic(selectedAcademic.id, subject, body)
    loadTargets() // Reload to update status
  }

  const handleUpdateAcademic = async (updatedFields: Partial<Academic>) => {
    if (!selectedAcademic) return
    try {
      const updated = await searchApi.updateAcademic(selectedAcademic.id, updatedFields)
      // Update in local state
      setTargets(targets.map(t => t.id === updated.id ? updated : t))
      setSelectedAcademic(updated)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update academic')
      throw err
    }
  }

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const academic = await searchApi.addAcademicManually(manualForm)
      await campaignApi.addToTargets(academic.id)
      setTargets([...targets, academic])
      setShowManualAdd(false)
      setManualForm({
        name: '',
        title: '',
        email: '',
        university_name: '',
        theme: '',
        research_interests: '',
        description: '',
        website: ''
      })
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to add target')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-blue-100 text-blue-800'
      case 'RECEIVED':
        return 'bg-green-100 text-green-800'
      case 'NO_RESPONSE':
        return 'bg-yellow-100 text-yellow-800'
      case 'NOT_SENT':
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredTargets = targets.filter(target => {
    if (!filter) return true
    const searchTerm = filter.toLowerCase()
    return (
      target.name.toLowerCase().includes(searchTerm) ||
      target.research_interests?.toLowerCase().includes(searchTerm) ||
      target.university_name?.toLowerCase().includes(searchTerm)
    )
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-900">Loading following dashboard...</div>
  }

  if (targets.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Following Dashboard</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No targets yet.</p>
          <p className="text-sm">Go to "Research Campaigns" tab to add professors to your targets!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Following Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Track all professors in your targets. Generate and send emails, then update their status.
            </p>
          </div>
          <button
            onClick={() => setShowManualAdd(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
          >
            + Add Target Manually
          </button>
        </div>

        {/* Search Filter */}
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name, university, or research interests..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}

      {filteredTargets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No targets match your search filter.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-300 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">
                  Professor
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">
                  University
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">
                  Research Topic
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 border-r border-gray-300">
                  Sent Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {filteredTargets.map((target, index) => {
                const researchShort = target.research_interests 
                  ? target.research_interests.split(' ').slice(0, 3).join(' ')
                  : 'N/A'
                
                // Default status is NOT_SENT (will be updated when email is sent)
                const status = 'NOT_SENT'
                
                return (
                  <tr 
                    key={target.id} 
                    className={`hover:bg-blue-50 border-b border-gray-200 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    onClick={() => handleAcademicClick(target)}
                  >
                    <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                      {target.title && `${target.title} `}{target.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                      {target.university_name || 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                      <div className="group relative">
                        <span className="cursor-help">{researchShort}...</span>
                        {target.research_interests && (
                          <div className="absolute invisible group-hover:visible bg-gray-900 text-white text-xs rounded p-2 bottom-full left-0 mb-2 w-64 z-10 shadow-lg">
                            {target.research_interests}
                            <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                      {target.email || 'N/A'}
                    </td>
                    <td className="px-4 py-2 border-r border-gray-200">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 border-r border-gray-200">
                      -
                    </td>
                    <td className="px-4 py-2 text-xs font-medium">
                      <div className="flex gap-2">
                        {status === 'NOT_SENT' && (
                          <div className="relative group">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (target.email && emailConfigured) {
                                  handleAcademicClick(target)
                                  setTimeout(() => setShowEmailOverlay(true), 100)
                                }
                              }}
                              disabled={!target.email || !emailConfigured}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                target.email && emailConfigured
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              📧
                            </button>
                            {(!target.email || !emailConfigured) && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 invisible group-hover:visible z-10">
                                <div className="bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
                                  {!target.email ? 'No email address - click row to add' : 'Configure email settings first'}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveTarget(target.id)
                          }}
                          className="text-red-600 hover:text-red-900 px-2 py-1"
                          title="Remove from targets"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-md text-sm text-gray-700">
        <p>
          <strong>{targets.length}</strong> professor{targets.length !== 1 ? 's' : ''} in your targets. 
          Click on a row to see details and send emails.
        </p>
      </div>

      {/* Manual Add Overlay */}
      {showManualAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add Target Manually</h2>
              <button
                onClick={() => setShowManualAdd(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleManualAdd} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.name}
                  onChange={(e) => setManualForm({...manualForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={manualForm.title}
                    onChange={(e) => setManualForm({...manualForm, title: e.target.value})}
                    placeholder="Dr, Prof, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={manualForm.email}
                    onChange={(e) => setManualForm({...manualForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                <input
                  type="text"
                  value={manualForm.university_name}
                  onChange={(e) => setManualForm({...manualForm, university_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Research Theme</label>
                <input
                  type="text"
                  value={manualForm.theme}
                  onChange={(e) => setManualForm({...manualForm, theme: e.target.value})}
                  placeholder="Main research area"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Research Interests</label>
                <textarea
                  value={manualForm.research_interests}
                  onChange={(e) => setManualForm({...manualForm, research_interests: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={manualForm.description}
                  onChange={(e) => setManualForm({...manualForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={manualForm.website}
                  onChange={(e) => setManualForm({...manualForm, website: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Add Target
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualAdd(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Detail Overlay */}
      {selectedAcademic && !showEmailOverlay && (
        <AcademicDetailOverlay
          academic={selectedAcademic}
          onClose={() => setSelectedAcademic(null)}
          isInTargets={true}
          onSendEmail={() => setShowEmailOverlay(true)}
          canSendEmail={!!selectedAcademic.email}
          emailConfigured={emailConfigured}
          onUpdate={handleUpdateAcademic}
        />
      )}

      {/* Email Send Overlay */}
      {selectedAcademic && showEmailOverlay && (
        <EmailSendOverlay
          academic={selectedAcademic}
          emailTemplate={emailTemplate}
          emailSubject={emailSubject}
          onClose={() => {
            setShowEmailOverlay(false)
            setSelectedAcademic(null)
          }}
          onSend={handleSendEmail}
        />
      )}
    </div>
  )
}
