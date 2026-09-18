QURANVERSE - Native Android APK (.apk)
=====================================
Direktori ini diperuntukkan bagi distribusi file installer biner Android (.APK).

Cara Menghasilkan File quranverse.apk:
1. Via Android Studio (Lokal):
   - Buka project dengan perintah: npx cap open android
   - Di Android Studio, pilih menu: Build > Build Bundle(s) / APK(s) > Build APK(s)
   - Salin file yang dihasilkan dari: android/app/build/outputs/apk/debug/app-debug.apk
   - Tempel ke folder ini dengan nama: quranverse.apk

2. Via GitHub Actions (Otomatis di Cloud):
   - Push commit ke branch 'main' di GitHub.
   - Workflow '.github/workflows/build-apk.yml' akan otomatis meng-compile file APK dan menyediakannya untuk diunduh.
