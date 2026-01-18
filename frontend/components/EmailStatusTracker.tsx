'use client'

import { useState, useEffect } from 'react'
import { emailApi } from '@/lib/api'
import { EmailCampaign } from '@/types'

export default function EmailStatusTracker() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      loadCampaigns()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      case 'received':
        return 'bg-green-100 text-green-800'
      case 'no_response':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-center py-4 text-gray-900">Loading email statuses...</div>
  }

  if (campaigns.length === 0) {
    return null
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Email Status Tracker</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academic
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
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {campaign.academic_name}
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
                  {campaign.status === 'sent' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, 'received')}
                        className="text-green-600 hover:text-green-900"
                      >
                        Mark as Received
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(campaign.id, 'no_response')}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Mark as No Response
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
