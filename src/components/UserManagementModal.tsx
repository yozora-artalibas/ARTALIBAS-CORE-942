import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  Inbox,
  UserPlus,
  Check,
  AlertTriangle,
  Lock,
  UserCog,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { AppUser } from '../types/auth';
import {
  loadUsersFromStorage,
  approvePendingUser,
  rejectPendingUser,
  deleteUserAccount,
  registerNewUserRequest,
  updateOwnUserProfile,
  updateAdmin2Credentials,
  deleteOwnUserAccount,
  checkUsernameAvailability,
  getRoleDisplayName,
} from '../utils/authManager';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUsersUpdated?: () => void;
  onLogout?: () => void;
  onCurrentUserUpdated?: (user: AppUser) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUsersUpdated,
  onLogout,
  onCurrentUserUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'profile' | 'inbox' | 'create'>('profile');
  const [usersList, setUsersList] = useState<AppUser[]>(() => loadUsersFromStorage());
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Own Profile Editing State
  const [myUsername, setMyUsername] = useState<string>(currentUser.username);
  const [myPassword, setMyPassword] = useState<string>('');
  const [myNama, setMyNama] = useState<string>(currentUser.namaLengkap);
  const [myPangkat, setMyPangkat] = useState<string>(currentUser.pangkat || 'Prada');
  const [showMyPassword, setShowMyPassword] = useState<boolean>(false);
  const [showDeleteSelfConfirm, setShowDeleteSelfConfirm] = useState<boolean>(false);

  // Admin user deletion confirmation
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  // Bamin Credential Editing State (by Admin Utama)
  const [baminToEdit, setBaminToEdit] = useState<AppUser | null>(null);
  const [baminUsername, setBaminUsername] = useState<string>('');
  const [baminPassword, setBaminPassword] = useState<string>('');
  const [baminNama, setBaminNama] = useState<string>('');
  const [baminPangkat, setBaminPangkat] = useState<string>('');
  const [showBaminPassword, setShowBaminPassword] = useState<boolean>(false);

  // New user form state
  const [newUsername, setNewUsername] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [newNama, setNewNama] = useState<string>('');
  const [newPangkat, setNewPangkat] = useState<string>('Prada');
  const [newNotes, setNewNotes] = useState<string>('');

  // Live availability for profile username edit
  const myUsernameAvailability = useMemo(() => {
    if (!myUsername.trim()) return null;
    if (myUsername.trim().toLowerCase() === currentUser.username.toLowerCase()) {
      return { isAvailable: true, message: 'Username saat ini milik Anda' };
    }
    return checkUsernameAvailability(myUsername, currentUser.id);
  }, [myUsername, currentUser.id, currentUser.username]);

  // Live availability for new user creation
  const newUsernameAvailability = useMemo(() => {
    if (!newUsername.trim()) return null;
    return checkUsernameAvailability(newUsername);
  }, [newUsername]);

  // Live availability for Bamin editing by Admin Utama
  const baminUsernameAvailability = useMemo(() => {
    if (!baminToEdit || !baminUsername.trim()) return null;
    if (baminUsername.trim().toLowerCase() === baminToEdit.username.toLowerCase()) {
      return { isAvailable: true, message: 'Username saat ini milik Bamin' };
    }
    return checkUsernameAvailability(baminUsername, baminToEdit.id);
  }, [baminToEdit, baminUsername]);

  // Deduplicated users list
  const uniqueUsers = useMemo(() => {
    const seen = new Set<string>();
    return usersList.filter((u) => {
      if (!u || !u.id || seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });
  }, [usersList]);

  const isAdmin = currentUser.role === 'admin';
  const isPrimaryAdmin = currentUser.isPrimaryAdmin || currentUser.username.toLowerCase() === 'zulfi';
  const pendingUsers = uniqueUsers.filter((u) => u.status === 'pending');
  const activeUsers = uniqueUsers.filter((u) => u.status !== 'pending');
  const adminUsersCount = uniqueUsers.filter((u) => u.role === 'admin').length;

  if (!isOpen) return null;

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleUpdateMyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (myUsernameAvailability && !myUsernameAvailability.isAvailable) {
      showNotification(myUsernameAvailability.message, 'error');
      return;
    }

    const res = updateOwnUserProfile(currentUser.id, {
      username: myUsername,
      password: myPassword.trim() || undefined,
      namaLengkap: myNama,
      pangkat: myPangkat,
    });

    if (res.success && res.updatedUser) {
      if (res.updatedUsers) setUsersList(res.updatedUsers);
      showNotification(res.message);
      setMyPassword('');
      if (onCurrentUserUpdated) onCurrentUserUpdated(res.updatedUser);
      if (onUsersUpdated) onUsersUpdated();
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleDeleteSelf = () => {
    // Only Admin Utama is prevented from deleting self
    if (isPrimaryAdmin) {
      showNotification('Sebagai Admin Utama, Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }

    const res = deleteOwnUserAccount(currentUser.id);
    if (res.success) {
      showNotification(res.message);
      setShowDeleteSelfConfirm(false);
      onClose();
      if (onLogout) {
        onLogout();
      }
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleOpenEditBamin = (user: AppUser) => {
    setBaminToEdit(user);
    setBaminUsername(user.username);
    setBaminPassword('');
    setBaminNama(user.namaLengkap);
    setBaminPangkat(user.pangkat || 'Serka');
    setShowBaminPassword(false);
  };

  const handleSaveBamin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!baminToEdit) return;
    if (baminUsernameAvailability && !baminUsernameAvailability.isAvailable) {
      showNotification(baminUsernameAvailability.message, 'error');
      return;
    }

    const res = updateAdmin2Credentials(currentUser.id, baminToEdit.id, {
      username: baminUsername,
      password: baminPassword.trim() || undefined,
      namaLengkap: baminNama,
      pangkat: baminPangkat,
    });

    if (res.success) {
      showNotification(res.message, 'success');
      setBaminToEdit(null);
      if (res.updatedUsers) {
        setUsersList(res.updatedUsers);
      }
      onUsersUpdated?.();
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleApprove = (userId: string) => {
    if (!isAdmin) return;
    const updated = approvePendingUser(userId);
    setUsersList(updated);
    showNotification('User berhasil disetujui dan kini dapat login!');
    if (onUsersUpdated) onUsersUpdated();
  };

  const handleReject = (userId: string) => {
    if (!isAdmin) return;
    const updated = rejectPendingUser(userId);
    setUsersList(updated);
    showNotification('User berhasil ditolak!', 'error');
    if (onUsersUpdated) onUsersUpdated();
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete || !isAdmin) return;

    if (userToDelete.isPrimaryAdmin || userToDelete.username.toLowerCase() === 'zulfi') {
      showNotification('Admin Utama tidak dapat dihapus oleh siapapun!', 'error');
      setUserToDelete(null);
      return;
    }

    if (userToDelete.role === 'admin' && !isPrimaryAdmin) {
      showNotification('Hanya Admin Utama yang berhak menghapus Admin 2 (Bamin)!', 'error');
      setUserToDelete(null);
      return;
    }

    const res = deleteUserAccount(currentUser.id, userToDelete.id);
    if (res.success) {
      setUsersList(res.updatedUsers);
      showNotification(res.message);
      setUserToDelete(null);
      if (onUsersUpdated) onUsersUpdated();
    } else {
      showNotification(res.message, 'error');
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUsernameAvailability && !newUsernameAvailability.isAvailable) {
      showNotification(newUsernameAvailability.message, 'error');
      return;
    }

    const res = registerNewUserRequest({
      username: newUsername,
      password: newPassword,
      namaLengkap: newNama,
      pangkat: newPangkat,
      notes: newNotes,
    });

    if (res.success) {
      const reloaded = loadUsersFromStorage();
      setUsersList(reloaded);
      showNotification('User baru berhasil didaftarkan dan masuk ke Kotak Masuk Persetujuan!');
      setNewUsername('');
      setNewPassword('');
      setNewNama('');
      setNewNotes('');
      if (isAdmin) {
        setActiveTab('inbox');
      } else {
        setActiveTab('list');
      }
      if (onUsersUpdated) onUsersUpdated();
    } else {
      showNotification(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-800/95 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Manajemen Data User & Akun Pengguna
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                    isPrimaryAdmin
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isAdmin
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isPrimaryAdmin ? 'ADMINISTRATOR UTAMA' : isAdmin ? 'ADMIN' : 'USER'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isPrimaryAdmin
                  ? 'Hak Akses Administrator Utama: Ubah kredensial Anda, kelola & hapus akun Admin/User, serta persetujuan kotak masuk.'
                  : isAdmin
                  ? 'Hak Akses Admin: Kelola akun & apel, persetujuan kotak masuk, atau hapus user.'
                  : 'Hak Akses User: Ubah profil & password Anda, hapus akun sendiri, atau lihat daftar pengguna.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Profil & Akun Saya</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data User ({activeUsers.length})</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab('inbox')}
              className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
                activeTab === 'inbox'
                  ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Kotak Masuk</span>
              {pendingUsers.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                  {pendingUsers.length} Baru
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex-1 min-w-[140px] py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'create'
                ? 'bg-slate-800 text-purple-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Buat User Baru</span>
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{toast.text}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB: PROFIL & AKUN SAYA */}
          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                  <UserCog className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-white text-sm">
                    {isPrimaryAdmin
                      ? 'Pengaturan Kredensial Administrator Utama'
                      : isAdmin
                      ? 'Pengaturan Kredensial Admin'
                      : 'Pengaturan Akun Pribadi User'}
                  </p>
                  <p className="text-slate-400">
                    {isPrimaryAdmin
                      ? 'Sebagai Administrator Utama, Anda dapat mengubah username dan password Anda sendiri. Anda memiliki hak akses untuk menghapus akun Admin kedua (Bamin / siapa saja nama usernya) dan seluruh user biasa, namun tidak dapat menghapus akun Anda sendiri.'
                      : isAdmin
                      ? 'Sebagai Admin, Anda dapat mengubah username dan password Anda sendiri, serta menghapus akun Anda sendiri. Anda tidak dapat menghapus akun Administrator Utama.'
                      : 'Sebagai User, Anda dapat mengubah username dan password akun Anda sendiri, serta menghapus akun Anda secara mandiri.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateMyProfile} className="space-y-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Username Anda :
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={myUsername}
                      onChange={(e) => setMyUsername(e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                        myUsernameAvailability
                          ? myUsernameAvailability.isAvailable
                            ? 'border-emerald-500/80 focus:ring-1 focus:ring-emerald-500'
                            : 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-700 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                    {myUsernameAvailability && (
                      <div className="absolute right-3 top-2.5">
                        {myUsernameAvailability.isAvailable ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <X className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {myUsernameAvailability && (
                    <p
                      className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
                        myUsernameAvailability.isAvailable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>{myUsernameAvailability.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password Baru :
                  </label>
                  <div className="relative">
                    <input
                      type={showMyPassword ? 'text' : 'password'}
                      value={myPassword}
                      onChange={(e) => setMyPassword(e.target.value)}
                      placeholder="Biarkan kosong jika tidak ingin mengubah password..."
                      className="w-full pl-3 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowMyPassword(!showMyPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showMyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    *Kosongkan kolom ini jika tetap menggunakan password saat ini.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nama Lengkap :
                    </label>
                    <input
                      type="text"
                      required
                      value={myNama}
                      onChange={(e) => setMyNama(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pangkat :
                    </label>
                    <input
                      type="text"
                      required
                      value={myPangkat}
                      onChange={(e) => setMyPangkat(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={Boolean(myUsernameAvailability && !myUsernameAvailability.isAvailable)}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all focus:ring-2 focus:ring-emerald-400/50 cursor-pointer ${
                      myUsernameAvailability && !myUsernameAvailability.isAvailable
                        ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    }`}
                  >
                    Simpan Perubahan Profil & Kredensial
                  </button>
                </div>
              </form>

              {/* Danger Zone: Regular User and Admin 2 (Bamin) can delete their own account */}
              {!isPrimaryAdmin ? (
                <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <h5 className="text-xs font-bold uppercase tracking-wider">
                      Zona Berbahaya: Hapus Akun Saya Sendiri
                    </h5>
                  </div>
                  <p className="text-xs text-slate-400">
                    Jika Anda menghapus akun ini, seluruh hak akses Anda akan dihapus secara permanen dan Anda akan otomatis langsung keluar (log out) dari aplikasi.
                  </p>

                  {!showDeleteSelfConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteSelfConfirm(true)}
                      className="px-4 py-2 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 border border-rose-500/50 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Akun Saya Sendiri</span>
                    </button>
                  ) : (
                    <div className="p-3.5 bg-rose-900/40 border border-rose-600 rounded-lg space-y-2">
                      <p className="text-xs text-rose-200 font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                        Konfirmasi: Yakin ingin menghapus akun Anda dan otomatis log out sekarang?
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDeleteSelf}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          Ya, Hapus Akun & Log Out
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteSelfConfirm(false)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-amber-950/20 border border-amber-900/60 rounded-xl p-4 text-xs text-amber-300/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Shield className="w-4 h-4" />
                    <span>Perlindungan Akun Administrator Utama</span>
                  </div>
                  <p>
                    Sebagai Administrator Utama, akun Anda dilindungi sistem secara permanen dan tidak dapat dihapus oleh siapapun termasuk diri sendiri.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: DATA USER LIST */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin Terdaftar: {adminUsersCount} / 2 (Maksimal 2 Admin)
                  </span>
                  <span className="text-xs text-slate-400">
                    Administrator Utama: <strong className="text-white">zulfi</strong> | Admin: <strong className="text-white">bamin</strong>
                  </span>
                </div>
                <span className="text-xs text-slate-400">Total Akun: <strong className="text-white">{activeUsers.length}</strong></span>
              </div>

              {/* Inline Bamin Editor by Administrator Utama */}
              {baminToEdit && isPrimaryAdmin && (
                <div className="p-4 bg-sky-950/40 border border-sky-600 rounded-xl space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                      <KeyRound className="w-4 h-4 text-sky-400" />
                      <span>Ubah Username & Password Admin ({baminToEdit.username}) oleh Administrator Utama</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBaminToEdit(null)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                  <form onSubmit={handleSaveBamin} className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Username Bamin:</label>
                      <input
                        type="text"
                        value={baminUsername}
                        onChange={(e) => setBaminUsername(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                        required
                      />
                      {baminUsernameAvailability && (
                        <p className={`text-[10px] mt-0.5 ${baminUsernameAvailability.isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {baminUsernameAvailability.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Password Baru Bamin:</label>
                      <div className="relative">
                        <input
                          type={showBaminPassword ? 'text' : 'password'}
                          value={baminPassword}
                          onChange={(e) => setBaminPassword(e.target.value)}
                          placeholder="Biarkan kosong jika tidak ingin ubah password..."
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBaminPassword(!showBaminPassword)}
                          className="absolute right-2 top-2 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showBaminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap:</label>
                      <input
                        type="text"
                        value={baminNama}
                        onChange={(e) => setBaminNama(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Pangkat:</label>
                      <input
                        type="text"
                        value={baminPangkat}
                        onChange={(e) => setBaminPangkat(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setBaminToEdit(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={baminUsernameAvailability !== null && !baminUsernameAvailability.isAvailable}
                        className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        Simpan Kredensial Admin
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Inline deletion confirmation modal for Admin */}
              {userToDelete && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-600 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      Hapus permanen akun <strong>{userToDelete.username}</strong> ({userToDelete.namaLengkap}) [Hak Akses: <strong>{getRoleDisplayName(userToDelete)}</strong>]?
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmDeleteUser}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserToDelete(null)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="px-3 py-2.5">No</th>
                      <th className="px-3 py-2.5">Username</th>
                      <th className="px-3 py-2.5">Nama Lengkap</th>
                      <th className="px-3 py-2.5">Pangkat</th>
                      <th className="px-3 py-2.5">Hak Akses</th>
                      <th className="px-3 py-2.5">Status</th>
                      <th className="px-3 py-2.5">Dibuat Pada</th>
                      <th className="px-3 py-2.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {activeUsers.map((u, idx) => {
                      const isTargetPrimaryAdmin = u.isPrimaryAdmin || u.username.toLowerCase() === 'zulfi';
                      const isTargetAdmin2 = u.role === 'admin' && !isTargetPrimaryAdmin;
                      const isMe = u.id === currentUser.id;

                      return (
                        <tr
                          key={`${u.id}-${idx}`}
                          className={`hover:bg-slate-850/60 transition-colors ${
                            isMe ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5 font-mono text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2.5 font-mono font-bold text-white flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {isMe && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-sans">
                                Anda
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-slate-200">
                            {u.namaLengkap}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-emerald-400">
                            {u.pangkat || '-'}
                          </td>
                          <td className="px-3 py-2.5">
                            {isTargetPrimaryAdmin ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                <Shield className="w-3 h-3 text-amber-400" />
                                Administrator Utama
                              </span>
                            ) : isTargetAdmin2 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                                <Shield className="w-3 h-3 text-sky-400" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                User
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {u.status === 'active' ? 'AKTIF' : 'DITOLAK'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-[11px] text-slate-400">
                            {u.createdAt}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {isTargetPrimaryAdmin ? (
                              <span
                                className="text-[10px] text-amber-400 font-mono italic"
                                title="Administrator Utama bersifat permanen dan tidak dapat dihapus oleh siapapun"
                              >
                                Permanen
                              </span>
                            ) : isTargetAdmin2 ? (
                              isPrimaryAdmin ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditBamin(u)}
                                    className="px-2 py-1 rounded bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                    title={`Ubah username & password Admin (${u.username})`}
                                  >
                                    <KeyRound className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setUserToDelete(u)}
                                    className="p-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                                    title={`Hapus Admin (${u.username})`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : isMe ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('profile')}
                                  className="text-[10px] text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
                                >
                                  Edit Akun Saya
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500">-</span>
                              )
                            ) : isAdmin ? (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                                title="Hapus user ini dari sistem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : isMe ? (
                              <button
                                type="button"
                                onClick={() => setActiveTab('profile')}
                                className="text-[10px] text-emerald-400 underline hover:text-emerald-300 cursor-pointer"
                              >
                                Edit Saya
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: INBOX PERSATUJUAN (ADMIN ONLY) */}
          {activeTab === 'inbox' && isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Kotak Masuk Persetujuan Pengajuan User Baru
                  </h4>
                  <p className="text-xs text-slate-400">
                    Pilih Setujui untuk mengaktifkan user atau Tolak untuk membatalkan pengajuan.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {pendingUsers.length} Permohonan Tertunda
                </span>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="p-10 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                  <Inbox className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-bold text-slate-400">Kotak Masuk Bersih</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tidak ada pengajuan akun baru yang membutuhkan persetujuan Admin saat ini.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pendingUsers.map((user, idx) => (
                    <div
                      key={`${user.id}-${idx}`}
                      className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {user.namaLengkap}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            {user.pangkat}
                          </span>
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            @{user.username}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Catatan: {user.notes || '-'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Diajukan pada: {user.createdAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApprove(user.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Setujui Akun</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(user.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-200 border border-rose-500/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: BUAT USER BARU */}
          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-1">
                  Pendaftaran User Baru
                </h4>
                <p className="text-xs text-slate-400">
                  {isAdmin
                    ? 'Buat akun operator baru. Akun akan langsung masuk ke Kotak Masuk untuk persetujuan resmi.'
                    : 'Ajukan akun baru untuk rekan operator. Permohonan akan diverifikasi oleh Admin.'}
                </p>
              </div>

              <form onSubmit={handleCreateNewUser} className="space-y-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Username Baru :
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Contoh: ton_ang942, provost_kima..."
                      className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors ${
                        newUsernameAvailability
                          ? newUsernameAvailability.isAvailable
                            ? 'border-emerald-500/80 focus:ring-1 focus:ring-emerald-500'
                            : 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-700 focus:ring-1 focus:ring-emerald-500'
                      }`}
                    />
                    {newUsernameAvailability && (
                      <div className="absolute right-3 top-2.5">
                        {newUsernameAvailability.isAvailable ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <X className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {newUsernameAvailability && (
                    <p
                      className={`text-[11px] font-medium mt-1 flex items-center gap-1 ${
                        newUsernameAvailability.isAvailable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      <span>{newUsernameAvailability.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password Akun :
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 4 karakter..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nama Lengkap :
                    </label>
                    <input
                      type="text"
                      required
                      value={newNama}
                      onChange={(e) => setNewNama(e.target.value)}
                      placeholder="Nama personel..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pangkat :
                    </label>
                    <input
                      type="text"
                      required
                      value={newPangkat}
                      onChange={(e) => setNewPangkat(e.target.value)}
                      placeholder="Serda, Prada..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Catatan Seksi Organik :
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Contoh: Piket Ton Hub, Bamin Kompi..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={Boolean(newUsernameAvailability && !newUsernameAvailability.isAvailable)}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all focus:ring-2 focus:ring-purple-400/50 cursor-pointer ${
                      newUsernameAvailability && !newUsernameAvailability.isAvailable
                        ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                    }`}
                  >
                    Kirim Permohonan User Baru
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistem Autentikasi Pengguna KIMA 942</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
