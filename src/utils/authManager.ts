import { AppUser, UserRegistrationInput } from '../types/auth';

const STORAGE_USERS_KEY = 'KIMA_USERS_DATABASE_V1';
const STORAGE_SESSION_KEY = 'KIMA_ACTIVE_SESSION_V1';

export function getIndonesianFormattedDate(): string {
  const now = new Date();
  const dayName = now.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateStr = now.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return `${dayName}, ${dateStr} - ${timeStr} WIB`;
}

// Initial default accounts as specified:
// Administrator Utama: zulfi / artalibas942 (Hak Akses: Administrator Utama, permanent)
// Admin: bamin / bamin942 (Hak Akses: Admin, can be deleted/modified by Administrator Utama, can delete self)
// User: user / user942 (Hak Akses: User)
export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_admin_01',
    username: 'zulfi',
    password: 'artalibas942',
    namaLengkap: 'Zulfi Nur F',
    pangkat: 'Komandan KIMA',
    role: 'admin',
    isPrimaryAdmin: true,
    status: 'active',
    createdAt: 'Senin, 02 November 2026 - 06:00:00 WIB',
    notes: 'Administrator Utama Artalibas 942',
  },
  {
    id: 'user_admin_02',
    username: 'bamin',
    password: 'bamin942',
    namaLengkap: 'Bamin Kompi Markas',
    pangkat: 'Serka',
    role: 'admin',
    isPrimaryAdmin: false,
    status: 'active',
    createdAt: 'Senin, 02 November 2026 - 06:00:00 WIB',
    notes: 'Admin Kedua (Bamin KIMA)',
  },
  {
    id: 'user_operator_02',
    username: 'user',
    password: 'user942',
    namaLengkap: 'Operator Apel Kompi Markas',
    pangkat: 'Piket KIMA',
    role: 'user',
    isPrimaryAdmin: false,
    status: 'active',
    createdAt: 'Senin, 02 November 2026 - 06:00:00 WIB',
    notes: 'Operator Harian Roll Call',
  },
];

/**
 * Returns exact Indonesian display name for Hak Akses:
 * - "Administrator Utama"
 * - "Admin"
 * - "User"
 */
export function getRoleDisplayName(user: AppUser | null | undefined): 'Administrator Utama' | 'Admin' | 'User' {
  if (!user) return 'User';
  if (user.isPrimaryAdmin || user.username.toLowerCase() === 'zulfi' || user.id === 'user_admin_01') {
    return 'Administrator Utama';
  }
  if (user.role === 'admin') {
    return 'Admin';
  }
  return 'User';
}

export function sanitizeAndDeduplicateUsers(rawUsers: unknown[]): AppUser[] {
  if (!Array.isArray(rawUsers)) return [...DEFAULT_USERS];

  const seenIds = new Set<string>();
  const seenUsernames = new Set<string>();
  const cleaned: AppUser[] = [];
  let adminCount = 0;
  let hasPrimaryAdmin = false;

  for (const item of rawUsers) {
    if (!item || typeof item !== 'object') continue;
    const user = { ...(item as AppUser) };
    if (!user.id || typeof user.id !== 'string') continue;
    if (!user.username || typeof user.username !== 'string') continue;

    let lowerUsername = user.username.trim().toLowerCase();
    const id = user.id.trim();

    // Migrate previous 'admin' to 'zulfi' as requested
    if (lowerUsername === 'admin' || id === 'user_admin_01' || lowerUsername === 'zulfi') {
      lowerUsername = 'zulfi';
      user.username = 'zulfi';
      user.role = 'admin';
      user.isPrimaryAdmin = true;
      user.status = 'active';
      if (!user.password) {
        user.password = 'artalibas942';
      }
    }

    // Identify bamin as admin 2
    if (lowerUsername === 'bamin' || id === 'user_admin_02') {
      user.role = 'admin';
      user.isPrimaryAdmin = false;
      user.status = 'active';
      if (!user.password) {
        user.password = 'bamin942';
      }
    }

    // Deduplicate duplicate ID
    if (seenIds.has(id)) {
      continue;
    }

    // Deduplicate duplicate username
    if (seenUsernames.has(lowerUsername)) {
      continue;
    }

    // Handle admin role rules: exactly max 2 admins
    if (user.role === 'admin') {
      if (user.isPrimaryAdmin || lowerUsername === 'zulfi' || id === 'user_admin_01') {
        user.isPrimaryAdmin = true;
        hasPrimaryAdmin = true;
        adminCount++;
      } else {
        if (adminCount < 2) {
          adminCount++;
        } else {
          // Exceeds max 2 admins, downgrade to regular user
          user.role = 'user';
          user.isPrimaryAdmin = false;
        }
      }
    }

    seenIds.add(id);
    seenUsernames.add(lowerUsername);
    cleaned.push(user);
  }

  // Ensure Administrator Utama (zulfi) exists
  if (!hasPrimaryAdmin) {
    const filtered = cleaned.filter((u) => u.id !== 'user_admin_01' && u.username.toLowerCase() !== 'zulfi');
    filtered.unshift({ ...DEFAULT_USERS[0] });
    cleaned.length = 0;
    cleaned.push(...filtered);
  }

  // Ensure Admin Kedua (bamin) exists if total admin < 2 and no second admin exists
  const currentAdmins = cleaned.filter((u) => u.role === 'admin');
  if (currentAdmins.length < 2 && !cleaned.some((u) => u.username.toLowerCase() === 'bamin')) {
    const insertIndex = cleaned.length > 0 ? 1 : 0;
    cleaned.splice(insertIndex, 0, { ...DEFAULT_USERS[1] });
  }

  return cleaned;
}

export function loadUsersFromStorage(): AppUser[] {
  try {
    if (typeof localStorage === 'undefined') return [...DEFAULT_USERS];
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return [...DEFAULT_USERS];
    }
    const parsed = JSON.parse(raw);
    const cleaned = sanitizeAndDeduplicateUsers(parsed);
    const rawCleaned = JSON.stringify(cleaned);
    if (rawCleaned !== raw) {
      // Instantly repair and persist cleaned non-duplicate database to storage
      localStorage.setItem(STORAGE_USERS_KEY, rawCleaned);
    }
    return cleaned;
  } catch (err) {
    console.error('Failed to load users from storage, fallback to default:', err);
    return [...DEFAULT_USERS];
  }
}

export function saveUsersToStorage(users: AppUser[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const cleaned = sanitizeAndDeduplicateUsers(users);
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(cleaned));
  } catch (err) {
    console.error('Failed to save users to storage:', err);
  }
}

export function loadActiveSession(): AppUser | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load session:', err);
  }
  return null;
}

export function saveActiveSession(user: AppUser | null): void {
  try {
    if (typeof localStorage === 'undefined') return;
    if (user) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: AppUser; message: string } {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername || !cleanPassword) {
    return { success: false, message: 'Harap isi Username dan Password!' };
  }

  const users = loadUsersFromStorage();
  const targetUser = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!targetUser) {
    return { success: false, message: 'Username tidak ditemukan. Periksa kembali atau daftar baru.' };
  }

  if (targetUser.password !== cleanPassword) {
    return { success: false, message: 'Password salah! Periksa huruf besar dan kecil.' };
  }

  if (targetUser.status === 'pending') {
    return {
      success: false,
      message: 'Akun Anda masih dalam status PENDING menunggu persetujuan Admin KIMA.',
    };
  }

  if (targetUser.status === 'rejected') {
    return {
      success: false,
      message: 'Pengajuan akun ini ditolak oleh Admin. Hubungi Bamin Kompi Markas.',
    };
  }

  return { success: true, user: targetUser, message: 'Login berhasil!' };
}

export function registerNewUserRequest(input: UserRegistrationInput): { success: boolean; message: string } {
  const cleanUsername = input.username.trim().toLowerCase();
  const cleanPassword = input.password.trim();
  const cleanNama = input.namaLengkap.trim();
  const cleanPangkat = input.pangkat.trim();

  if (!cleanUsername || !cleanPassword || !cleanNama) {
    return { success: false, message: 'Semua kolom wajib diisi dengan benar!' };
  }

  if (cleanUsername === 'zulfi' || cleanUsername === 'bamin' || cleanUsername === 'admin') {
    return { success: false, message: 'Username tersebut dilindungi untuk akun Admin!' };
  }

  const users = loadUsersFromStorage();
  const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
  if (existing) {
    return { success: false, message: `Username "${cleanUsername}" sudah digunakan. Silakan gunakan username lain.` };
  }

  const newUser: AppUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    password: cleanPassword,
    namaLengkap: cleanNama,
    pangkat: cleanPangkat || 'TAMTAMA/BINTARA',
    role: 'user', // Enforce: never more than 1 admin
    status: 'pending', // Sent to admin inbox
    createdAt: getIndonesianFormattedDate(),
    notes: input.notes?.trim() || 'Pengajuan akun baru dari form login',
  };

  users.push(newUser);
  saveUsersToStorage(users);

  return {
    success: true,
    message: 'Pengajuan user baru berhasil dikirim ke kotak masuk Admin untuk persetujuan.',
  };
}

export function approvePendingUser(userId: string): AppUser[] {
  const users = loadUsersFromStorage();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, status: 'active' as const };
    }
    return u;
  });
  saveUsersToStorage(updated);
  return updated;
}

export function rejectPendingUser(userId: string): AppUser[] {
  const users = loadUsersFromStorage();
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, status: 'rejected' as const };
    }
    return u;
  });
  saveUsersToStorage(updated);
  return updated;
}

export function deleteUserAccount(
  adminUserId: string,
  targetUserId: string
): { success: boolean; message: string; updatedUsers: AppUser[] } {
  const users = loadUsersFromStorage();
  const caller = users.find((u) => u.id === adminUserId);
  const target = users.find((u) => u.id === targetUserId);

  if (!target) {
    return { success: false, message: 'User tidak ditemukan.', updatedUsers: users };
  }

  // Rule 1: Administrator Utama (Zulfi) cannot be deleted by anyone (including self, bamin, or other users)
  const isTargetPrimaryAdmin = target.isPrimaryAdmin || target.username.toLowerCase() === 'zulfi' || target.id === 'user_admin_01';
  if (isTargetPrimaryAdmin) {
    return {
      success: false,
      message: 'Administrator Utama bersifat permanen dan tidak dapat dihapus oleh siapapun!',
      updatedUsers: users,
    };
  }

  // Rule 2: Cannot delete oneself
  if (target.id === adminUserId) {
    return {
      success: false,
      message: 'Anda tidak dapat menghapus akun Anda sendiri!',
      updatedUsers: users,
    };
  }

  const isCallerPrimaryAdmin = caller?.isPrimaryAdmin || caller?.username.toLowerCase() === 'zulfi' || caller?.id === 'user_admin_01';

  // Rule 3: Target is Admin (bamin or whatever their username is). Only Administrator Utama can delete them.
  if (target.role === 'admin') {
    if (!isCallerPrimaryAdmin) {
      return {
        success: false,
        message: 'Hanya Administrator Utama yang berhak menghapus akun Admin (Bamin / siapa saja nama usernya)!',
        updatedUsers: users,
      };
    }
  }

  // Rule 4: Regular users can be deleted by Administrator Utama or Admin
  if (!isCallerPrimaryAdmin && caller?.role !== 'admin') {
    return {
      success: false,
      message: 'Hanya Administrator yang berhak menghapus akun pengguna!',
      updatedUsers: users,
    };
  }

  const filtered = users.filter((u) => u.id !== targetUserId);
  saveUsersToStorage(filtered);

  return {
    success: true,
    message: `Akun "${target.username}" (${target.namaLengkap}) dengan Hak Akses "${getRoleDisplayName(target)}" berhasil dihapus.`,
    updatedUsers: filtered,
  };
}

/**
 * Check if a username is available or already in use across the entire user database.
 */
export function checkUsernameAvailability(
  usernameInput: string,
  currentUserId?: string
): { isAvailable: boolean; message: string } {
  const clean = usernameInput.trim().toLowerCase();
  if (!clean) {
    return { isAvailable: false, message: 'Username tidak boleh kosong' };
  }
  if (clean.length < 3) {
    return { isAvailable: false, message: 'Username minimal 3 karakter' };
  }

  const users = loadUsersFromStorage();
  const existing = users.find(
    (u) => u.username.toLowerCase() === clean && u.id !== currentUserId
  );

  if (existing) {
    return {
      isAvailable: false,
      message: `Username "${clean}" sudah dipakai. Silakan pilih username lain.`,
    };
  }

  return {
    isAvailable: true,
    message: `Username "${clean}" tersedia!`,
  };
}

/**
 * Allows the currently logged in user (Admin Utama, Admin 2, or regular User) to edit their OWN credentials.
 */
export function updateOwnUserProfile(
  userId: string,
  input: {
    username: string;
    password?: string;
    namaLengkap?: string;
    pangkat?: string;
  }
): { success: boolean; message: string; updatedUser?: AppUser; updatedUsers?: AppUser[] } {
  const users = loadUsersFromStorage();
  const targetIndex = users.findIndex((u) => u.id === userId);

  if (targetIndex === -1) {
    return { success: false, message: 'User tidak ditemukan dalam database.' };
  }

  const target = users[targetIndex];
  const cleanUsername = input.username.trim().toLowerCase();
  const cleanPassword = input.password?.trim();
  const cleanNama = input.namaLengkap?.trim();
  const cleanPangkat = input.pangkat?.trim();

  if (!cleanUsername) {
    return { success: false, message: 'Username tidak boleh kosong!' };
  }

  // Check username collision if changed
  if (cleanUsername !== target.username.toLowerCase()) {
    const availability = checkUsernameAvailability(cleanUsername, userId);
    if (!availability.isAvailable) {
      return { success: false, message: availability.message };
    }
  }

  const updatedTarget: AppUser = {
    ...target,
    username: cleanUsername,
    password: cleanPassword && cleanPassword.length > 0 ? cleanPassword : target.password,
    namaLengkap: cleanNama || target.namaLengkap,
    pangkat: cleanPangkat || target.pangkat,
  };

  users[targetIndex] = updatedTarget;
  saveUsersToStorage(users);

  // Update active session if target is the currently active user
  const activeSession = loadActiveSession();
  if (activeSession && activeSession.id === userId) {
    saveActiveSession(updatedTarget);
  }

  return {
    success: true,
    message: 'Profil dan kredensial akun Anda berhasil diperbarui!',
    updatedUser: updatedTarget,
    updatedUsers: users,
  };
}

/**
 * Allows Admin Utama (Zulfi) to modify Admin 2 (Bamin)'s username and password.
 */
export function updateAdmin2Credentials(
  adminUserId: string,
  targetUserId: string,
  input: {
    username: string;
    password?: string;
    namaLengkap?: string;
    pangkat?: string;
  }
): { success: boolean; message: string; updatedUsers?: AppUser[] } {
  const users = loadUsersFromStorage();
  const caller = users.find((u) => u.id === adminUserId);

  if (!caller || (!caller.isPrimaryAdmin && caller.username.toLowerCase() !== 'zulfi')) {
    return {
      success: false,
      message: 'Hanya Admin Utama yang berhak mengubah kredensial Admin 2 (Bamin)!',
    };
  }

  const targetIndex = users.findIndex((u) => u.id === targetUserId);
  if (targetIndex === -1) {
    return { success: false, message: 'Admin 2 tidak ditemukan dalam database.' };
  }

  const target = users[targetIndex];
  if (target.isPrimaryAdmin || target.username.toLowerCase() === 'zulfi') {
    return {
      success: false,
      message: 'Tidak dapat mengubah kredensial Admin Utama melalui menu ini!',
    };
  }

  const cleanUsername = input.username.trim().toLowerCase();
  const cleanPassword = input.password?.trim();
  const cleanNama = input.namaLengkap?.trim();
  const cleanPangkat = input.pangkat?.trim();

  if (!cleanUsername) {
    return { success: false, message: 'Username tidak boleh kosong!' };
  }

  if (cleanUsername !== target.username.toLowerCase()) {
    const availability = checkUsernameAvailability(cleanUsername, targetUserId);
    if (!availability.isAvailable) {
      return { success: false, message: availability.message };
    }
  }

  const updatedTarget: AppUser = {
    ...target,
    username: cleanUsername,
    password: cleanPassword && cleanPassword.length > 0 ? cleanPassword : target.password,
    namaLengkap: cleanNama || target.namaLengkap,
    pangkat: cleanPangkat || target.pangkat,
  };

  users[targetIndex] = updatedTarget;
  saveUsersToStorage(users);

  // Update active session if target is active
  const activeSession = loadActiveSession();
  if (activeSession && activeSession.id === targetUserId) {
    saveActiveSession(updatedTarget);
  }

  return {
    success: true,
    message: `Kredensial Admin 2 (${updatedTarget.username}) berhasil diperbarui!`,
    updatedUsers: users,
  };
}

/**
 * Allows a regular user or Admin 2 (Bamin) to permanently delete their own account.
 * Immediately logs them out. Admin Utama is strictly prevented from deleting their account.
 */
export function deleteOwnUserAccount(userId: string): {
  success: boolean;
  message: string;
  updatedUsers?: AppUser[];
} {
  const users = loadUsersFromStorage();
  const target = users.find((u) => u.id === userId);

  if (!target) {
    return { success: false, message: 'Akun tidak ditemukan dalam database.' };
  }

  // Administrator Utama CANNOT delete themselves
  if (target.isPrimaryAdmin || target.username.toLowerCase() === 'zulfi' || target.id === 'user_admin_01') {
    return {
      success: false,
      message: 'Sebagai Administrator Utama, Anda tidak dapat menghapus akun Anda sendiri.',
    };
  }

  // Admin 2 (Bamin) and regular users can delete their own account
  const filtered = users.filter((u) => u.id !== userId);
  saveUsersToStorage(filtered);

  // Clear active session
  saveActiveSession(null);

  return {
    success: true,
    message: 'Akun Anda berhasil dihapus. Anda telah otomatis logout dari sistem.',
    updatedUsers: filtered,
  };
}

