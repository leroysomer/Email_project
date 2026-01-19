export interface Academic {
  id: number
  name: string
  title: string | null
  email: string | null
  university_id: number | null
  university_name: string | null
  research_interests: string | null
  theme: string | null
  description: string | null
  bio: string | null
  profile_url: string | null
  website: string | null
}

export interface EmailCampaign {
  id: number
  user_id: number
  academic_id: number
  academic_name: string
  status: 'draft' | 'sent' | 'no_response' | 'received'
  generated_email: string | null
  created_at: string
  sent_at: string | null
}

export interface UserProfile {
  user_id: number
  resume_path: string | null
  interests_json: string | null
  email_template: string | null
}
