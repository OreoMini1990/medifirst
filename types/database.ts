export type UserRole = 
  | 'doctor'        // 의사
  | 'locum_doctor'  // 봉직의 (페닥)
  | 'manager'       // 원장
  | 'nurse'         // 간호사
  | 'assistant'     // 간호조무사
  | 'pt'            // 물리치료사
  | 'rt'            // 방사선사
  | 'cp'            // 임상병리사 (임병)
  | 'admin_staff'   // 원무 (행정)
  | 'etc'           // 기타

export type BoardType = 
  | 'community' 
  | 'startup' 
  | 'claims' 
  | 'academy'

export type CommunitySubBoard = 
  | 'role' 
  | 'free' 
  | 'qa'
  | 'marketplace'

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
  workplace_name: string | null  // 근무지 이름 (병원명, 의원명 등)
  workplace_type: string | null  // 'clinic' | 'hospital' | 'etc' (선택사항)
  avatar_url?: string | null  // 프로필 이미지 URL
  created_at: string
  updated_at: string
  // 하위 호환성을 위해 hospital_name도 유지 (deprecated)
  hospital_name?: string | null
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
  view_count?: number
  like_count?: number
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
  parent_id: string | null
  content: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  like_count?: number
  profiles?: {
    display_name: string | null
    role: UserRole | null
  }
  replies?: Comment[]
}

export interface Job {
  id: string
  hospital_id: string | null
  title: string
  position: UserRole
  description: string
  region: string
  specialty: string | null
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
