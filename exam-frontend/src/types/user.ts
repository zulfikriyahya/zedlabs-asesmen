// src/types/user.ts
export type UserRole = 'siswa' | 'guru' | 'pengawas' | 'operator' | 'superadmin';

export interface User {
  id: number;
  school_id: number;
  username: string;
  email: string;
  role: UserRole;
  full_name: string;
  photo_url?: string;
  device_fingerprint?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  role: 'siswa';
  student_id: string;
  class_id?: number;
  class_name?: string;
}

export interface Teacher extends User {
  role: 'guru';
  teacher_id: string;
  subjects?: string[];
}

export interface Proctor extends User {
  role: 'pengawas';
}

export interface Operator extends User {
  role: 'operator';
}

export interface SuperAdmin extends User {
  role: 'superadmin';
}