import React, { useState, useEffect } from 'react';
import { NavigationTab, UserProfile, PrayerTime } from './types';
import { getLocalProfile, saveLocalProfile } from './services/offlineStorage';
import { calculatePrayerTimes, getCountdownToNextPrayer } from './services/prayerTimeEngine';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { InstallPwaModal } from './components/common/InstallPwaModal';
import { QuranVaultModal } from './components/security/QuranVaultModal';
import { quranVault } from './services/quranVaultService';
import { masterVaultInduk } from './services/masterVaultIndukService';
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

import { ErrorBoundary } from './components/common/ErrorBoundary';

export function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('murojaah_ai');
  const [userProfile, setUserProfile] = useState<UserProfile>(getLocalProfile());
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isQuranVaultModalOpen, setIsQuranVaultModalOpen] = useState(false);

  // Initialize Quran Vault 00:00 Midnight Autonomous Reconciliation & Master Vault Induk Online Handshake on boot
  useEffect(() => {
    quranVault.startMidnightReconciliationScheduler();
    masterVaultInduk.initializeOnlineReconciliationWatcher();
  }, []);

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>(calculatePrayerTimes());
  const [countdownData, setCountdownData] = useState(getCountdownToNextPrayer(prayerTimes));

  // Live countdown timer for prayer times
  useEffect(() => {
    const timer = setInterval(() => {
      const times = calculatePrayerTimes();
      setPrayerTimes(times);
      setCountdownData(getCountdownToNextPrayer(times));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleProfileUpdated = (updated: UserProfile) => {
    setUserProfile(updated);
    saveLocalProfile(updated);
  };

  const handleSelectTabWithScroll = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

              {activeTab === 'prayer' && <PrayerTimesBanner />}

              {activeTab === 'dashboard' && (
                <DashboardView
                  userProfile={userProfile}
                  onNavigateToMurojaah={() => handleSelectTabWithScroll('murojaah_ai')}
                />
              )}

              {activeTab === 'download' && <DownloadCenter />}
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
    </div>
  );
}

export default App;
