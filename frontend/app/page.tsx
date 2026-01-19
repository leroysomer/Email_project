'use client'

import { useState, useEffect } from 'react'
import AuthForm from '@/components/AuthForm'
import ProfileTab from '@/components/tabs/ProfileTab'
import MailTab from '@/components/tabs/MailTab'
import MailSetupTab from '@/components/tabs/MailSetupTab'
import ResearchParametersTab from '@/components/tabs/ResearchParametersTab'
import CampaignsTab from '@/components/tabs/CampaignsTab'
import FollowingDashboardTab from '@/components/tabs/FollowingDashboardTab'
import { isAuthenticated } from '@/lib/auth'

type TabType = 'profile' | 'mail' | 'mailsetup' | 'parameters' | 'campaigns' | 'following'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  useEffect(() => {
    const authStatus = isAuthenticated()
    setIsLoggedIn(authStatus)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setActiveTab('profile')
  }

  const handleSearchComplete = () => {
    setActiveTab('campaigns')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">Academic Email Assistant</h1>
          <AuthForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'My Profile', icon: '👤' },
    { id: 'mail' as TabType, label: 'Mail Template', icon: '✉️' },
    { id: 'mailsetup' as TabType, label: 'Mail Setup', icon: '⚙️' },
    { id: 'parameters' as TabType, label: 'Research Parameters', icon: '🔍' },
    { id: 'campaigns' as TabType, label: 'Research Campaigns', icon: '📊' },
    { id: 'following' as TabType, label: 'Following Dashboard', icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Academic Email Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  setIsLoggedIn(false)
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 py-6">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'mail' && <MailTab />}
          {activeTab === 'mailsetup' && <MailSetupTab />}
          {activeTab === 'parameters' && <ResearchParametersTab onSearchComplete={handleSearchComplete} />}
          {activeTab === 'campaigns' && <CampaignsTab />}
          {activeTab === 'following' && <FollowingDashboardTab />}
        </div>
      </main>
    </div>
  )
}
