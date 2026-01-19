'use client'

import { useState, useEffect } from 'react'
import { campaignApi, searchApi, emailApi } from '@/lib/api'
import { Academic } from '@/types'
import AcademicDetailOverlay from '@/components/AcademicDetailOverlay'
import EmailSendOverlay from '@/components/EmailSendOverlay'

interface Campaign {
  id: number
  name: string
  universities: string[]
  research_domain: string
  created_at: string
  academics_count: number
}

export default function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [academics, setAcademics] = useState<Academic[]>([])
  const [targetedIds, setTargetedIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [selectedAcademic, setSelectedAcademic] = useState<Academic | null>(null)
  const [showEmailOverlay, setShowEmailOverlay] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [emailTemplate, setEmailTemplate] = useState('')
  const [emailSubject, setEmailSubject] = useState('Research Collaboration Opportunity')

  useEffect(() => {
    loadCampaigns()
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
      const profile = await campaignApi.getProfile?.() || await profileApi.get()
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

  const loadCampaigns = async () => {
    try {
      const data = await campaignApi.getCampaigns()
      setCampaigns(data)
      if (data.length > 0) {
        loadCampaignAcademics(data[0])
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const loadCampaignAcademics = async (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setLoading(true)
    try {
      const data = await campaignApi.getCampaignAcademics(campaign.id)
      setAcademics(data)
      
      // Check which academics are already targeted
      const targeted = new Set<number>()
      for (const academic of data) {
        const result = await campaignApi.isTargeted(academic.id)
        if (result.selected) {
          targeted.add(academic.id)
        }
      }
      setTargetedIds(targeted)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load academics')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTarget = async (academicId: number, isTargeted: boolean) => {
    try {
      if (isTargeted) {
        await campaignApi.removeFromTargets(academicId)
        setTargetedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(academicId)
          return newSet
        })
      } else {
        await campaignApi.addToTargets(academicId)
        setTargetedIds(prev => new Set(prev).add(academicId))
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update targets')
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

  const handleAddToTargets = async () => {
    if (!selectedAcademic) return
    await handleToggleTarget(selectedAcademic.id, false)
    setTargetedIds(prev => new Set(prev).add(selectedAcademic.id))
    setSelectedAcademic(null)
  }

  const handleSendEmail = async (subject: string, body: string) => {
    if (!selectedAcademic) return
    await emailApi.sendToAcademic(selectedAcademic.id, subject, body)
  }

  const handleUpdateAcademic = async (updatedFields: Partial<Academic>) => {
    if (!selectedAcademic) return
    try {
      const updated = await searchApi.updateAcademic(selectedAcademic.id, updatedFields)
      // Update in local state
      setAcademics(academics.map(a => a.id === updated.id ? updated : a))
      setSelectedAcademic(updated)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update academic')
      throw err
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

  if (loading && campaigns.length === 0) {
    return <div className="text-center py-8 text-gray-900">Loading campaigns...</div>
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">My Research Campaigns</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No campaigns yet.</p>
          <p className="text-sm">Go to "Research Parameters" tab to run a search and create your first campaign!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">My Research Campaigns</h2>

      {/* Campaign Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Campaign tabs">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => loadCampaignAcademics(campaign)}
                className={`
                  whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm
                  ${
                    selectedCampaign?.id === campaign.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-start">
                  <span>{campaign.research_domain}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(campaign.created_at).toLocaleDateString()} • {campaign.academics_count} professors
                  </span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {selectedCampaign && (
        <>
          <div className="mb-4 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold text-gray-900 mb-2">{selectedCampaign.name}</h3>
            <p className="text-sm text-gray-600">
              <strong>Universities:</strong> {selectedCampaign.universities.join(', ')}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Research Domain:</strong> {selectedCampaign.research_domain}
            </p>
          </div>

          {academics.length > 0 && (
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search professors by name, university, or research interests..."
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-900">Loading professors...</div>
          ) : filteredAcademics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {academics.length === 0
                ? 'No professors found in this campaign.'
                : 'No professors match your search filter.'}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                <strong>{targetedIds.size}</strong> of <strong>{academics.length}</strong> professors added to targets
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAcademics.map((academic) => {
                  const isTargeted = targetedIds.has(academic.id)
                  return (
                    <div 
                      key={academic.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleAcademicClick(academic)}
                    >
                      <h3 className="text-lg font-semibold mb-2 text-gray-900">
                        {academic.title && `${academic.title} `}{academic.name}
                      </h3>

                      {academic.university_name && (
                        <p className="text-sm text-gray-600 mb-2">{academic.university_name}</p>
                      )}

                      {academic.theme && (
                        <p className="text-sm font-medium text-blue-600 mb-2">{academic.theme}</p>
                      )}

                      {academic.research_interests && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{academic.research_interests}</p>
                      )}

                      {academic.email && (
                        <p className="text-xs text-gray-500 mb-3">✉ {academic.email}</p>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleTarget(academic.id, isTargeted)
                        }}
                        className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          isTargeted
                            ? 'bg-green-100 text-green-700 border-2 border-green-500 hover:bg-green-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isTargeted ? '✓ In Targets' : '+ Add to Targets'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Academic Detail Overlay */}
      {selectedAcademic && !showEmailOverlay && (
        <AcademicDetailOverlay
          academic={selectedAcademic}
          onClose={() => setSelectedAcademic(null)}
          onAddToTargets={!targetedIds.has(selectedAcademic.id) ? handleAddToTargets : undefined}
          isInTargets={targetedIds.has(selectedAcademic.id)}
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
