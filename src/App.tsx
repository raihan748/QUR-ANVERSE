import React, { useState, useEffect } from 'react';
import { NavigationTab, UserProfile, PrayerTime } from './types';
import { getLocalProfile, saveLocalProfile } from './services/offlineStorage';
import { calculatePrayerTimes, getCountdownToNextPrayer } from './services/prayerTimeEngine';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { InstallPwaModal } from './components/common/InstallPwaModal';
import { QuranVaultModal } from './components/security/QuranVaultModal';
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
import { FrontierResearchHub } from './components/research/FrontierResearchHub';

import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('murojaah_ai');
  const [userProfile, setUserProfile] = useState<UserProfile>(getLocalProfile());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isQuranVaultModalOpen, setIsQuranVaultModalOpen] = useState(false);
  const [isPrayerAttendanceModalOpen, setIsPrayerAttendanceModalOpen] = useState(false);
  const [duePrayerForAttendance, setDuePrayerForAttendance] = useState<PrayerTime | null>(null);
  const [dueMinutesPassed, setDueMinutesPassed] = useState<number>(30);

  // Initialize HealthWatchdog, Quran Vault Midnight Scheduler & Master Vault Induk Online Handshake on boot
  useEffect(() => {
    healthWatchdog.initiateGuardian();
    quranVault.startMidnightReconciliationScheduler();
    masterVaultInduk.initializeOnlineReconciliationWatcher();
  }, []);

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(calculatePrayerTimes());
  const [countdownData, setCountdownData] = useState(getCountdownToNextPrayer(prayerTimes));

  // Live countdown timer for prayer times & 30-minute Post-Adhan Attendance Auto-Check
  useEffect(() => {
    const checkAttendancePrompt = (times: PrayerTime[]) => {
      const checkResult = prayerAttendance.checkShouldShow30MinPopup(times);
      if (checkResult.shouldShow && checkResult.duePrayer) {
        setDuePrayerForAttendance(checkResult.duePrayer);
        setDueMinutesPassed(checkResult.minutesPassed);
        setIsPrayerAttendanceModalOpen(true);
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
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-black">
      {/* Top Navbar Header */}
      <Navbar
        profile={userProfile}
        activeTab={activeTab}
        onSelectTab={handleSelectTabWithScroll}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenQuranVaultModal={() => setIsQuranVaultModalOpen(true)}
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

              {activeTab === 'frontier_research' && <FrontierResearchHub />}
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

      {/* Install PWA Modal */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Quran Vault Security & Anti-Deface Center */}
      <QuranVaultModal
        isOpen={isQuranVaultModalOpen}
        onClose={() => setIsQuranVaultModalOpen(false)}
      />

      {/* Jurnal & Absensi Sholat 5 Waktu (30-Min Post-Adhan Auto-Popup & Manual) */}
      <PrayerAttendanceModal
        isOpen={isPrayerAttendanceModalOpen}
        onClose={() => setIsPrayerAttendanceModalOpen(false)}
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
