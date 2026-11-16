import React, { useState, useMemo } from 'react';
import { Lock, User, UserPlus, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff, Check, X, Download, ExternalLink } from 'lucide-react';
import { authenticateUser, registerNewUserRequest, checkUsernameAvailability } from '../utils/authManager';
import { AppUser } from '../types/auth';
import { usePWAInstall } from '../hooks/usePWAInstall';
const APP_LOGO_URL = '/assets/aistudio/file_00000000adb882118c0986c80aed6bf3_781e86f5.png';

interface LoginFormProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const { isInstallable, isInstalled, isInIframe, isTemporaryPreview, install } = usePWAInstall();

  // Login inputs
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register inputs
  const [regUsername, setRegUsername] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regNama, setRegNama] = useState<string>('');
  const [regPangkat, setRegPangkat] = useState<string>('Prada');
  const [regNotes, setRegNotes] = useState<string>('');

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const usernameAvailability = useMemo(() => {
    if (!regUsername.trim()) return null;
    return checkUsernameAvailability(regUsername);
  }, [regUsername]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = authenticateUser(username, password);
    if (!result.success || !result.user) {
      setErrorMessage(result.message);
      return;
    }

    onLoginSuccess(result.user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = registerNewUserRequest({
      username: regUsername,
      password: regPassword,
      namaLengkap: regNama,
      pangkat: regPangkat,
      notes: regNotes,
    });

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setSuccessMessage(result.message);
    setRegUsername('');
    setRegPassword('');
    setRegNama('');
    setRegNotes('');
    setTimeout(() => {
      setIsRegisterMode(false);
      setSuccessMessage('Silakan hubungi Admin untuk menyetujui akun Anda.');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0b141a] flex flex-col items-center justify-center p-4 selection:bg-[#00a884] selection:text-[#0b141a]">
      <div className="w-full max-w-md bg-[#111b21] border border-[#2a3942] rounded-2xl shadow-2xl overflow-hidden">
        {/* Clean Unit Header */}
        <div className="px-6 py-6 bg-[#111b21] border-b border-[#2a3942] text-center">
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-[#00a884] mb-3 bg-white p-1 shadow-md">
            <img
              src={APP_LOGO_URL}
              alt="Logo ARTALIBAS CORE 942"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-[18px] font-bold tracking-tight text-[#e9edef]">
            Apel Kompi Markas 942
          </h1>
          <p className="text-[12px] font-medium text-[#00a884] mt-0.5">
            Yonif TP 942 / Arya Wangsakara
          </p>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#0b141a] border-b border-[#2a3942] text-[13px] font-semibold gap-1">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`min-h-[42px] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              !isRegisterMode
                ? 'bg-[#202c33] text-[#00a884]'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`min-h-[42px] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isRegisterMode
                ? 'bg-[#202c33] text-[#00a884]'
                : 'text-[#8696a0] hover:text-[#e9edef]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#00a884]/15 border border-[#00a884]/30 text-[#e9edef] text-[13px] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#00a884]" />
              <span>{successMessage}</span>
            </div>
          )}

          {!isRegisterMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login_username" className="block text-[13px] font-semibold text-[#aebac1] mb-1.5">
                  Username :
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login_username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username..."
                    className="w-full min-h-[46px] pl-10 pr-3 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-xl text-[15px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login_password" className="block text-[13px] font-semibold text-[#aebac1] mb-1.5">
                  Password :
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8696a0] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="login_password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password..."
                    className="w-full min-h-[46px] pl-10 pr-12 py-2.5 bg-[#202c33] border border-[#2a3942] rounded-xl text-[15px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[42px] min-h-[42px] flex items-center justify-center text-[#8696a0] hover:text-[#e9edef] cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn_login_submit"
                className="w-full min-h-[48px] py-2.5 px-4 rounded-xl text-[15px] font-bold bg-[#00a884] hover:bg-[#00bf96] text-[#0b141a] transition-colors active:scale-[0.99] cursor-pointer"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <p className="text-[12px] text-[#8696a0]">
                Pengajuan akun baru akan dikirim ke Admin untuk persetujuan.
              </p>

              <div>
                <label className="block text-[12px] font-semibold text-[#aebac1] mb-1">
                  Username :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: piketkima, bamin2..."
                    className={`w-full min-h-[44px] px-3.5 py-2 bg-[#202c33] border rounded-xl text-[14px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none ${
                      usernameAvailability
                        ? usernameAvailability.isAvailable
                          ? 'border-[#00a884]'
                          : 'border-rose-500'
                        : 'border-[#2a3942] focus:border-[#00a884]'
                    }`}
                  />
                  {usernameAvailability && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameAvailability.isAvailable ? (
                        <Check className="w-4 h-4 text-[#00a884]" />
                      ) : (
                        <X className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
                {usernameAvailability && (
                  <p
                    className={`text-[11px] font-medium mt-1 ${
                      usernameAvailability.isAvailable ? 'text-[#00a884]' : 'text-rose-400'
                    }`}
                  >
                    {usernameAvailability.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#aebac1] mb-1">
                  Password :
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Buat password akun..."
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#202c33] border border-[#2a3942] rounded-xl text-[14px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[12px] font-semibold text-[#aebac1] mb-1">
                    Nama Lengkap :
                  </label>
                  <input
                    type="text"
                    required
                    value={regNama}
                    onChange={(e) => setRegNama(e.target.value)}
                    placeholder="Nama lengkap..."
                    className="w-full min-h-[44px] px-3 py-2 bg-[#202c33] border border-[#2a3942] rounded-xl text-[14px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#aebac1] mb-1">
                    Pangkat :
                  </label>
                  <input
                    type="text"
                    required
                    value={regPangkat}
                    onChange={(e) => setRegPangkat(e.target.value)}
                    placeholder="Serda, Prada..."
                    className="w-full min-h-[44px] px-3 py-2 bg-[#202c33] border border-[#2a3942] rounded-xl text-[14px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#aebac1] mb-1">
                  Keterangan / Seksi :
                </label>
                <input
                  type="text"
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  placeholder="Contoh: Piket Kompi, Staf Pers..."
                  className="w-full min-h-[44px] px-3.5 py-2 bg-[#202c33] border border-[#2a3942] rounded-xl text-[14px] text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <button
                type="submit"
                disabled={Boolean(usernameAvailability && !usernameAvailability.isAvailable)}
                className="w-full min-h-[46px] py-2.5 px-4 rounded-xl text-[14px] font-bold bg-[#00a884] hover:bg-[#00bf96] disabled:opacity-40 text-[#0b141a] transition-colors cursor-pointer mt-1"
              >
                Kirim Pengajuan ke Admin
              </button>
            </form>
          )}

          {!isInstalled && (isInstallable || isInIframe) && (
            <div className="pt-3 border-t border-[#2a3942] space-y-2">
              {isInstallable ? (
                <button
                  type="button"
                  id="btn_login_install_pwa"
                  onClick={install}
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-[#00a884]/50 text-[#00a884] font-semibold text-[13.5px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>Pasang Aplikasi ARTALIBAS di Chrome</span>
                </button>
              ) : (
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-[#e9edef] font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#00a884] shrink-0" />
                  <span>Buka di Tab Chrome Baru untuk Install</span>
                </a>
              )}
              {isTemporaryPreview && (
                <p className="text-[11px] text-amber-300/90 text-center leading-relaxed">
                  Catatan: Link preview sementara ini mati jika AI Studio ditutup. Untuk buka 24 jam offline tanpa AI Studio, deploy ke Vercel/Netlify atau pakai .APK (lihat menu Pasang di HP & Bagikan setelah login).
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
