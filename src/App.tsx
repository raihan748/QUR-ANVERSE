import React, { useState, useEffect, Suspense, lazy } from 'react';
import { NavigationTab, UserProfile, PrayerTime } from './types';
import { getLocalProfile, saveLocalProfile } from './services/offlineStorage';
import { calculatePrayerTimes, getCountdownToNextPrayer, getSavedLocation, fetchLiveInternetPrayerTimes, buildPrayerTimesList, LocationConfig } from './services/prayerTimeEngine';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { InstallPwaModal } from './components/common/InstallPwaModal';
import { PrayerAttendanceModal } from './components/adzan/PrayerAttendanceModal';
import { quranVault } from './services/quranVaultService';
import { masterVaultInduk } from './services/masterVaultIndukService';
import { healthWatchdog } from './services/healthWatchdogService';
import { prayerAttendance } from './services/prayerAttendanceService';
import { ScrollToTopButton } from './components/common/ScrollToTopButton';
import { QuranBuddyCard } from './components/chat/QuranBuddyCard';
import { AgenticExecutionHUD } from './components/chat/AgenticExecutionHUD';
import { LandingHeroShowcase } from './components/landing/LandingHeroShowcase';
import { MurojaahStudio } from './components/murojaah/MurojaahStudio';

// Lazy-loaded tabs for instantaneous page boot and optimal performance
const MushafView = lazy(() => import('./components/quran/MushafView').then(m => ({ default: m.MushafView })));
const TilawahStudio = lazy(() => import('./components/tilawah/TilawahStudio').then(m => ({ default: m.TilawahStudio })));
const SimaiTutupMata = lazy(() => import('./components/simai/SimaiTutupMata').then(m => ({ default: m.SimaiTutupMata })));
const SambungAyatGame = lazy(() => import('./components/challenge/SambungAyatGame').then(m => ({ default: m.SambungAyatGame })));
const PrayerTimesBanner = lazy(() => import('./components/adzan/PrayerTimesBanner').then(m => ({ default: m.PrayerTimesBanner })));
const DashboardView = lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const DownloadCenter = lazy(() => import('./components/offline/DownloadCenter').then(m => ({ default: m.DownloadCenter })));
const AsbabunNuzulView = lazy(() => import('./components/asbabun_nuzul/AsbabunNuzulView').then(m => ({ default: m.AsbabunNuzulView })));
const AlMatsuratView = lazy(() => import('./components/dzikir/AlMatsuratView').then(m => ({ default: m.AlMatsuratView })));

import { FullscreenAdzan } from './components/adzan/FullscreenAdzan';
import { adzanGlobalService, GlobalAdzanTriggerPayload } from './services/adzanGlobalService';
import { nativeAdzanScheduler } from './services/nativeAdzanScheduler';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('murojaah_ai');
  const [userProfile, setUserProfile] = useState<UserProfile>(getLocalProfile());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPrayerAttendanceModalOpen, setIsPrayerAttendanceModalOpen] = useState(false);
  const [duePrayerForAttendance, setDuePrayerForAttendance] = useState<PrayerTime | null>(null);
  const [dueMinutesPassed, setDueMinutesPassed] = useState<number>(30);
  const [isFullscreenAdzanOpen, setIsFullscreenAdzanOpen] = useState(false);
  const [globalAdzanPrayerName, setGlobalAdzanPrayerName] = useState<string>('Dzuhur');

  // Location and prayer times state (auto-detects city based on local timezone)
  const [activeLocation, setActiveLocation] = useState<LocationConfig>(() => getSavedLocation());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(() => calculatePrayerTimes(new Date(), getSavedLocation()));
  const [countdownData, setCountdownData] = useState(() => getCountdownToNextPrayer(calculatePrayerTimes(new Date(), getSavedLocation())));

  // Initialize HealthWatchdog, Quran Vault Midnight Scheduler, Master Vault Induk Online Handshake & Global On-Time Adzan Daemon on boot
  useEffect(() => {
    healthWatchdog.initiateGuardian();
    quranVault.startMidnightReconciliationScheduler();
    masterVaultInduk.initializeOnlineReconciliationWatcher();
    adzanGlobalService.startDaemon();
    nativeAdzanScheduler.initializeNativeAdzan();

    const handleAdzanTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<GlobalAdzanTriggerPayload>;
      if (customEvent.detail && customEvent.detail.prayerName) {
        setGlobalAdzanPrayerName(customEvent.detail.prayerName);
        setIsFullscreenAdzanOpen(true);
      }
    };

    window.addEventListener('qv_global_adzan_trigger', handleAdzanTrigger);
    return () => {
      adzanGlobalService.stopDaemon();
      window.removeEventListener('qv_global_adzan_trigger', handleAdzanTrigger);
    };
  }, []);

  // Fetch live official Kemenag schedule immediately on startup & listen to location changes
  useEffect(() => {
    fetchLiveInternetPrayerTimes(activeLocation).then((res) => {
      if (res?.timings) {
        const liveList = buildPrayerTimesList(res.timings, new Date());
        setPrayerTimes(liveList);
        setCountdownData(getCountdownToNextPrayer(liveList));
      }
    }).catch(() => {});

    const handleLocationChanged = (e: Event) => {
      const customEvent = e as CustomEvent<LocationConfig>;
      const newLoc = customEvent.detail || getSavedLocation();
      setActiveLocation(newLoc);
      const times = calculatePrayerTimes(new Date(), newLoc);
      setPrayerTimes(times);
      setCountdownData(getCountdownToNextPrayer(times));
      fetchLiveInternetPrayerTimes(newLoc).then((res) => {
        if (res?.timings) {
          const liveList = buildPrayerTimesList(res.timings, new Date());
          setPrayerTimes(liveList);
          setCountdownData(getCountdownToNextPrayer(liveList));
        }
      }).catch(() => {});
    };

    window.addEventListener('qv_prayer_location_changed', handleLocationChanged);
    return () => {
      window.removeEventListener('qv_prayer_location_changed', handleLocationChanged);
    };
  }, [activeLocation]);

  // Live 1-second countdown ticker for desktop sidebar & 30-minute Post-Adhan Attendance Auto-Check
  useEffect(() => {
    const checkAttendancePrompt = (times: PrayerTime[]) => {
      if ((window as any).__qv_is_attendance_open) return;
      const checkResult = prayerAttendance.checkShouldShow30MinPopup(times);
      if (checkResult.shouldShow && checkResult.duePrayer) {
        setDuePrayerForAttendance(checkResult.duePrayer);
        setDueMinutesPassed(checkResult.minutesPassed);
        setIsPrayerAttendanceModalOpen(true);
        (window as any).__qv_is_attendance_open = true;
      }
    };

    // Check once after initial boot (1.5s delay for smooth UI entrance)
    const initialCheckTimer = setTimeout(() => {
      checkAttendancePrompt(prayerTimes);
    }, 1500);

    let tickCount = 0;
    const timer = setInterval(() => {
      tickCount++;
      const currentCountdown = getCountdownToNextPrayer(prayerTimes);
      setCountdownData(currentCountdown);

      // When the upcoming prayer arrives (countdown reaches 0), refresh schedule
      if (currentCountdown.secondsRemaining <= 0) {
        const newTimes = calculatePrayerTimes(new Date(), activeLocation);
        setPrayerTimes(newTimes);
        setCountdownData(getCountdownToNextPrayer(newTimes));
      }

      // Check attendance prompt every 30 seconds
      if (tickCount % 30 === 0) {
        checkAttendancePrompt(prayerTimes);
      }
    }, 1000);

    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(timer);
    };
  }, [prayerTimes, activeLocation]);

  const handleProfileUpdated = (updated: UserProfile) => {
    setUserProfile(updated);
    saveLocalProfile(updated);
  };

  const handleSelectTabWithScroll = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenManualAttendance = () => {
    setDuePrayerForAttendance(null);
    setIsPrayerAttendanceModalOpen(true);
    (window as any).__qv_is_attendance_open = true;
  };

  // Listener untuk Aksi Tools Cerdas AI Bayan (Navigasi Modul, Buka Modal Install & Absensi)
  useEffect(() => {
    const handleBayanNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab: NavigationTab }>;
      if (customEvent.detail && customEvent.detail.tab) {
        handleSelectTabWithScroll(customEvent.detail.tab);
      }
    };

    const handleOpenInstall = () => setIsInstallModalOpen(true);
    const handleOpenAttendance = () => handleOpenManualAttendance();

    window.addEventListener('qv_bayan_navigate', handleBayanNavigate);
    window.addEventListener('qv_open_install_modal', handleOpenInstall);
    window.addEventListener('qv_open_attendance_modal', handleOpenAttendance);

    return () => {
      window.removeEventListener('qv_bayan_navigate', handleBayanNavigate);
      window.removeEventListener('qv_open_install_modal', handleOpenInstall);
      window.removeEventListener('qv_open_attendance_modal', handleOpenAttendance);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-black">
      {/* Top Navbar Header */}
      <Navbar
        profile={userProfile}
        activeTab={activeTab}
        onSelectTab={handleSelectTabWithScroll}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenPrayerAttendanceModal={handleOpenManualAttendance}
      />

      {/* Main Layout (Dual Panel Desktop + Responsive Mobile) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTabWithScroll}
          nextPrayer={countdownData.nextPrayer}
          countdownStr={countdownData.formattedCountdown}
          cityName={activeLocation.city}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0">
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[400px] p-12 text-center">
                <div className="w-10 h-10 border-4 border-[#0B4627] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-semibold text-slate-700 text-sm">Memuat modul Al-Huda...</p>
              </div>
            }>
              <div key={activeTab} className="animate-fade-up">
                {activeTab === 'mushaf' && <MushafView />}

                {activeTab === 'tilawah' && (
                  <TilawahStudio
                    userProfile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                )}

                {activeTab === 'murojaah_ai' && (
                  <MurojaahStudio
                    userProfile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                )}

                {activeTab === 'simai' && (
                  <SimaiTutupMata
                    userProfile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                )}

                {activeTab === 'challenge' && (
                  <SambungAyatGame
                    userProfile={userProfile}
                    onProfileUpdated={handleProfileUpdated}
                  />
                )}

                {activeTab === 'prayer' && (
                  <PrayerTimesBanner
                    onOpenPrayerAttendanceModal={handleOpenManualAttendance}
                  />
                )}

                {activeTab === 'dashboard' && (
                  <DashboardView
                    userProfile={userProfile}
                    onNavigateToMurojaah={() => handleSelectTabWithScroll('murojaah_ai')}
                    onOpenPrayerAttendanceModal={handleOpenManualAttendance}
                  />
                )}

                {activeTab === 'download' && <DownloadCenter />}

                {activeTab === 'asbabun_nuzul' && (
                  <AsbabunNuzulView
                    onNavigateToMushaf={(surah, ayah) => handleSelectTabWithScroll('mushaf')}
                    onNavigateToMurojaah={(surah, ayah) => handleSelectTabWithScroll('murojaah_ai')}
                  />
                )}

                {activeTab === 'dzikir' && <AlMatsuratView />}
              </div>
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Hidden on Laptop/PC) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTabWithScroll}
      />

      {/* Floating Scroll to Top & Quick Jump Button */}
      <ScrollToTopButton onSelectTab={handleSelectTabWithScroll} />

      {/* Floating Tanya Bayan AI Assistant (DeepSeek v4 Pro & Function Calling Tools) in Bottom-Right */}
      <QuranBuddyCard />

      {/* Autonomous Jarvis Agentic Execution HUD Sequence */}
      <AgenticExecutionHUD />

      {/* Global Fullscreen Adzan Modal (Accessible anywhere regardless of current tab) */}
      <FullscreenAdzan
        isOpen={isFullscreenAdzanOpen}
        onClose={() => setIsFullscreenAdzanOpen(false)}
        prayerName={globalAdzanPrayerName}
      />

      {/* Install PWA Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Jurnal & Absensi Sholat 5 Waktu (30-Min Post-Adhan Auto-Popup & Manual) */}
      <PrayerAttendanceModal
        isOpen={isPrayerAttendanceModalOpen}
        onClose={() => {
          if (duePrayerForAttendance) {
            const today = prayerAttendance.getTodayAttendance();
            const rec = today.records[duePrayerForAttendance.id as 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'];
            const isCompletedOrAnswered = !!(rec && rec.status);
            prayerAttendance.dismissPopupForNow(duePrayerForAttendance.id, isCompletedOrAnswered ? 24 * 60 : 60);
          }
          prayerAttendance.setGeneralCooldown(15);
          setIsPrayerAttendanceModalOpen(false);
          setDuePrayerForAttendance(null);
          (window as any).__qv_is_attendance_open = false;
        }}
        prayerTimes={prayerTimes}
        duePrayer={duePrayerForAttendance}
        minutesPassed={dueMinutesPassed}
        onXpAwarded={(xpGained) => {
          const updated = {
            ...userProfile,
            totalXp: (userProfile.totalXp || 0) + xpGained
          };
          handleProfileUpdated(updated);
        }}
      />
    </div>
  );
}

export default App;
