import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const authApi = {
  register: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/register', { email, password })
    return response.data
  },
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { email, password })
    return response.data
  },
  getMe: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },
}

// Profile APIs
export const profileApi = {
  upload: async (formData: FormData) => {
    const response = await apiClient.post('/api/profile/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  get: async () => {
    const response = await apiClient.get('/api/profile')
    return response.data
  },
  getProfile: async () => {
    const response = await apiClient.get('/api/profile')
    return response.data
  },
}

// Search APIs
export const searchApi = {
  searchAcademics: async (universities: string[], researchDomain: string) => {
    const response = await apiClient.post('/api/search/academics', {
      universities,
      research_domain: researchDomain,
    })
    return response.data
  },
  getAcademics: async () => {
    const response = await apiClient.get('/api/search/academics')
    return response.data
  },
}

// Email APIs
export const emailApi = {
  generate: async (academicId: number) => {
    const response = await apiClient.post('/api/emails/generate', { academic_id: academicId })
    return response.data
  },
  send: async (campaignId: number, emailService: string) => {
    const response = await apiClient.post('/api/emails/send', {
      campaign_id: campaignId,
      email_service: emailService,
    })
    return response.data
  },
  getCampaigns: async () => {
    const response = await apiClient.get('/api/emails/campaigns')
    return response.data
  },
  updateStatus: async (campaignId: number, status: string) => {
    const response = await apiClient.patch(`/api/emails/campaigns/${campaignId}/status`, { status })
    return response.data
  },
}

// Campaign APIs
export const campaignApi = {
  addToList: async (academicId: number) => {
    const response = await apiClient.post(`/api/campaigns/academics/${academicId}/select`)
    return response.data
  },
  removeFromList: async (academicId: number) => {
    const response = await apiClient.delete(`/api/campaigns/academics/${academicId}/select`)
    return response.data
  },
  getSelectedAcademics: async () => {
    const response = await apiClient.get('/api/campaigns/academics/selected')
    return response.data
  },
  isSelected: async (academicId: number) => {
    const response = await apiClient.get(`/api/campaigns/academics/${academicId}/is-selected`)
    return response.data
  },
}
