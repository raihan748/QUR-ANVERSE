import React, { useState, useEffect } from 'react';
import { NavigationTab, UserProfile, PrayerTime } from './types';
import { getLocalProfile, saveLocalProfile } from './services/offlineStorage';
import { calculatePrayerTimes, getCountdownToNextPrayer } from './services/prayerTimeEngine';
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
import { LandingHeroShowcase } from './components/landing/LandingHeroShowcase';
import { MushafView } from './components/quran/MushafView';
import { TilawahStudio } from './components/tilawah/TilawahStudio';
import { MurojaahStudio } from './components/murojaah/MurojaahStudio';
import { SimaiTutupMata } from './components/simai/SimaiTutupMata';
import { SambungAyatGame } from './components/challenge/SambungAyatGame';
import { PrayerTimesBanner } from './components/adzan/PrayerTimesBanner';
import { DashboardView } from './components/dashboard/DashboardView';
import { DownloadCenter } from './components/offline/DownloadCenter';
import { AsbabunNuzulView } from './components/asbabun_nuzul/AsbabunNuzulView';

import { FullscreenAdzan } from './components/adzan/FullscreenAdzan';
import { adzanGlobalService, GlobalAdzanTriggerPayload } from './services/adzanGlobalService';
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

  // Initialize HealthWatchdog, Quran Vault Midnight Scheduler, Master Vault Induk Online Handshake & Global On-Time Adzan Daemon on boot
  useEffect(() => {
    healthWatchdog.initiateGuardian();
    quranVault.startMidnightReconciliationScheduler();
    masterVaultInduk.initializeOnlineReconciliationWatcher();
    adzanGlobalService.startDaemon();

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

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(calculatePrayerTimes());
  const [countdownData, setCountdownData] = useState(getCountdownToNextPrayer(prayerTimes));

  // Live countdown timer for prayer times & 30-minute Post-Adhan Attendance Auto-Check
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

    const timer = setInterval(() => {
      const times = calculatePrayerTimes();
      setPrayerTimes(times);
      setCountdownData(getCountdownToNextPrayer(times));
      checkAttendancePrompt(times);
    }, 30000); // Check every 30s

    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(timer);
    };
  }, []);

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
        />

        {/* Main Content Area with Rich Entrance Animations */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0">
          {/* Dynamic Tab View Container with Error Boundary & Smooth Transitions */}
          <ErrorBoundary>
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
            </div>
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
            prayerAttendance.dismissPopupForNow(duePrayerForAttendance.id, 60);
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
