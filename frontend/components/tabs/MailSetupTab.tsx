'use client'

import { useState, useEffect } from 'react'
import { profileApi } from '@/lib/api'

type EmailService = 'gmail' | 'academic' | null

export default function MailSetupTab() {
  const [emailService, setEmailService] = useState<EmailService>(null)
  
  // Gmail OAuth
  const [gmailConnected, setGmailConnected] = useState(false)
  
  // Academic Email (IMAP/SMTP)
  const [academicEmail, setAcademicEmail] = useState('')
  const [imapHost, setImapHost] = useState('')
  const [imapPort, setImapPort] = useState('993')
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [emailPassword, setEmailPassword] = useState('')
  
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
      if (data.email_service) {
        setEmailService(data.email_service as EmailService)
      }
      if (data.academic_email) setAcademicEmail(data.academic_email)
      if (data.imap_host) setImapHost(data.imap_host)
      if (data.imap_port) setImapPort(data.imap_port)
      if (data.smtp_host) setSmtpHost(data.smtp_host)
      if (data.smtp_port) setSmtpPort(data.smtp_port)
      // Don't load password for security
    } catch (err: any) {
      console.log('No profile yet')
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleGmailConnect = () => {
    setError('Gmail OAuth integration is not yet implemented. Coming soon!')
  }

  const handleAcademicEmailSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('email_service', 'academic')
      formData.append('academic_email', academicEmail)
      formData.append('imap_host', imapHost)
      formData.append('imap_port', imapPort)
      formData.append('smtp_host', smtpHost)
      formData.append('smtp_port', smtpPort)
      formData.append('email_password', emailPassword)

      await profileApi.upload(formData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save email configuration')
    } finally {
      setLoading(false)
    }
  }

  const handlePolytechniqueAutoConfig = () => {
    setImapHost('webmail.polytechnique.fr')
    setImapPort('993')
    setSmtpHost('webmail.polytechnique.fr')
    setSmtpPort('587')
    setError('')
    setSuccess(false)
  }

  if (loadingProfile) {
    return <div className="text-center py-8 text-gray-900">Loading email settings...</div>
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Mail Sending Setup</h2>

      <p className="text-gray-600 mb-6">
        Configure how you want to send emails to academics. Choose between Gmail or your academic email.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Email configuration saved successfully!
        </div>
      )}

      {/* Email Service Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Select Email Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setEmailService('gmail')}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              emailService === 'gmail'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">📧</span>
              <h4 className="text-lg font-semibold text-gray-900">Gmail</h4>
            </div>
            <p className="text-sm text-gray-600">
              Connect your Gmail account using OAuth (secure, no password needed)
            </p>
          </button>

          <button
            onClick={() => setEmailService('academic')}
            className={`p-6 border-2 rounded-lg text-left transition-all ${
              emailService === 'academic'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">🎓</span>
              <h4 className="text-lg font-semibold text-gray-900">Academic Email</h4>
            </div>
            <p className="text-sm text-gray-600">
              Use your university/academic email with IMAP/SMTP configuration
            </p>
          </button>
        </div>
      </div>

      {/* Gmail Configuration */}
      {emailService === 'gmail' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Gmail OAuth Setup</h3>
          <p className="text-gray-600 mb-4">
            Connect your Gmail account to send emails. This uses Google's secure OAuth, so we never see your password.
          </p>
          <button
            onClick={handleGmailConnect}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            {gmailConnected ? '✓ Gmail Connected' : 'Connect Gmail Account'}
          </button>
        </div>
      )}

      {/* Academic Email Configuration */}
      {emailService === 'academic' && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Academic Email Configuration (IMAP/SMTP)</h3>
          
          {/* Quick Config Button */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">École Polytechnique Student?</p>
                <p className="text-sm text-gray-600">Click to auto-configure your email settings</p>
              </div>
              <button
                type="button"
                onClick={handlePolytechniqueAutoConfig}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium whitespace-nowrap"
              >
                🎓 Auto-Config Polytechnique
              </button>
            </div>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-md text-sm text-gray-700">
            <p className="font-semibold mb-2">About IMAP and SMTP:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>IMAP</strong> (port 993): Reads and synchronizes emails from the server (SSL/TLS)</li>
              <li><strong>SMTP</strong> (port 587): Sends emails to recipients (STARTTLS)</li>
            </ul>
            <p className="mt-2">
              Contact your university IT department if you need help finding these settings.
            </p>
          </div>

          <form onSubmit={handleAcademicEmailSetup} className="space-y-6">
            <div>
              <label htmlFor="academicEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Academic Email Address *
              </label>
              <input
                id="academicEmail"
                type="email"
                value={academicEmail}
                onChange={(e) => setAcademicEmail(e.target.value)}
                placeholder="your.name@university.edu"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="imapHost" className="block text-sm font-medium text-gray-700 mb-2">
                  IMAP Server (SSL/TLS) *
                </label>
                <input
                  id="imapHost"
                  type="text"
                  value={imapHost}
                  onChange={(e) => setImapHost(e.target.value)}
                  placeholder="imap.university.edu or webmail.polytechnique.fr"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Secure connection with SSL/TLS encryption
                </p>
              </div>

              <div>
                <label htmlFor="imapPort" className="block text-sm font-medium text-gray-700 mb-2">
                  IMAP Port *
                </label>
                <input
                  id="imapPort"
                  type="number"
                  value={imapPort}
                  onChange={(e) => setImapPort(e.target.value)}
                  placeholder="993"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Standard SSL/TLS port: 993
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Server (STARTTLS) *
                </label>
                <input
                  id="smtpHost"
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.university.edu or webmail.polytechnique.fr"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Secure connection with STARTTLS encryption
                </p>
              </div>

              <div>
                <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Port *
                </label>
                <input
                  id="smtpPort"
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  STARTTLS port: 587 | SSL port: 465
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Email Password *
              </label>
              <input
                id="emailPassword"
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Your email password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Your password is encrypted and stored securely
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Email Configuration'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Make sure your university allows IMAP/SMTP access. Some universities require you to enable "less secure apps" or create an "app password" for third-party email clients.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
