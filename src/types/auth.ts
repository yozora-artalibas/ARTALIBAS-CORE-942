export type UserRole = 'admin' | 'user';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  namaLengkap: string;
  pangkat?: string;
  role: UserRole;
  isPrimaryAdmin?: boolean; // true for Super Admin (Zulfi), false for Admin 2 (Bamin)
  status: 'active' | 'pending' | 'rejected';
  createdAt: string; // e.g. "Senin, 02 November 2026 - 19:26 WIB"
  notes?: string;
}

export interface UserRegistrationInput {
  username: string;
  password: string;
  namaLengkap: string;
  pangkat: string;
  notes?: string;
}
