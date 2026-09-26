// ==============================================================================
// BAYAN AI TOOLS & FUNCTION CALLING SERVICE (AL-HUDA PLATFORM)
// Pemandu Cerdas & Eksekutor Aksi Interaktif Al-Huda
// ==============================================================================

import { SURAH_LIST } from '../data/quranData';
import { calculatePrayerTimes, getCountdownToNextPrayer, getSavedLocation } from './prayerTimeEngine';
import { getLocalProfile, getLastRead, getBookmarks } from './offlineStorage';
import { NavigationTab } from '../types';

export interface ChatAction {
  id: string;
  type: 'navigate_tab' | 'jump_quran' | 'open_dzikir' | 'open_install' | 'open_attendance';
  label: string;
  icon?: string;
  payload?: any;
}

export interface ToolCallResult {
  toolName: string;
  resultData: any;
  userFacingText?: string;
  action?: ChatAction;
}

// 1. Definisi OpenAPI / OpenAI Tools Schema untuk DeepSeek v4 Pro
export const BAYAN_TOOLS_SCHEMA = [
  {
    type: 'function',
    function: {
      name: 'navigate_tab',
      description: 'Navigasikan pengguna ke salah satu dari 10 modul utama platform Al-Huda.',
      parameters: {
        type: 'object',
        properties: {
          tab: {
            type: 'string',
            enum: [
              'mushaf',
              'murojaah_ai',
              'tilawah',
              'simai',
              'challenge',
              'prayer',
              'dashboard',
              'download',
              'asbabun_nuzul',
              'dzikir'
            ],
            description: 'Tab atau modul Al-Huda yang ingin dibuka'
          },
          reason: {
            type: 'string',
            description: 'Penjelasan singkat mengapa membuka modul tersebut'
          }
        },
        required: ['tab']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'jump_to_quran',
      description: 'Buka Mushaf Al-Qur\'an langsung ke Surah dan Ayat spesifik (1-114).',
      parameters: {
        type: 'object',
        properties: {
          surahNumber: {
            type: 'integer',
            description: 'Nomor Surah Al-Qur\'an dari 1 sampai 114 (contoh: 1 untuk Al-Fatihah, 67 untuk Al-Mulk, 36 untuk Yasin, 18 untuk Al-Kahf)'
          },
          ayahNumber: {
            type: 'integer',
            description: 'Nomor ayat dalam Surah tersebut (opsional, contoh: 1, 5, 255)'
          },
          surahName: {
            type: 'string',
            description: 'Nama surah (contoh: Al-Mulk, Al-Baqarah, Ar-Rahman)'
          }
        },
        required: ['surahNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_prayer_schedule',
      description: 'Ambil jadwal sholat resmi hari ini (Subuh, Dzuhur, Ashar, Maghrib, Isya) dan hitung mundur waktu sholat berikutnya untuk kota pengguna saat ini.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_user_progress',
      description: 'Periksa progres belajar, level hafidz, total XP, streak muroja\'ah, dan surah terakhir yang dibaca pengguna di Al-Huda.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'open_dzikir_mode',
      description: 'Buka wirid Dzikir Al-Ma\'tsurat (pagi atau petang) dengan tuntunan counter digital.',
      parameters: {
        type: 'object',
        properties: {
          time: {
            type: 'string',
            enum: ['pagi', 'petang'],
            description: 'Waktu dzikir yang ingin dibuka: pagi (ba\'da Subuh) atau petang (ba\'da Ashar)'
          }
        },
        required: ['time']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'open_install_guide',
      description: 'Tampilkan panduan unduh APK Android atau instalasi Progressive Web App (PWA) Al-Huda untuk penggunaan offline di HP atau laptop.',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'explain_feature',
      description: 'Berikan panduan dan cara penggunaan fitur spesifik di platform Al-Huda.',
      parameters: {
        type: 'object',
        properties: {
          featureKey: {
            type: 'string',
            enum: [
              'murojaah_ai',
              'simai',
              'tilawah',
              'challenge',
              'mushaf',
              'offline_vault',
              'prayer',
              'dzikir',
              'asbabun_nuzul'
            ],
            description: 'Nama fitur Al-Huda yang ingin dijelaskan'
          }
        },
        required: ['featureKey']
      }
    }
  }
];

// 2. Eksekutor Tool di Sisi Client (Local Intelligence & Navigation Dispatcher)
class BayanToolsService {
  /**
   * Eksekusi tool call yang diminta oleh model DeepSeek v4 Pro
   */
  public executeTool(name: string, rawArgs: any): ToolCallResult {
    let args = rawArgs;
    if (typeof rawArgs === 'string') {
      try {
        args = JSON.parse(rawArgs);
      } catch {
        args = {};
      }
    }

    switch (name) {
      case 'navigate_tab': {
        const tab = (args.tab || 'mushaf') as NavigationTab;
        const labels: Record<NavigationTab, string> = {
          mushaf: 'Mushaf Al-Qur\'an Kemenag',
          murojaah_ai: 'Studio Muroja\'ah AI',
          tilawah: 'Studio Rekaman Tilawah',
          simai: 'Simai Tutup Mata (Hafalan)',
          challenge: 'Tantangan Sambung Ayat',
          prayer: 'Jadwal Sholat & Adzan',
          dashboard: 'Dashboard Progres Santri',
          download: 'Pusat Unduh Offline 30 Juz',
          asbabun_nuzul: 'Ensiklopedia Asbabun Nuzul',
          dzikir: 'Dzikir Al-Ma\'tsurat'
        };

        const label = labels[tab] || 'Halaman Al-Huda';
        return {
          toolName: name,
          resultData: { success: true, tab, label },
          userFacingText: `Navigasi ke **${label}** telah disiapkan.`,
          action: {
            id: `act_nav_${Date.now()}`,
            type: 'navigate_tab',
            label: `Buka ${label}`,
            payload: { tab }
          }
        };
      }

      case 'jump_to_quran': {
        const surahNo = Math.max(1, Math.min(114, Number(args.surahNumber) || 1));
        const ayahNo = args.ayahNumber ? Math.max(1, Number(args.ayahNumber)) : undefined;
        const surahMeta = SURAH_LIST.find((s) => s.number === surahNo) || {
          name: args.surahName || `Surah ke-${surahNo}`,
          asma: ''
        };

        const ayahText = ayahNo ? `Ayat ${ayahNo}` : 'Awal Surah';
        return {
          toolName: name,
          resultData: { success: true, surahNumber: surahNo, ayahNumber: ayahNo, surahName: surahMeta.name },
          userFacingText: `Menuju **Surah ${surahMeta.name}** (${ayahText}).`,
          action: {
            id: `act_jump_${Date.now()}`,
            type: 'jump_quran',
            label: `📖 Buka Surah ${surahMeta.name}${ayahNo ? `:${ayahNo}` : ''}`,
            payload: { surahNumber: surahNo, ayahNumber: ayahNo }
          }
        };
      }

      case 'get_prayer_schedule': {
        const loc = getSavedLocation();
        const times = calculatePrayerTimes(new Date(), loc);
        const countdown = getCountdownToNextPrayer(times);

        const scheduleList = times.map((t) => `${t.name}: ${t.timeStr}`).join(' | ');

        return {
          toolName: name,
          resultData: {
            city: loc.city,
            schedule: scheduleList,
            nextPrayer: countdown.nextPrayer?.name || 'Subuh',
            countdown: countdown.formattedCountdown
          },
          userFacingText: `Jadwal sholat untuk **${loc.city}** hari ini:\n${times.map((t) => `• **${t.name}**: ${t.timeStr}`).join('\n')}\n\nWaktu berikutnya: **${countdown.nextPrayer?.name}** dalam ${countdown.formattedCountdown}.`,
          action: {
            id: `act_prayer_${Date.now()}`,
            type: 'navigate_tab',
            label: '🕌 Buka Jadwal Sholat Lengkap',
            payload: { tab: 'prayer' }
          }
        };
      }

      case 'get_user_progress': {
        const profile = getLocalProfile();
        const lastRead = getLastRead();
        const bookmarks = getBookmarks();

        return {
          toolName: name,
          resultData: {
            name: profile.fullName,
            level: profile.hafidzLevel,
            xp: profile.totalXp,
            lastRead: lastRead ? `${lastRead.surahName} ayat ${lastRead.ayahNumber}` : 'Belum ada catatan',
            bookmarksCount: bookmarks.length
          },
          userFacingText: `Data santri **${profile.fullName}**:\n• Level: **${profile.hafidzLevel}**\n• Total XP: **${profile.totalXp} XP**\n• Terakhir Dibaca: **${lastRead ? `${lastRead.surahName} : ${lastRead.ayahNumber}` : 'Al-Fatihah : 1'}**\n• Ayat Disimpan: **${bookmarks.length} bookmark**`,
          action: {
            id: `act_dash_${Date.now()}`,
            type: 'navigate_tab',
            label: '📊 Lihat Dashboard Santri',
            payload: { tab: 'dashboard' }
          }
        };
      }

      case 'open_dzikir_mode': {
        const time = args.time === 'petang' ? 'petang' : 'pagi';
        return {
          toolName: name,
          resultData: { success: true, time },
          userFacingText: `Membuka wirid **Dzikir Al-Ma'tsurat ${time === 'pagi' ? 'Pagi (Kubra/Sughra)' : 'Petang (Sore Hari)'}**.`,
          action: {
            id: `act_dzikir_${Date.now()}`,
            type: 'open_dzikir',
            label: `📿 Buka Dzikir ${time === 'pagi' ? 'Pagi' : 'Petang'}`,
            payload: { time }
          }
        };
      }

      case 'open_install_guide': {
        return {
          toolName: name,
          resultData: { success: true },
          userFacingText: 'Modal instalasi PWA dan unduhan APK Android Al-Huda dapat kamu buka melalui tombol di bawah.',
          action: {
            id: `act_install_${Date.now()}`,
            type: 'open_install',
            label: '📲 Unduh APK Android / Pasang PWA',
            payload: {}
          }
        };
      }

      case 'explain_feature': {
        const featureKey = args.featureKey;
        const explanations: Record<string, { title: string; tab: NavigationTab; desc: string }> = {
          murojaah_ai: {
            title: 'Studio Muroja\'ah AI',
            tab: 'murojaah_ai',
            desc: 'Fitur evaluasi hafalan cerdas. Tekan tombol mikrofon, lafalkan ayat yang ingin dimuroja\'ah. AI akan mendeteksi ketepatan lafadz, kata yang terlewat, dan memberikan skor kelancaran mutqin.'
          },
          simai: {
            title: 'Simai Tutup Mata',
            tab: 'simai',
            desc: 'Metode latihan hafalan mandiri tanpa intip. Teks ayat disembunyikan. Kamu bisa membuka intipan kata per kata hanya jika mengalami kebuntuan hafalan.'
          },
          tilawah: {
            title: 'Studio Tilawah',
            tab: 'tilawah',
            desc: 'Rekam bacaan tartilmu, bandingkan dengan qari masyhur internasional (Misyari Rasyid, As-Sudais, Al-Ghamidi), dan perbaiki makhraj huruf.'
          },
          challenge: {
            title: 'Tantangan Sambung Ayat',
            tab: 'challenge',
            desc: 'Uji daya ingat hafalan secara interaktif. Dengarkan potongan ayat lalu pilih sambungan ayat berikutnya dengan tepat sebelum waktu habis.'
          },
          mushaf: {
            title: 'Mushaf Al-Qur\'an Digital & Fisik',
            tab: 'mushaf',
            desc: 'Dilengkapi tampilan per ayat standar Kemenag RI, audio qari jernih, navigasi surah/juz instan, dan mode simulasi Mushaf Standar Madinah 604 halaman.'
          },
          offline_vault: {
            title: 'Pusat Unduh Offline 30 Juz',
            tab: 'download',
            desc: 'Unduh seluruh database Al-Qur\'an, audio ayat, tafsir, dan data Al-Huda ke memori lokal browser / HP. 100% bisa dipakai di daerah pelosok atau saat mode pesawat tanpa kuota internet.'
          },
          prayer: {
            title: 'Jadwal Sholat & Adzan',
            tab: 'prayer',
            desc: 'Perhitungan hisab astronomis akurat Kemenag RI untuk seluruh kota di Indonesia, dilengkapi alarm adzan visual fullscreen dan kompas kiblat.'
          },
          dzikir: {
            title: 'Dzikir Al-Ma\'tsurat',
            tab: 'dzikir',
            desc: 'Rangkaian wirid doa pagi dan petang susunan Imam Hasan Al-Banna dengan hitungan tasbih digital otomatis bergetar/audio.'
          },
          asbabun_nuzul: {
            title: 'Ensiklopedia Asbabun Nuzul',
            tab: 'asbabun_nuzul',
            desc: 'Pelajari konteks sejarah dan sebab-sebab turunnya ayat-ayat Al-Qur\'an berdasarkan riwayat shahih.'
          }
        };

        const item = explanations[featureKey] || {
          title: 'Fitur Al-Huda',
          tab: 'murojaah_ai',
          desc: 'Fitur unggulan Al-Huda untuk mendampingi hafalan dan ibadah harianmu.'
        };

        return {
          toolName: name,
          resultData: { success: true, featureKey, title: item.title },
          userFacingText: `**${item.title}**:\n${item.desc}`,
          action: {
            id: `act_feat_${Date.now()}`,
            type: 'navigate_tab',
            label: `Buka ${item.title}`,
            payload: { tab: item.tab }
          }
        };
      }

      default:
        return {
          toolName: name,
          resultData: { error: 'Tool tidak dikenali' },
          userFacingText: `Perintah *${name}* tidak ditemukan.`
        };
    }
  }

  /**
   * Jalankan aksi interaktif di browser (dispatch CustomEvent ke App.tsx / DOM)
   */
  public executeAction(action: ChatAction): void {
    if (typeof window === 'undefined') return;

    switch (action.type) {
      case 'navigate_tab': {
        const tab = action.payload?.tab;
        if (tab) {
          window.dispatchEvent(new CustomEvent('qv_bayan_navigate', { detail: { tab } }));
        }
        break;
      }

      case 'jump_quran': {
        const { surahNumber, ayahNumber } = action.payload || {};
        window.dispatchEvent(new CustomEvent('qv_bayan_navigate', { detail: { tab: 'mushaf' } }));
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('qv_mushaf_jump', { detail: { surahNumber, ayahNumber } })
          );
        }, 150);
        break;
      }

      case 'open_dzikir': {
        window.dispatchEvent(new CustomEvent('qv_bayan_navigate', { detail: { tab: 'dzikir' } }));
        break;
      }

      case 'open_install': {
        window.dispatchEvent(new CustomEvent('qv_open_install_modal'));
        break;
      }

      case 'open_attendance': {
        window.dispatchEvent(new CustomEvent('qv_open_attendance_modal'));
        break;
      }

      default:
        console.warn('[BayanTools] Unknown action type:', action.type);
    }
  }
}

export const bayanToolsService = new BayanToolsService();
