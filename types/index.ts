// Generic API Response
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  error: string | null;
}

// Auth
export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: {
    AccessToken: string;
  };
  user: {
    id: string;
    nama: string;
    email: string;
  };
}

// User
export interface User {
  id: string;
  nama: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserListParams {
  q?: string;
  pageSize?: number;
  pageNumber?: number;
  sortBy?: string;
  sortType?: "ASC" | "DESC";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pageSize: number;
  pageNumber: number;
}

export interface CreateUserPayload {
  nama: string;
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  id: string;
  nama: string;
  email: string;
  password?: string;
}

// Profile
export interface Profile {
  id: number;
  name: string;
  role: string;
  bio: string;
  about_text: string;
  avatar_url: string;
  is_available: boolean;
  email: string;
  social_github: string;
  social_linkedin: string;
}

export interface UpdateProfilePayload {
  name: string;
  role: string;
  bio: string;
  about_text: string;
  avatar_url: string;
  is_available: boolean;
  email: string;
  social_github: string;
  social_linkedin: string;
}

// Experience
export type ExperienceType = "work" | "edu";

export interface Experience {
  id: number;
  type: ExperienceType;
  title: string;
  organization: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  display_order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperiencePayload {
  type: ExperienceType;
  title: string;
  organization: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  display_order: number;
}

// Project
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  image_url: string;
  tools: string[];
  demo_url: string;
  repo_url: string;
  color_theme: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectPayload {
  title: string;
  slug: string;
  description: string;
  category: string;
  image_url: string;
  tools: string[];
  demo_url: string;
  repo_url: string;
  color_theme: string;
}

// Skill
export interface SkillItem {
  id: number;
  category_id?: number;
  name: string;
  proficiency: number;
}

export interface SkillCategory {
  id: number;
  name: string;
  icon_name: string;
  color_theme: string;
  skills: SkillItem[];
}

export interface SkillCategoryPayload {
  name: string;
  icon_name: string;
  color_theme: string;
}

export interface SkillItemPayload {
  category_id: number;
  name: string;
  proficiency: number;
}
