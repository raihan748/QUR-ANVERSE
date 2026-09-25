import React from 'react';

interface AlHudaLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const AlHudaLogo: React.FC<AlHudaLogoProps> = ({ 
  className = "w-full h-full", 
  size,
  showText = false 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={size} 
      height={size} 
      className={className}
      aria-label="Logo Resmi Al-Huda"
    >
      <defs>
        {/* Background Gradients: Deep Majestic Islamic Forest Emerald */}
        <linearGradient id="alhudaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#01180E" />
          <stop offset="35%" stopColor="#03301B" />
          <stop offset="70%" stopColor="#054527" />
          <stop offset="100%" stopColor="#01130A" />
        </linearGradient>

        {/* Nur Al-Huda: Divine Radial Radiance */}
        <radialGradient id="alhudaNurGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.5" />
          <stop offset="30%" stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#047857" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#01180E" stopOpacity="0" />
        </radialGradient>

        {/* 24K Royal Gold Metallic Gradient */}
        <linearGradient id="alhudaGold24k" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF0" />
          <stop offset="25%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="75%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Sacred Pages Gradients */}
        <linearGradient id="alhudaPageLeft" x1="100%" y1="50%" x2="0%" y2="50%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="40%" stopColor="#FFFFFF" />
          <stop offset="85%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        <linearGradient id="alhudaPageRight" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFFDF5" />
          <stop offset="40%" stopColor="#FEF9E7" />
          <stop offset="80%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Royal Ruby Silk Ribbon */}
        <linearGradient id="alhudaRubyRibbon" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="40%" stopColor="#E11D48" />
          <stop offset="85%" stopColor="#BE123C" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>

        {/* Emerald Gem Core */}
        <radialGradient id="alhudaEmeraldGem" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="40%" stopColor="#10B981" />
          <stop offset="80%" stopColor="#047857" />
          <stop offset="100%" stopColor="#022C1A" />
        </radialGradient>

        {/* Filters */}
        <filter id="alhudaGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="alhudaDropShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* 1. Base Arched Shield */}
      <rect width="512" height="512" rx="112" fill="url(#alhudaBgGrad)" />
      <rect width="512" height="512" rx="112" fill="url(#alhudaNurGlow)" />

      {/* 2. Double Gold Filigree Borders */}
      <rect x="18" y="18" width="476" height="476" rx="96" fill="none" stroke="url(#alhudaGold24k)" strokeWidth="3" opacity="0.9" />
      <rect x="28" y="28" width="456" height="456" rx="86" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="10 6" opacity="0.6" />

      {/* 3. Islamic Corner Motifs */}
      <g stroke="url(#alhudaGold24k)" strokeWidth="2.2" fill="none" opacity="0.85">
        <path d="M 44 86 L 44 44 L 86 44" />
        <path d="M 44 64 Q 64 64 64 44" />
        <circle cx="58" cy="58" r="3.5" fill="url(#alhudaGold24k)" />

        <path d="M 468 86 L 468 44 L 426 44" />
        <path d="M 468 64 Q 448 64 448 44" />
        <circle cx="454" cy="58" r="3.5" fill="url(#alhudaGold24k)" />

        <path d="M 44 426 L 44 468 L 86 468" />
        <path d="M 44 448 Q 64 448 64 468" />
        <circle cx="58" cy="454" r="3.5" fill="url(#alhudaGold24k)" />

        <path d="M 468 426 L 468 468 L 426 468" />
        <path d="M 468 448 Q 448 448 448 468" />
        <circle cx="454" cy="454" r="3.5" fill="url(#alhudaGold24k)" />
      </g>

      {/* 4. Rub El Hizb Mandala (8-Point Islamic Star) */}
      <g transform="translate(256, 220)" filter="url(#alhudaGlow)">
        <rect x="-105" y="-105" width="210" height="210" rx="20" fill="none" stroke="url(#alhudaGold24k)" strokeWidth="3" opacity="0.55" />
        <rect x="-105" y="-105" width="210" height="210" rx="20" fill="none" stroke="url(#alhudaGold24k)" strokeWidth="3" opacity="0.55" transform="rotate(45)" />
        <circle cx="0" cy="0" r="90" fill="none" stroke="url(#alhudaGold24k)" strokeWidth="1.2" strokeDasharray="6 5" opacity="0.5" />
      </g>

      {/* 5. Mihrab Silhouette (Arch of Guidance) */}
      <g filter="url(#alhudaDropShadow)">
        <path d="M 168 310 L 168 185 C 168 122, 256 82, 256 82 C 256 82, 344 122, 344 185 L 344 310 Z" fill="#022818" stroke="url(#alhudaGold24k)" strokeWidth="2.2" opacity="0.65" />
        <path d="M 178 305 L 178 190 C 178 134, 256 97, 256 97 C 256 97, 334 134, 334 190 L 334 305 Z" fill="none" stroke="#10B981" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.45" />
      </g>

      {/* 6. Holy Mushaf (Open Quran Al-Karim) */}
      <g transform="translate(256, 226)" filter="url(#alhudaDropShadow)">
        {/* Leather Base / Cover */}
        <path 
          d="M -160 22 C -100 -6, -26 -2, 0 16 C 26 -2, 100 -6, 160 22 C 164 52, 162 84, 160 120 C 100 94, 26 97, 0 118 C -26 97, -100 94, -160 120 C -162 84, -164 52, -160 22 Z" 
          fill="#021F12" 
          stroke="url(#alhudaGold24k)" 
          strokeWidth="5" 
          strokeLinejoin="round" 
        />

        {/* Left Page (Ivory Pearl) */}
        <path d="M -152 28 C -96 2, -24 6, 0 24 L 0 122 C -24 103, -96 100, -152 126 Z" fill="url(#alhudaPageLeft)" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M -142 36 C -92 12, -28 16, -6 32 L -6 116 C -28 99, -92 97, -142 120 Z" fill="none" stroke="url(#alhudaGold24k)" strokeWidth="1.4" opacity="0.85" />
        
        {/* Left Verses */}
        <line x1="-130" y1="52" x2="-22" y2="45" stroke="#047857" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <line x1="-130" y1="67" x2="-22" y2="60" stroke="#047857" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <line x1="-130" y1="82" x2="-22" y2="75" stroke="#047857" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <line x1="-130" y1="97" x2="-44" y2="90" stroke="url(#alhudaGold24k)" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />

        {/* Right Page (Golden Parchment) */}
        <path d="M 0 24 C 24 6, 96 2, 152 28 L 152 126 C 96 100, 24 103, 0 122 Z" fill="url(#alhudaPageRight)" stroke="#0F172A" strokeWidth="1.2" />
        <path d="M 6 32 C 28 16, 92 12, 142 36 L 142 120 C 92 97, 28 99, 6 116 Z" fill="none" stroke="url(#alhudaGold24k)" strokeWidth="1.4" opacity="0.85" />

        {/* Right Verses */}
        <line x1="22" y1="45" x2="130" y2="52" stroke="#92400E" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="60" x2="130" y2="67" stroke="#92400E" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="75" x2="130" y2="82" stroke="#92400E" strokeWidth="2.6" strokeLinecap="round" opacity="0.8" />
        <line x1="44" y1="90" x2="130" y2="97" stroke="url(#alhudaGold24k)" strokeWidth="2.8" strokeLinecap="round" opacity="0.95" />

        {/* Center Spine */}
        <path d="M -4 20 L 4 20 L 4 128 L -4 128 Z" fill="#01130A" opacity="0.85" />

        {/* Royal Ruby Silk Ribbon with Golden Star */}
        <path d="M -2 22 Q -5 85 14 134 L 25 156 L 36 142 L 27 128 Q 5 80 4 22 Z" fill="url(#alhudaRubyRibbon)" stroke="url(#alhudaGold24k)" strokeWidth="1.2" />
        <g transform="translate(25, 156) scale(0.65)">
          <rect x="-6" y="-6" width="12" height="12" fill="url(#alhudaGold24k)" stroke="#000" strokeWidth="0.8" />
          <rect x="-6" y="-6" width="12" height="12" fill="url(#alhudaGold24k)" stroke="#000" strokeWidth="0.8" transform="rotate(45)" />
        </g>
      </g>

      {/* 7. Beacon of Nur Ilahi & Azman AI Orb */}
      <g transform="translate(256, 150)" filter="url(#alhudaGlow)">
        <circle cx="0" cy="0" r="40" fill="url(#alhudaNurGlow)" opacity="0.95" />
        <circle cx="0" cy="0" r="27" fill="url(#alhudaEmeraldGem)" stroke="url(#alhudaGold24k)" strokeWidth="3.2" />
        <circle cx="0" cy="0" r="14" fill="#FFFFFF" opacity="0.9" />
        <path d="M -14 0 L -8 -7 L -4 7 L 0 -12 L 4 12 L 8 -7 L 14 0" fill="none" stroke="#012415" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="-30" cy="-14" r="2.4" fill="#FDE68A" />
        <circle cx="30" cy="-12" r="2.4" fill="#FDE68A" />
        <circle cx="0" cy="-36" r="3" fill="#FFFBEB" />
      </g>

      {/* 8. Optional Typography for Standalone Displays */}
      {showText && (
        <g filter="url(#alhudaDropShadow)">
          <text 
            x="256" 
            y="420" 
            fontFamily="'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" 
            fontWeight="900" 
            fontSize="52" 
            fill="url(#alhudaGold24k)" 
            textAnchor="middle" 
            letterSpacing="8"
          >
            AL-HUDA
          </text>
          <g transform="translate(256, 454)">
            <rect x="-130" y="-14" width="260" height="26" rx="13" fill="#011F13" stroke="url(#alhudaGold24k)" strokeWidth="1.6" opacity="0.95" />
            <text 
              x="0" 
              y="4.5" 
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" 
              fontWeight="800" 
              fontSize="11.5" 
              fill="#6EE7B7" 
              textAnchor="middle" 
              letterSpacing="3.5"
            >
              CAHAYA PETUNJUK
            </text>
          </g>
        </g>
      )}
    </svg>
  );
};
