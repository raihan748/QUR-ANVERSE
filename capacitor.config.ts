import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quranverse.app',
  appName: 'Al-Huda',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_quranverse',
      iconColor: '#06331D',
      sound: 'adzan_marwan_al_qassas.mp3'
    }
  }
};

export default config;
