'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import UploadForm from '@/components/UploadForm'
import SearchConfig from '@/components/SearchConfig'
import AcademicsDashboard from '@/components/AcademicsDashboard'
import EmailStatusTracker from '@/components/EmailStatusTracker'
import { getAuthToken, isAuthenticated } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentStep, setCurrentStep] = useState<'auth' | 'upload' | 'search' | 'dashboard'>('auth')
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    const authStatus = isAuthenticated()
    setIsLoggedIn(authStatus)
    if (authStatus) {
      setCurrentStep('upload')
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setCurrentStep('upload')
  }

  const handleProfileComplete = () => {
    setHasProfile(true)
    setCurrentStep('search')
  }

  const handleSearchComplete = () => {
    setCurrentStep('dashboard')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <h1 className="text-3xl font-bold text-center">Academic Email Assistant</h1>
          <AuthForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Academic Email Assistant</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token')
                  setIsLoggedIn(false)
                  setCurrentStep('auth')
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
        {currentStep === 'upload' && (
          <div className="px-4 py-6">
            <UploadForm onComplete={handleProfileComplete} />
          </div>
        )}

        {currentStep === 'search' && (
          <div className="px-4 py-6">
            <SearchConfig onComplete={handleSearchComplete} />
          </div>
        )}

        {currentStep === 'dashboard' && (
          <div className="px-4 py-6">
            <AcademicsDashboard />
            <div className="mt-8">
              <EmailStatusTracker />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
