import React, { useState } from 'react';
import { X, Smartphone, Share2, Copy, Check, WifiOff, Download, Info, ExternalLink } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 md:bottom-4 z-50 flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-[#0b141a] shadow-xl">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Mode Offline — Data tersimpan tetap aktif</span>
    </div>
  );
};

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, isTemporaryPreview, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = typeof window !== 'undefined' ? window.location.href : '/';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'ARTALIBAS CORE 942',
          text: 'Buka aplikasi ARTALIBAS CORE 942 di Chrome dan pilih "Instal aplikasi / Tambahkan ke Layar Utama".',
          url: appUrl,
        });
        return;
      } catch {
        // fallback to copy
      }
    }
    await handleCopyLink();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pasang Aplikasi di HP & Bagikan"
        className="w-full sm:max-w-lg bg-[#111b21] border-t sm:border border-[#2a3942] rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#2a3942] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#00a884]/15 text-[#00a884] flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[16px] font-bold text-[#e9edef] truncate">
                Pasang Aplikasi & Kirim ke Teman
              </h3>
              <p className="text-[12px] text-[#8696a0] truncate">
                ARTALIBAS CORE 942 · Aplikasi HP & Offline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Panduan Pasang Aplikasi"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#8696a0] hover:bg-[#202c33] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-[13px] text-[#e9edef]">
          {/* Temporary AI Studio dev URL warning */}
          {isTemporaryPreview && !isInstalled && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 space-y-2">
              <div className="font-bold text-rose-300 text-[13px]">
                Penting: Link Preview Ini Hanya Sementara
              </div>
              <p className="text-[12px] text-rose-100/90 leading-relaxed">
                Alamat <code>ais-dev-...</code> otomatis mati beberapa menit setelah AI Studio ditutup, sehingga aplikasi yang di-install dari link ini tidak akan bisa dibuka lagi sebelum AI Studio dibuka kembali.
              </p>
              <p className="text-[12px] text-[#e9edef] leading-relaxed">
                Agar bisa dibuka <strong>24 jam tanpa membuka AI Studio dulu</strong> (dan tetap jalan saat offline), pasang dari hasil <strong>Deploy/Hosting Permanen</strong> (Vercel / Netlify / Firebase Hosting) atau gunakan file <strong>.APK</strong> di bawah.
              </p>
            </div>
          )}

          {/* Iframe warning: Chrome blocks PWA install inside AI Studio preview iframe */}
          {isInIframe && !isInstalled && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2.5">
              <p className="text-[12.5px] font-semibold text-amber-200 leading-relaxed">
                Aplikasi sedang terbuka di dalam preview AI Studio. Google Chrome hanya mengizinkan install aplikasi jika dibuka langsung di tab baru:
              </p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#00bf96] text-[#0b141a] font-bold text-[13.5px] flex items-center justify-center gap-2 shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka di Tab Chrome Baru untuk Install</span>
              </a>
            </div>
          )}

          {/* 1-Tap Direct Install if Browser Prompts */}
          {isInstallable && !isInstalled && (
            <button
              type="button"
              id="btn_modal_install_pwa"
              onClick={install}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#00a884] hover:bg-[#00bf96] text-[#0b141a] font-bold text-[14px] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>Pasang Aplikasi di Chrome Sekarang</span>
            </button>
          )}

          {isInstalled && (
            <div className="p-3 rounded-xl bg-[#00a884]/15 border border-[#00a884]/40 text-[#00a884] font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Aplikasi sudah terpasang di perangkat ini.</span>
            </div>
          )}

          {/* Share Link with Friends */}
          <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
            <div className="font-bold text-[#e9edef]">
              1. Kirim ke Teman (Tanpa Ribet)
            </div>
            <p className="text-[12px] text-[#8696a0] leading-relaxed">
              Bagikan link aplikasi ke WhatsApp teman. Setelah teman membuka link di Chrome Android, aplikasi bisa langsung dipasang ke layar utama HP (ikon & layar penuh seperti APK).
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 min-h-[42px] px-3.5 py-2 rounded-xl bg-[#00a884] hover:bg-[#00bf96] text-[#0b141a] font-bold text-[13px] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan Aplikasi</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#111b21] hover:bg-[#182229] border border-[#2a3942] text-[#e9edef] font-semibold text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#00a884]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* Manual Android / iOS / Desktop Install Steps */}
          <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-2">
            <div className="font-bold text-[#e9edef]">
              2. Cara Pasang di Google Chrome ({isIOS ? 'iPhone / iPad' : 'HP & Laptop'})
            </div>
            {isIOS ? (
              <ol className="list-decimal list-inside space-y-1 text-[12px] text-[#aebac1] leading-relaxed">
                <li>Buka halaman ini di browser <strong>Safari</strong>.</li>
                <li>Ketuk tombol <strong>Bagikan (Share)</strong> di bagian bawah layar.</li>
                <li>Pilih <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-1.5 text-[12px] text-[#aebac1] leading-relaxed">
                <li>Pastikan terbuka langsung di <strong>tab Chrome sendiri</strong> (bukan di dalam preview AI Studio).</li>
                <li>Di <strong>HP Android</strong>: ketuk titik tiga Chrome (<strong>⋮</strong>) kanan atas → pilih <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong>.</li>
                <li>Di <strong>PC / Laptop</strong>: klik ikon <strong>Instal (layar + panah)</strong> di ujung kanan address bar Chrome, atau menu <strong>⋮ → Simpan dan bagikan → Instal ARTALIBAS CORE 942</strong>.</li>
              </ol>
            )}
          </div>

          {/* Honest APK Packaging Steps */}
          <div className="p-4 rounded-xl bg-[#182229] border border-[#2a3942] space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>3. Cara Membuat File Installer .APK</span>
            </div>
            <p className="text-[12px] text-[#aebac1] leading-relaxed">
              <strong>PWABuilder.com</strong> tidak bisa langsung mengakses link preview AI Studio karena terhalang sistem autentikasi/cookie. Gunakan salah satu dari 2 cara resmi berikut untuk menghasilkan file <code>.apk</code>:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[12px] text-[#aebac1] leading-relaxed">
              <li>
                <strong>Via Netlify/Vercel + PWABuilder:</strong> Deploy proyek ini ke hosting publik gratis (<strong>Netlify</strong> atau <strong>Vercel</strong>) agar mendapat URL publik tanpa login, lalu masukkan URL baru tersebut ke <strong>pwabuilder.com → Android → Download</strong>.
              </li>
              <li>
                <strong>Via GitHub Actions (Otomatis Jadi APK):</strong> Simpan proyek ini ke <strong>GitHub</strong>, buka tab <strong>Actions</strong>, jalankan workflow <strong>Build Android APK</strong>, lalu unduh file <code>ARTALIBAS-CORE-942.apk</code> siap kirim ke teman.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
