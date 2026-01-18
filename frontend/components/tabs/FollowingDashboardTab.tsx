'use client'

import { useState, useEffect } from 'react'
import { emailApi } from '@/lib/api'
import { EmailCampaign } from '@/types'

export default function FollowingDashboardTab() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const data = await emailApi.getCampaigns()
      setCampaigns(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (campaignId: number, status: string) => {
    try {
      await emailApi.updateStatus(campaignId, status)
      await loadCampaigns()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status')
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
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'all') return true
    return campaign.status === filter
  })

  if (loading) {
    return <div className="text-center py-8 text-gray-900">Loading following dashboard...</div>
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Following Dashboard</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No email campaigns yet.</p>
          <p className="text-sm">Generate and send emails from the "My Research Campaigns" tab to track them here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Following Dashboard</h2>
        <p className="text-gray-600 mb-4">
          Track all professors you've contacted and manage follow-ups.
        </p>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({campaigns.length})
          </button>
          <button
            onClick={() => setFilter('SENT')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'SENT'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sent ({campaigns.filter(c => c.status === 'SENT').length})
          </button>
          <button
            onClick={() => setFilter('RECEIVED')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'RECEIVED'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Answered ({campaigns.filter(c => c.status === 'RECEIVED').length})
          </button>
          <button
            onClick={() => setFilter('NO_RESPONSE')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'NO_RESPONSE'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            No Response ({campaigns.filter(c => c.status === 'NO_RESPONSE').length})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Professor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sent At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCampaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.academic_name}
                  </div>
                  {/* TODO: Add link to professor's team/department */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      campaign.status
                    )}`}
                  >
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {campaign.sent_at
                    ? new Date(campaign.sent_at).toLocaleDateString()
                    : 'Not sent'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {campaign.status === 'SENT' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, 'RECEIVED')}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as received response"
                      >
                        ✓ Answered
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, 'NO_RESPONSE')}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Mark as no response"
                      >
                        ✗ No Response
                      </button>
                    </>
                  )}
                  {campaign.status === 'RECEIVED' && (
                    <button
                      onClick={() => handleStatusUpdate(campaign.id, 'SENT')}
                      className="text-blue-600 hover:text-blue-900"
                      title="Revert to sent"
                    >
                      ← Revert
                    </button>
                  )}
                  {campaign.status === 'NO_RESPONSE' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, 'RECEIVED')}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as received response"
                      >
                        ✓ Answered
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, 'SENT')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Revert to sent"
                      >
                        ← Revert
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
