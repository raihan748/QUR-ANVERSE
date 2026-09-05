import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  Sparkles, 
  Eye, 
  Sliders, 
  Gauge, 
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { ArticulatoryCoordinates, VocalTract3DHologramEngine } from '../../services/backend/frontier/VocalTract3DHologramEngine';

export interface TalkingMouth3DViewerProps {
  targetWord: string;
  spokenWord?: string;
  mistakeReason?: string;
  isSheikhSpeaking?: boolean;
  onPlayAudio?: () => void;
  breathRemainingPercent?: number;
}

interface ParsedPhoneme {
  letter: string;
  name: string;
  region: 'HALQ' | 'LISAN' | 'SYAFATAIN' | 'KHAISYUM' | 'JAUF';
  durationMs: number;
  coords: ArticulatoryCoordinates;
  description: string;
}

// Full Classical Arabic Makhraj Coordinates Registry
const ARABIC_PHONEME_COORDS: Record<string, {
  name: string;
  region: 'HALQ' | 'LISAN' | 'SYAFATAIN' | 'KHAISYUM' | 'JAUF';
  coords: ArticulatoryCoordinates;
  description: string;
}> = {
  // Syafatan (Bibir)
  'ب': {
    name: 'Ba (الشفتان)',
    region: 'SYAFATAIN',
    coords: { jawOpening: 0.1, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.1, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Kedua bibir mengatup rapat dari bagian dalam basah (Inthibaq).'
  },
  'م': {
    name: 'Mim (الشفتان والخيشوم)',
    region: 'SYAFATAIN',
    coords: { jawOpening: 0.1, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.1, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'OPEN_NASAL' },
    description: 'Kedua bibir mengatup rapat disertai dengung di pangkal hidung (Ghunnah).'
  },
  'و': {
    name: 'Waw (الشفتان)',
    region: 'SYAFATAIN',
    coords: { jawOpening: 0.35, tongueRootRetraction: 0.2, tongueDorsumElevation: 0.7, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.95, velumState: 'CLOSED' },
    description: 'Kedua bibir membulat maju membentuk lingkaran kecil (Inqibadh).'
  },
  'ف': {
    name: 'Fa (أطراف الثنايا وبطن الشفة)',
    region: 'SYAFATAIN',
    coords: { jawOpening: 0.2, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.1, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.1, velumState: 'CLOSED' },
    description: 'Ujung gigi seri atas menempel pada bagian dalam bibir bawah.'
  },

  // Halq (Tenggorokan)
  'ء': {
    name: 'Hamzah (أقصى الحلق)',
    region: 'HALQ',
    coords: { jawOpening: 0.5, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.1, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Pita suara menutup rapat di pangkal tenggorokan terdalam (Aqshal Halq).'
  },
  'ه': {
    name: 'Ha (أقصى الحلق)',
    region: 'HALQ',
    coords: { jawOpening: 0.5, tongueRootRetraction: 0.2, tongueDorsumElevation: 0.1, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Udara mengalir bebas di pangkal tenggorokan tanpa hambatan pita suara.'
  },
  'ع': {
    name: '\'Ain (وسط الحلق)',
    region: 'HALQ',
    coords: { jawOpening: 0.45, tongueRootRetraction: 0.95, tongueDorsumElevation: 0.2, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.1, velumState: 'CLOSED' },
    description: 'Penyempitan dinding tengah tenggorokan dan penarikan katup epiglotis (Wastul Halq).'
  },
  'ح': {
    name: 'Hha (وسط الحلق)',
    region: 'HALQ',
    coords: { jawOpening: 0.55, tongueRootRetraction: 0.85, tongueDorsumElevation: 0.1, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Gesekan hembusan nafas bersih di tengah tenggorokan (Hams).'
  },
  'غ': {
    name: 'Ghain (أدنى الحلق)',
    region: 'HALQ',
    coords: { jawOpening: 0.4, tongueRootRetraction: 0.7, tongueDorsumElevation: 0.8, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.2, velumState: 'CLOSED' },
    description: 'Ujung tenggorokan atas dekat uvula bergetar basah (Adnal Halq).'
  },
  'خ': {
    name: 'Kha (أدنى الحلق)',
    region: 'HALQ',
    coords: { jawOpening: 0.4, tongueRootRetraction: 0.65, tongueDorsumElevation: 0.85, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.1, velumState: 'CLOSED' },
    description: 'Gesekan udara kering di ujung tenggorokan atas mendekati langit-langit lunak.'
  },

  // Lisan (Lidah)
  'ق': {
    name: 'Qaf (أقصى اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.35, tongueRootRetraction: 0.35, tongueDorsumElevation: 0.98, tongueBladeElevation: 0.1, lateralTongueContact: 0, lipRounding: 0.2, velumState: 'CLOSED' },
    description: 'Pangkal lidah belakang menempel kuat ke langit-langit lunak (Velum).'
  },
  'ك': {
    name: 'Kaf (أقصى اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.35, tongueRootRetraction: 0.3, tongueDorsumElevation: 0.85, tongueBladeElevation: 0.2, lateralTongueContact: 0, lipRounding: 0.05, velumState: 'CLOSED' },
    description: 'Pangkal lidah sedikit lebih maju menempel di perbatasan langit keras dan lunak.'
  },
  'ج': {
    name: 'Jim (وسط اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.3, tongueRootRetraction: 0.15, tongueDorsumElevation: 0.5, tongueBladeElevation: 0.95, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Tengah lidah menempel rapat ke langit-langit keras (Syajarul Lisan).'
  },
  'ش': {
    name: 'Syin (وسط اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.35, tongueRootRetraction: 0.15, tongueDorsumElevation: 0.4, tongueBladeElevation: 0.85, lateralTongueContact: 0, lipRounding: 0.2, velumState: 'CLOSED' },
    description: 'Tengah lidah mendekat ke langit-langit dengan angin menyebar luas (Tafasysyi).'
  },
  'ي': {
    name: 'Ya (وسط اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.25, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.3, tongueBladeElevation: 0.8, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Tengah lidah terangkat tanpa menempel, sudut bibir melebar.'
  },
  'ض': {
    name: 'Dhad (حافة اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.28, tongueRootRetraction: 0.3, tongueDorsumElevation: 0.65, tongueBladeElevation: 0.5, lateralTongueContact: 0.95, lipRounding: 0.15, velumState: 'CLOSED' },
    description: 'Tepi lidah kiri/kanan menempel rapat ke dinding gigi geraham atas.'
  },
  'ل': {
    name: 'Lam (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.3, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.2, tongueBladeElevation: 0.9, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung permukaan lidah menempel pada gusi gigi seri atas hingga geraham depan.'
  },
  'ن': {
    name: 'Nun (طرف اللسان والخيشوم)',
    region: 'LISAN',
    coords: { jawOpening: 0.28, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.15, tongueBladeElevation: 0.92, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'OPEN_NASAL' },
    description: 'Ujung lidah menempel di gusi atas di bawah makhraj Lam disertai dengung hidung.'
  },
  'ر': {
    name: 'Ra (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.32, tongueRootRetraction: 0.2, tongueDorsumElevation: 0.3, tongueBladeElevation: 0.95, lateralTongueContact: 0, lipRounding: 0.1, velumState: 'CLOSED' },
    description: 'Punggung ujung lidah menempel ringan dengan getaran terkontrol (Takrir).'
  },
  'ط': {
    name: 'Tha (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.3, tongueRootRetraction: 0.35, tongueDorsumElevation: 0.8, tongueBladeElevation: 0.95, lateralTongueContact: 0, lipRounding: 0.2, velumState: 'CLOSED' },
    description: 'Ujung lidah menekan pangkal gigi seri atas dengan mengangkat pangkal lidah (Ithbaq).'
  },
  'د': {
    name: 'Dal (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.28, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.2, tongueBladeElevation: 0.92, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung lidah menempel di pangkal gigi seri atas secara tipis (Infitah).'
  },
  'ت': {
    name: 'Ta (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.28, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.15, tongueBladeElevation: 0.92, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung lidah menempel di pangkal gigi seri atas dengan sedikit hembusan nafas (Hams).'
  },
  'ص': {
    name: 'Shad (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.22, tongueRootRetraction: 0.35, tongueDorsumElevation: 0.75, tongueBladeElevation: 0.9, lateralTongueContact: 0, lipRounding: 0.2, velumState: 'CLOSED' },
    description: 'Ujung lidah di atas gigi seri bawah dengan desis kuat dan suara tebal (Isti\'la\').'
  },
  'س': {
    name: 'Sin (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.2, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.2, tongueBladeElevation: 0.85, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung lidah di atas gigi seri bawah dengan desis tajam dan suara tipis (Tarqiq).'
  },
  'ز': {
    name: 'Zai (طرف اللسان)',
    region: 'LISAN',
    coords: { jawOpening: 0.2, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.2, tongueBladeElevation: 0.85, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung lidah di atas gigi seri bawah dengan suara mendengung keras (Jahr).'
  },
  'ظ': {
    name: 'Zha (طرف اللسان ورأس الثنايا)',
    region: 'LISAN',
    coords: { jawOpening: 0.25, tongueRootRetraction: 0.35, tongueDorsumElevation: 0.75, tongueBladeElevation: 0.95, lateralTongueContact: 0, lipRounding: 0.2, velumState: 'CLOSED' },
    description: 'Ujung lidah sedikit keluar menyentuh ujung gigi seri atas dengan suara tebal.'
  },
  'ذ': {
    name: 'Dzal (طرف اللسان ورأس الثنايا)',
    region: 'LISAN',
    coords: { jawOpening: 0.25, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.2, tongueBladeElevation: 0.9, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung lidah sedikit keluar menyentuh ujung gigi seri atas dengan suara tipis.'
  },
  'ث': {
    name: 'Tsa (طرف اللسان ورأس الثنايا)',
    region: 'LISAN',
    coords: { jawOpening: 0.25, tongueRootRetraction: 0.1, tongueDorsumElevation: 0.15, tongueBladeElevation: 0.9, lateralTongueContact: 0, lipRounding: 0.0, velumState: 'CLOSED' },
    description: 'Ujung lidah sedikit keluar menyentuh ujung gigi seri atas dengan hembusan angin.'
  }
};

export const TalkingMouth3DViewer: React.FC<TalkingMouth3DViewerProps> = ({
  targetWord,
  spokenWord,
  mistakeReason,
  isSheikhSpeaking,
  onPlayAudio,
  breathRemainingPercent = 85
}) => {
  const [viewMode, setViewMode] = useState<'DUAL' | 'FRONT' | 'SAGITTAL'>('DUAL');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isSlowMotion, setIsSlowMotion] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0); // 0.0 to 1.0

  const frontCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sagittalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Parse Arabic word into sequential phonemes
  const parsedPhonemes = useMemo<ParsedPhoneme[]>(() => {
    if (!targetWord) return [];

    const rawChars = Array.from(targetWord);
    const phonemes: ParsedPhoneme[] = [];

    for (let i = 0; i < rawChars.length; i++) {
      const char = rawChars[i];
      let norm = char;
      if (['أ', 'إ', 'آ'].includes(char)) norm = 'ء';
      if (char === 'ة') norm = 'ه';
      if (char === 'ى') norm = 'ي';

      if (ARABIC_PHONEME_COORDS[norm]) {
        const info = ARABIC_PHONEME_COORDS[norm];
        const isShaddah = i + 1 < rawChars.length && rawChars[i + 1] === '\u0651';
        const hasDammah = (i + 1 < rawChars.length && rawChars[i + 1] === '\u064F') || (i + 2 < rawChars.length && rawChars[i + 2] === '\u064F');
        const hasFathah = (i + 1 < rawChars.length && rawChars[i + 1] === '\u064E') || (i + 2 < rawChars.length && rawChars[i + 2] === '\u064E');

        const adjustedCoords: ArticulatoryCoordinates = { ...info.coords };
        if (hasDammah) {
          adjustedCoords.lipRounding = Math.min(0.95, adjustedCoords.lipRounding + 0.35);
        } else if (hasFathah) {
          adjustedCoords.jawOpening = Math.min(0.85, adjustedCoords.jawOpening + 0.18);
        }

        phonemes.push({
          letter: char,
          name: info.name,
          region: info.region,
          durationMs: isShaddah ? 400 : 220,
          coords: adjustedCoords,
          description: info.description
        });
      }
    }

    if (phonemes.length === 0) {
      phonemes.push({
        letter: targetWord.charAt(0) || 'ع',
        name: 'Makhraj Huruf',
        region: 'HALQ',
        durationMs: 300,
        coords: ARABIC_PHONEME_COORDS['ع'].coords,
        description: ARABIC_PHONEME_COORDS['ع'].description
      });
    }

    return phonemes;
  }, [targetWord]);

  // Total word recitation cycle time
  const totalDurationMs = useMemo(() => {
    return parsedPhonemes.reduce((acc, p) => acc + p.durationMs, 0);
  }, [parsedPhonemes]);

  // Interpolate current coordinates & derive active phoneme index without state churn
  const { currentCoords, activePhonemeIndex } = useMemo(() => {
    if (parsedPhonemes.length === 0) {
      return {
        currentCoords: {
          jawOpening: 0.3,
          tongueRootRetraction: 0,
          tongueDorsumElevation: 0,
          tongueBladeElevation: 0,
          lateralTongueContact: 0,
          lipRounding: 0,
          velumState: 'CLOSED' as const
        },
        activePhonemeIndex: 0
      };
    }

    const elapsedMs = currentProgress * totalDurationMs;
    let accumulatedMs = 0;
    let currIdx = 0;
    let localRatio = 0;

    for (let i = 0; i < parsedPhonemes.length; i++) {
      const p = parsedPhonemes[i];
      if (elapsedMs <= accumulatedMs + p.durationMs) {
        currIdx = i;
        localRatio = (elapsedMs - accumulatedMs) / p.durationMs;
        break;
      }
      accumulatedMs += p.durationMs;
    }

    const currentP = parsedPhonemes[currIdx];
    const nextP = parsedPhonemes[(currIdx + 1) % parsedPhonemes.length];

    // Hermite smooth-step interpolation for organic anatomical movement
    const t = localRatio * localRatio * (3 - 2 * localRatio);
    const lerp = (a: number, b: number) => a + (b - a) * t;

    return {
      currentCoords: {
        jawOpening: lerp(currentP.coords.jawOpening, nextP.coords.jawOpening),
        tongueRootRetraction: lerp(currentP.coords.tongueRootRetraction, nextP.coords.tongueRootRetraction),
        tongueDorsumElevation: lerp(currentP.coords.tongueDorsumElevation, nextP.coords.tongueDorsumElevation),
        tongueBladeElevation: lerp(currentP.coords.tongueBladeElevation, nextP.coords.tongueBladeElevation),
        lateralTongueContact: lerp(currentP.coords.lateralTongueContact, nextP.coords.lateralTongueContact),
        lipRounding: lerp(currentP.coords.lipRounding, nextP.coords.lipRounding),
        velumState: currentP.coords.velumState
      },
      activePhonemeIndex: currIdx
    };
  }, [currentProgress, parsedPhonemes, totalDurationMs]);

  const activePhoneme = parsedPhonemes[activePhonemeIndex] || parsedPhonemes[0];

  // Main 60 FPS animation loop
  useEffect(() => {
    let lastTick = performance.now();

    const frameLoop = (now: number) => {
      if (isPlaying) {
        const delta = now - lastTick;
        const speed = isSlowMotion ? 0.5 : 1.0;
        const advance = (delta * speed) / Math.max(800, totalDurationMs);

        setCurrentProgress((prev) => (prev + advance) % 1.0);
      }
      lastTick = now;
      animationFrameRef.current = requestAnimationFrame(frameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(frameLoop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, isSlowMotion, totalDurationMs]);

  // --------------------------------------------------------------------------
  // RENDER CANVAS 1: Tampak Depan (3D Lips, Jaw, Teeth Opening)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = frontCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    const { jawOpening, lipRounding } = currentCoords;

    // Background gradient
    const bgGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width / 2);
    bgGrad.addColorStop(0, '#1E293B');
    bgGrad.addColorStop(1, '#0F172A');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Mouth dimensions modulated by viseme parameters
    const baseW = 100 - lipRounding * 45; // Width narrows when rounded (waw/dhommah)
    const baseH = 15 + jawOpening * 65;   // Height opens with jaw
    const lipThickness = 22;

    // 1. Oral Cavity (Dark Depth)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, baseW * 0.85, baseH * 0.85, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#050505';
    ctx.fill();

    // 2. Upper Dental Arch (Gigi Seri Atas)
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - baseH * 0.35, baseW * 0.65, 16, 0, 0, Math.PI);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CBD5E1';
    ctx.stroke();
    // Incisor separation lines
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * 14, centerY - baseH * 0.35 - 8);
      ctx.lineTo(centerX + i * 14, centerY - baseH * 0.35 + 8);
      ctx.strokeStyle = '#94A3B8';
      ctx.stroke();
    }
    ctx.restore();

    // 3. Lower Dental Arch (Gigi Seri Bawah)
    if (jawOpening > 0.15) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + baseH * 0.45, baseW * 0.55, 12, 0, Math.PI, 0);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();
      ctx.restore();
    }

    // 4. Tongue appearance from front view (if elevated)
    if (currentCoords.tongueBladeElevation > 0.4 || currentCoords.tongueDorsumElevation > 0.5) {
      ctx.beginPath();
      const tongueElevationOffset = (currentCoords.tongueBladeElevation - 0.5) * 20;
      ctx.ellipse(centerX, centerY + 8 - tongueElevationOffset, baseW * 0.45, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();
    }

    // 5. 3D Upper Lip (Shaded Bézier Mesh)
    ctx.save();
    const upperLipGrad = ctx.createLinearGradient(centerX, centerY - baseH - lipThickness, centerX, centerY);
    upperLipGrad.addColorStop(0, '#E11D48');
    upperLipGrad.addColorStop(0.5, '#FB7185');
    upperLipGrad.addColorStop(1, '#9F1239');

    ctx.beginPath();
    // Outer Cupid's Bow
    ctx.moveTo(centerX - baseW - 10, centerY);
    ctx.bezierCurveTo(
      centerX - baseW * 0.5, centerY - baseH - lipThickness * 0.8,
      centerX - 12, centerY - baseH - lipThickness,
      centerX, centerY - baseH - lipThickness * 0.6
    );
    ctx.bezierCurveTo(
      centerX + 12, centerY - baseH - lipThickness,
      centerX + baseW * 0.5, centerY - baseH - lipThickness * 0.8,
      centerX + baseW + 10, centerY
    );
    // Inner Upper Lip Margin
    ctx.bezierCurveTo(
      centerX + baseW * 0.5, centerY - baseH * 0.6,
      centerX, centerY - baseH * 0.8,
      centerX - baseW - 10, centerY
    );
    ctx.fillStyle = upperLipGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#881337';
    ctx.stroke();
    ctx.restore();

    // 6. 3D Lower Lip (Fuller Volume & Specular Shine)
    ctx.save();
    const lowerLipGrad = ctx.createLinearGradient(centerX, centerY, centerX, centerY + baseH + lipThickness * 1.2);
    lowerLipGrad.addColorStop(0, '#BE123C');
    lowerLipGrad.addColorStop(0.6, '#F43F5E');
    lowerLipGrad.addColorStop(1, '#881337');

    ctx.beginPath();
    ctx.moveTo(centerX - baseW - 10, centerY);
    // Inner Lower Lip Margin
    ctx.bezierCurveTo(
      centerX - baseW * 0.5, centerY + baseH * 0.5,
      centerX + baseW * 0.5, centerY + baseH * 0.5,
      centerX + baseW + 10, centerY
    );
    // Outer Lower Lip Curve
    ctx.bezierCurveTo(
      centerX + baseW * 0.6, centerY + baseH + lipThickness * 1.2,
      centerX - baseW * 0.6, centerY + baseH + lipThickness * 1.2,
      centerX - baseW - 10, centerY
    );
    ctx.fillStyle = lowerLipGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4C0519';
    ctx.stroke();

    // Specular highlight on lower lip
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + baseH * 0.65 + lipThickness * 0.35, baseW * 0.35, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fill();
    ctx.restore();

  }, [currentCoords]);

  // --------------------------------------------------------------------------
  // RENDER CANVAS 2: Tampak Samping Anatomi / Potongan Sagittal (Lidah & Faring)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = sagittalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // Coordinate Anchors (Nose on Left, Pharynx on Right)
    const palateStartX = 60;
    const palateStartY = 80;
    const pharynxX = 220;

    const { jawOpening, tongueRootRetraction, tongueDorsumElevation, tongueBladeElevation } = currentCoords;

    // 1. Hard Palate & Upper Jaw Contour (Bone structure)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(40, 110); // Upper lip
    ctx.lineTo(55, 100); // Upper incisor
    ctx.quadraticCurveTo(80, 50, 150, 50); // Hard Palate dome
    ctx.quadraticCurveTo(200, 50, pharynxX, 90); // Soft Palate (Velum)
    ctx.lineTo(pharynxX, height - 20); // Back pharyngeal wall
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#64748B';
    ctx.stroke();

    // Uvula (Langit-langit lunak)
    ctx.beginPath();
    ctx.ellipse(pharynxX - 15, 95, 6, 12, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#E2E8F0';
    ctx.fill();
    ctx.restore();

    // 2. Pharyngeal Constriction Indicator (Wastul Halq)
    if (tongueRootRetraction > 0.5) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(pharynxX - 25, 165, 18, 25, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();
      ctx.strokeStyle = '#EF4444';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.restore();
    }

    // 3. Dynamic 3D Tongue Body (Bézier spline)
    ctx.save();
    const jawDrop = jawOpening * 30;
    const tongueTipX = 65;
    const tongueTipY = 115 + jawDrop - tongueBladeElevation * 45; // Tip elevation
    const tongueDorsumY = 110 + jawDrop - tongueDorsumElevation * 55; // Dorsum velar elevation
    const tongueRootX = pharynxX - 45 + tongueRootRetraction * 25; // Pharyngeal constriction

    ctx.beginPath();
    // Tongue Base / Hyoid bone
    ctx.moveTo(90, 200 + jawDrop);
    // Ventral Tongue
    ctx.quadraticCurveTo(55, 175 + jawDrop, tongueTipX, tongueTipY);
    // Dorsal Tongue Curve
    ctx.bezierCurveTo(
      100, tongueDorsumY - 10,
      160, tongueDorsumY,
      tongueRootX, 170
    );
    // Root towards epiglottis
    ctx.quadraticCurveTo(tongueRootX - 5, 205, 90, 200 + jawDrop);

    const tongueGrad = ctx.createLinearGradient(tongueTipX, tongueTipY, tongueRootX, 200);
    tongueGrad.addColorStop(0, '#F43F5E');
    tongueGrad.addColorStop(0.5, '#E11D48');
    tongueGrad.addColorStop(1, '#9F1239');
    ctx.fillStyle = tongueGrad;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FDA4AF';
    ctx.stroke();

    // Active Makhraj Hotspot Glow (Pulse circle at contact point)
    let spotX = tongueTipX;
    let spotY = tongueTipY;
    let spotLabel = 'Ujung Lidah';

    if (tongueDorsumElevation > 0.6) {
      spotX = 145;
      spotY = tongueDorsumY;
      spotLabel = 'Pangkal Lidah (Aqshal Lisan)';
    } else if (tongueRootRetraction > 0.5) {
      spotX = tongueRootX;
      spotY = 165;
      spotLabel = 'Tengah Tenggorokan (Wastul Halq)';
    } else if (currentCoords.lipRounding > 0.5) {
      spotX = 35;
      spotY = 115;
      spotLabel = 'Bibir (Asy-Syafatan)';
    }

    ctx.beginPath();
    ctx.arc(spotX, spotY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Tag text on canvas
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`• ${spotLabel}`, 15, height - 15);
    ctx.restore();

  }, [currentCoords]);

  const safeBreath = Math.max(0, Math.min(100, Math.round(breathRemainingPercent || 0)));

  return (
    <div className="bg-[#111827] text-white border-2 border-red-500 rounded-2xl p-4 shadow-[4px_4px_0px_0px_#000] space-y-3 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-wider text-amber-300 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            3D TALKING MOUTH & ANATOMICAL VISEME ENGINE
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex bg-gray-800 p-0.5 rounded-xl border border-gray-600 gap-0.5 text-[10px] font-bold">
          <button
            onClick={() => setViewMode('DUAL')}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
              viewMode === 'DUAL' ? 'bg-[#0B4627] text-amber-300' : 'text-gray-300 hover:text-white'
            }`}
          >
            Dual-View
          </button>
          <button
            onClick={() => setViewMode('FRONT')}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
              viewMode === 'FRONT' ? 'bg-[#0B4627] text-amber-300' : 'text-gray-300 hover:text-white'
            }`}
          >
            Bibir
          </button>
          <button
            onClick={() => setViewMode('SAGITTAL')}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
              viewMode === 'SAGITTAL' ? 'bg-[#0B4627] text-amber-300' : 'text-gray-300 hover:text-white'
            }`}
          >
            Lidah
          </button>
        </div>
      </div>

      {/* Dual 3D Graphic Arena */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Front View Canvas */}
        {(viewMode === 'DUAL' || viewMode === 'FRONT') && (
          <div className="relative bg-slate-900 rounded-xl border border-gray-700 overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
            <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-black/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
              TAMPAK DEPAN (BIBIR & GIGI)
            </span>
            <canvas
              ref={frontCanvasRef}
              width={260}
              height={180}
              className="w-full h-auto max-w-[260px] rounded-lg"
            />
          </div>
        )}

        {/* Sagittal Cross-Section Canvas */}
        {(viewMode === 'DUAL' || viewMode === 'SAGITTAL') && (
          <div className="relative bg-slate-900 rounded-xl border border-gray-700 overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner">
            <span className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-black/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
              POTONGAN SAGITTAL (LIDAH & TENGGOROKAN)
            </span>
            <canvas
              ref={sagittalCanvasRef}
              width={260}
              height={180}
              className="w-full h-auto max-w-[260px] rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Active Phoneme Sequence Ribbon */}
      <div className="p-2.5 bg-black/60 rounded-xl border border-gray-700 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
            {parsedPhonemes.map((p, idx) => {
              const isActive = idx === activePhonemeIndex;
              return (
                <button
                  key={`${p.letter}-${idx}`}
                  onClick={() => {
                    const accum = parsedPhonemes.slice(0, idx).reduce((a, b) => a + b.durationMs, 0);
                    setCurrentProgress(accum / Math.max(1, totalDurationMs));
                    setIsPlaying(false);
                  }}
                  className={`w-9 h-9 rounded-xl font-quran text-lg font-bold flex items-center justify-center border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F59E0B] text-black border-white shadow-[2px_2px_0px_0px_#FFF] scale-105'
                      : 'bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700'
                  }`}
                  title={p.name}
                >
                  {p.letter}
                </button>
              );
            })}
          </div>

          {/* Active letter description badge */}
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono font-black text-emerald-400 block">
              {activePhoneme?.name}
            </span>
            <span className="text-[9px] text-gray-400 block">
              Wilayah: {activePhoneme?.region}
            </span>
          </div>
        </div>

        {/* Anatomical Action Description */}
        <p className="text-xs font-semibold text-emerald-200 bg-emerald-950/50 p-2 rounded-lg border border-emerald-700/50 leading-relaxed">
          💡 <strong className="text-amber-300">Posisi Makhraj:</strong> {activePhoneme?.description}
        </p>
      </div>

      {/* Playback Controls & Scrubber */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-[#0B4627] hover:bg-[#08351D] text-white rounded-xl border border-emerald-500 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Jeda' : 'Putar'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentProgress(0);
              setIsPlaying(true);
            }}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-600 text-xs cursor-pointer"
            title="Ulangi dari Awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsSlowMotion(!isSlowMotion)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
              isSlowMotion ? 'bg-amber-400 text-black border-black font-black' : 'bg-gray-800 text-gray-300 border-gray-600'
            }`}
          >
            {isSlowMotion ? '0.5x Slow' : '1.0x Normal'}
          </button>
        </div>

        {/* Breath Stamina Telemetry Indicator */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-gray-400">Stamina Nafas:</span>
          <div className="w-20 bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700">
            <div
              className={`h-full transition-all duration-300 ${
                safeBreath > 40 ? 'bg-emerald-400' : 'bg-red-400'
              }`}
              style={{ width: `${safeBreath}%` }}
            />
          </div>
          <span className="font-bold text-white">{safeBreath}%</span>
        </div>
      </div>
    </div>
  );
};
