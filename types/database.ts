export type UserRole = 
  | 'doctor' 
  | 'nurse' 
  | 'assistant' 
  | 'pt' 
  | 'rt' 
  | 'admin_staff'

export type BoardType = 
  | 'community' 
  | 'startup' 
  | 'claims' 
  | 'academy'

export type CommunitySubBoard = 
  | 'role' 
  | 'free' 
  | 'qa'

export type StartupCategory = 
  | 'site'         // 개원입지
  | 'loan'         // 대출
  | 'interior'     // 인테리어
  | 'law'          // 법률
  | 'labor'        // 노무
  | 'tax'          // 세무
  | 'marketing'    // 병원홍보
  | 'equipment_it' // 의료기기·IT
  | 'network'      // 네트워크
  | 'ops_support'  // 운영지원

export type EmploymentType = 
  | 'full_time' 
  | 'part_time' 
  | 'locum'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  role: UserRole | null
  hospital_name: string | null
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  board: BoardType
  sub_board: CommunitySubBoard | null
  category: string | null
  title: string
  content: string
  is_question: boolean
  is_pinned: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  profiles?: {
    display_name: string | null
    role: UserRole | null
  }
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  profiles?: {
    display_name: string | null
    role: UserRole | null
  }
}

export interface Job {
  id: string
  hospital_id: string | null
  title: string
  position: UserRole
  description: string
  region: string
  employment_type: EmploymentType
  salary_range: string | null
  contact: string
  created_at: string
  updated_at: string
  profiles?: {
    display_name: string | null
    hospital_name: string | null
  }
}

export interface Resume {
  id: string
  user_id: string
  position: UserRole
  intro: string
  experience_text: string
  preferred_region: string
  preferred_type: EmploymentType
  created_at: string
  updated_at: string
}
