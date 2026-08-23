import { AchievementBadge } from '../types';

export const INITIAL_BADGES: AchievementBadge[] = [
  {
    id: 'badge_first_murojaah',
    title: 'Langkah Pertama Hafidz',
    description: 'Menyelesaikan 1 setoran Muroja\'ah AI dengan skor akurasi di atas 80%.',
    icon: '🌟',
    category: 'murojaah',
    unlocked: false,
    xpReward: 200
  },
  {
    id: 'badge_fatihah_master',
    title: 'Mahkota Al-Fatihah',
    description: 'Menuntaskan seluruh ayat Surat Al-Fatihah dengan nilai tajwid 100%.',
    icon: '👑',
    category: 'murojaah',
    unlocked: false,
    xpReward: 350
  },
  {
    id: 'badge_streak_7',
    title: 'Istiqomah 7 Hari',
    description: 'Melakukan muroja\'ah berturut-turut tanpa putus selama 7 hari.',
    icon: '🔥',
    category: 'streak',
    unlocked: false,
    xpReward: 500
  },
  {
    id: 'badge_streak_30',
    title: 'Pejuang 30 Hari Mutqin',
    description: 'Menuntaskan 30-Day Muroja\'ah Streak tanpa bolong 1 hari pun.',
    icon: '🏆',
    category: 'streak',
    unlocked: false,
    xpReward: 2000
  },
  {
    id: 'badge_simai_listener',
    title: 'Telinga Emas Simai',
    description: 'Berhasil menyambung ayat pada Mode Muroja\'ah Tutup Mata di level Hafidz.',
    icon: '🎧',
    category: 'challenge',
    unlocked: false,
    xpReward: 600
  },
  {
    id: 'badge_timer_rush',
    title: 'Penakluk Waktu',
    description: 'Menjawab 5 sambung ayat berturut-turut dalam Countdown Rush Challenge.',
    icon: '⚡',
    category: 'challenge',
    unlocked: false,
    xpReward: 750
  },
  {
    id: 'badge_juz_30',
    title: 'Penjaga Juz 30 (Juz \'Amma)',
    description: 'Menyelesaikan muroja\'ah seluruh 37 surat di Juz 30.',
    icon: '📗',
    category: 'murojaah',
    unlocked: false,
    xpReward: 1500
  },
  {
    id: 'badge_juz_29',
    title: 'Penjaga Juz 29 (Tabarak)',
    description: 'Menyelesaikan muroja\'ah seluruh 11 surat di Juz 29.',
    icon: '📘',
    category: 'murojaah',
    unlocked: false,
    xpReward: 1800
  }
];
