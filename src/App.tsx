import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import { toPng, toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';

import {
  DocumentData,
  ThemeColor,
  TypographyConfig,
  PhotoConfig,
  SavedDraft,
  DocumentMode,
  ContentFitMetrics,
} from './types';

import {
  COLOR_THEMES,
  FONT_OPTIONS,
  DEFAULT_PHOTO_CONFIG,
  DEFAULT_TYPOGRAPHY,
  BLANK_TEMPLATE_PRESET,
  TECH_RESUME_PRESET,
  PROFESSIONAL_BIODATA_PRESET,
  ACADEMIC_CV_PRESET,
  ELECTRICIAN_TECHNICIAN_PRESET,
  TEMPLATE_DEMO_PRESETS,
  getDemoPresetForTemplate,
} from './data/presets';

import { LivePreview } from './components/LivePreview';
import { PhotoStudio } from './components/PhotoStudio';
import { SectionManager } from './components/SectionManager';
import { SavedDraftsModal } from './components/SavedDraftsModal';
import { AutoResizeTextarea } from './components/AutoResizeTextarea';
import { useAuth } from './context/AuthContext';

import {
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Award,
  Heart,
  Layers,
  Palette,
  LayoutGrid,
  Sparkles,
  Download,
  Printer,
  RefreshCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Bookmark,
  Zap,
  Plus,
  Edit,
  Check,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Camera,
  Cloud,
  LogOut,
  LogIn,
  Type,
  Phone,
  Mail,
  Sliders,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Calendar,
  Building,
  Globe,
  CreditCard,
  Move,
  ArrowLeftRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
} from 'lucide-react';

// Helper to remove any unwanted 'Mechanical Engineering' or 'Mechanical' text
function cleanMechanicalText(data: DocumentData): DocumentData {
  if (!data) return data;
  const clone = JSON.parse(JSON.stringify(data)) as DocumentData;

  // 1. Clean Education items mentioning Mechanical Engineering
  if (Array.isArray(clone.education)) {
    clone.education = clone.education
      .map((e) => {
        if (!e.examName) return e;
        if (/mechanical/i.test(e.examName)) {
          const stripped = e.examName
            .replace(/\s*(?:in|of)?\s*mechanical\s*engineering/gi, '')
            .replace(/mechanical\s*engineering/gi, '')
            .replace(/mechanical/gi, '')
            .trim();
          return {
            ...e,
            examName: stripped || 'Higher Secondary (Class XII)',
          };
        }
        return e;
      })
      .filter((e) => e.examName && e.examName.trim() !== '');
  }

  // 2. Tagline / role
  if (clone.taglineOrRole) {
    if (/senior software engineer|it consultant|b\.?tech senior|full-stack|systems engineer|senior full-stack/i.test(clone.taglineOrRole)) {
      clone.taglineOrRole = '';
    } else if (/mechanical/i.test(clone.taglineOrRole)) {
      clone.taglineOrRole = clone.taglineOrRole
        .replace(/mechanical\s*engineering/gi, '')
        .replace(/mechanical\s*(?:&|\/)?\s*/gi, '')
        .trim();
      if (!clone.taglineOrRole) {
        clone.taglineOrRole = 'Plant Maintenance & Operations Engineer';
      }
    }
  }

  // 3. Career objective
  if (clone.careerObjective && /mechanical/i.test(clone.careerObjective)) {
    clone.careerObjective = clone.careerObjective
      .replace(/mechanical\s*engineering/gi, 'Engineering')
      .replace(/dynamic\s+mechanical\s+engineer/gi, 'Dynamic Plant Engineer')
      .replace(/mechanical\s*engineer/gi, 'Plant Engineer')
      .replace(/mechanical/gi, '')
      .trim();
  }

  // 4. Email address
  if (clone.email && /mechanical|\.mech@/i.test(clone.email)) {
    clone.email = clone.email.replace(/\.mech@/gi, '@').replace(/mechanical/gi, '');
  }

  // 5. Website / LinkedIn cleanup - strip dummy template links
  if (clone.websiteOrLinkedin) {
    if (/rajesh-ghosh|siddhartha|ananya|thorne|priyadesign|priyasharma|debolina|vikram-cloud|vikram-das|tanusree-paul|rupam-halder|linkedin\.com\/in\//i.test(clone.websiteOrLinkedin)) {
      clone.websiteOrLinkedin = '';
    }
  }

  // 6. Clean matrimonial / traditional biodata fields if present
  if (Array.isArray(clone.personalDetails)) {
    clone.personalDetails = clone.personalDetails.filter((p) => {
      if (!p.label) return true;
      const lower = p.label.toLowerCase();
      return !/father'?s\s*name|mother'?s\s*name|marital\s*status|religion|caste|gotra|rashi|complexion|height|weight/i.test(lower);
    });
  }
  clone.familyDetails = [];
  clone.horoscopeDetails = [];
  clone.partnerExpectations = '';
  if (clone.mode === 'biodata') {
    clone.mode = 'resume';
  }
  if (clone.docType && (clone.docType.toUpperCase().includes('MARRIAGE') || clone.docType.toUpperCase().includes('BIODATA'))) {
    clone.docType = 'RESUME';
  }

  return clone;
}

// Color Picker Helper for Document Title & Candidate Identity (Structured Form Row)
function ColorPickerField({
  label,
  sublabel,
  value,
  themeColor,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value?: string;
  themeColor: string;
  onChange: (color: string) => void;
}) {
  const PRESET_COLORS = [
    { name: 'Dark Slate', hex: '#0f172a' },
    { name: 'Theme', hex: themeColor },
    { name: 'Royal Blue', hex: '#1d4ed8' },
    { name: 'Deep Navy', hex: '#0f2a4a' },
    { name: 'Emerald', hex: '#15803d' },
    { name: 'Amber Gold', hex: '#b45309' },
    { name: 'Crimson', hex: '#dc2626' },
    { name: 'Purple', hex: '#7c3aed' },
    { name: 'White', hex: '#ffffff' },
  ];

  const activeColor = value || themeColor;

  return (
    <div className="bg-white p-4 border border-slate-200 space-y-2.5 w-full">
      {/* Line 1: The label sits on its own line */}
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-[#0d8f62] shrink-0" />
        <span className="text-xs font-bold text-slate-800">{label}</span>
        {sublabel && <span className="text-[11px] text-slate-500">— {sublabel}</span>}
      </div>

      {/* Line 2: The "Auto (Theme Default)" tag on the next line */}
      <div>
        {value ? (
          <div className="inline-flex items-center gap-2 bg-slate-50 px-2.5 py-1 border border-slate-200 text-xs">
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs inline-block shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-[11px] font-mono font-bold text-slate-800 uppercase">{value}</span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold ml-1.5 hover:underline cursor-pointer"
              title="Reset to theme default"
            >
              Reset to Auto
            </button>
          </div>
        ) : (
          <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 border border-slate-200">
            Auto (Theme Default)
          </span>
        )}
      </div>

      {/* Line 3: The color swatches wrap below, so nothing overlaps */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onChange('')}
          className={`px-3 py-1.5 text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
            !value
              ? 'bg-[#0d8f62] text-white border-[#0d8f62] shadow-2xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span>Auto</span>
        </button>

        {PRESET_COLORS.map((swatch, idx) => {
          const isSelected = value?.toLowerCase() === swatch.hex.toLowerCase();
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(swatch.hex)}
              title={`${swatch.name} (${swatch.hex})`}
              style={{ backgroundColor: swatch.hex }}
              className={`w-7 h-7 border transition cursor-pointer shrink-0 ${
                isSelected
                  ? 'ring-2 ring-[#0d8f62] ring-offset-1 border-white shadow-xs scale-105'
                  : 'border-slate-300 hover:scale-105'
              }`}
            />
          );
        })}

        {/* Custom Color Input */}
        <label
          title="Pick Custom Color"
          className="relative flex items-center justify-center w-7 h-7 border border-slate-300 bg-slate-50 hover:bg-white shadow-2xs cursor-pointer transition hover:scale-105 overflow-hidden"
        >
          <input
            type="color"
            value={activeColor || '#0f172a'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <Palette className="w-3.5 h-3.5 text-slate-600" />
        </label>
      </div>
    </div>
  );
}

export default function App() {
  const { user, signIn, signOut } = useAuth();

  // Main state
  const [docData, setDocData] = useState<DocumentData>(() => {
    const saved = localStorage.getItem('PRATIDIN_active_resume_data');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (parsed.mode === 'biodata') {
          parsed.mode = 'resume';
        }
        if (parsed.docType && (parsed.docType.toUpperCase().includes('MARRIAGE') || parsed.docType.toUpperCase().includes('BIODATA'))) {
          parsed.docType = 'RESUME';
        }
        if (parsed.mode === 'resume') {
          parsed.projects = [];
          if (parsed.sectionsOrder) {
            parsed.sectionsOrder = parsed.sectionsOrder.filter((s: any) => s.key !== 'projects');
          }
        }
        parsed = cleanMechanicalText(parsed);
        if (parsed.fullName && parsed.fullName.trim() !== '') {
          return parsed;
        }
      } catch (e) {}
    }
    return cleanMechanicalText(TECH_RESUME_PRESET);
  });

  const [templateId, setTemplateId] = useState<number>(1);
  const [theme, setTheme] = useState<ThemeColor>(COLOR_THEMES[5]);
  const [font, setFont] = useState(FONT_OPTIONS[0]);
  const [photo, setPhoto] = useState<PhotoConfig>(DEFAULT_PHOTO_CONFIG);
  const [typography, setTypography] = useState<TypographyConfig>(DEFAULT_TYPOGRAPHY);

  // Primary Navigation Sections (as requested: "photo upload", "text input", "colour edit", "font curection")
  type MainTab = 'photo' | 'text' | 'color' | 'font';
  const [activeTab, setActiveTab] = useState<MainTab>('text');
  const [textSubTab, setTextSubTab] = useState<
    'basics' | 'objective' | 'education' | 'experience' | 'skills' | 'family' | 'sections' | 'all'
  >('basics');
  // Preview Scaling & Fullscreen State (Requirements: Fit option kept at 38%)
  const [currentScale, setCurrentScale] = useState<number>(0.38);
  const [isAutoFit, setIsAutoFit] = useState<boolean>(true);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('DOCCRAFT_theme_mode') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('DOCCRAFT_theme_mode', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('DOCCRAFT_theme_mode', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-fit calculation: In preview panel, Fit option is strictly 38% (0.38) as requested ("Fit option chap dile 38% hobe 15 % noi")
  const calculateFitScale = useCallback(() => {
    if (isPreviewFullscreen) {
      const container = previewContainerRef.current;
      if (!container) return 0.85;
      const containerWidth = Math.max(60, container.clientWidth - 48);
      const containerHeight = Math.max(60, container.clientHeight - 48);
      const scale = Math.min(containerWidth / 794, containerHeight / 1123, 1);
      return Math.max(0.38, Number(scale.toFixed(2)));
    }
    // Standard preview panel: Always exactly 38% (0.38)
    return 0.38;
  }, [isPreviewFullscreen]);

  const runAutoFit = useCallback(() => {
    if (!isPreviewFullscreen) {
      setCurrentScale(0.38);
      return;
    }
    const fit = calculateFitScale();
    if (fit && fit > 0) {
      setCurrentScale(fit);
    } else {
      setCurrentScale(0.38);
    }
  }, [calculateFitScale, isPreviewFullscreen]);

  // Recalculate on load, window resize, and ResizeObserver on the preview container
  useEffect(() => {
    runAutoFit();
    const timer = setTimeout(runAutoFit, 60);

    const handleResize = () => {
      if (isAutoFit) {
        runAutoFit();
      }
    };

    const container = previewContainerRef.current;
    let ro: ResizeObserver | null = null;
    if (container) {
      ro = new ResizeObserver(() => {
        handleResize();
      });
      ro.observe(container);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [runAutoFit, isAutoFit]);

  // When fullscreen toggles, re-run auto-fit
  useEffect(() => {
    const timer = setTimeout(() => {
      runAutoFit();
      setIsAutoFit(true);
    }, 60);
    return () => clearTimeout(timer);
  }, [isPreviewFullscreen, runAutoFit]);

  // Allow ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewFullscreen) {
        setIsPreviewFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewFullscreen]);

  const handleFitClick = () => {
    setIsAutoFit(true);
    if (isPreviewFullscreen) {
      runAutoFit();
    } else {
      setCurrentScale(0.38);
    }
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setCurrentScale((prev) => Math.max(0.2, Number((prev - 0.05).toFixed(2))));
  };

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setCurrentScale((prev) => Math.min(2.0, Number((prev + 0.05).toFixed(2))));
  };

  const handleToggleFullscreen = () => {
    setIsPreviewFullscreen((prev) => !prev);
  };

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(115);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    const ro = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [activeTab, textSubTab]);

  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [fitScale, setFitScale] = useState<number>(1);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
  const [pageMetrics, setPageMetrics] = useState<ContentFitMetrics>({
    naturalHeight: 1123,
    targetHeight: 1123,
    diffPx: 0,
    fillPercent: 100,
    isOverflowing: false,
    isUnderflowing: false,
  });

  // Modals
  const [isDraftsModalOpen, setIsDraftsModalOpen] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [skillsViewMode, setSkillsViewMode] = useState<'text' | 'rows'>('text');
  const [keySkillsInput, setKeySkillsInput] = useState<string | null>(null);
  const [showPhotoPositionBar, setShowPhotoPositionBar] = useState<boolean>(false);

  // Document Mode Dropdown State (Resume, CV, Bio-Data)
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  // Document Actions Dropdown State (Draft, Print, Export PDF)
  const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState<boolean>(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setIsModeDropdownOpen(false);
      }
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(e.target as Node)) {
        setIsActionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const DOC_MODES = [
    {
      id: 'resume' as const,
      label: 'Resume',
      subtitle: 'Modern Technical & Job Application',
      badge: 'Job Application',
      defaultTitle: 'RESUME',
      preset: TECH_RESUME_PRESET,
      icon: <Briefcase className="w-3.5 h-3.5" />,
    },
    {
      id: 'cv' as const,
      label: 'CV',
      subtitle: 'Curriculum Vitae / Academic & Detailed Profile',
      badge: 'Academic / Professional',
      defaultTitle: 'CURRICULUM VITAE',
      preset: ACADEMIC_CV_PRESET,
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
  ];

  const activeModeObj = DOC_MODES.find((m) => m.id === docData.mode) || DOC_MODES[0];

  const handleMetricsChange = (metrics: ContentFitMetrics) => {
    setPageMetrics(metrics);
    setIsOverflowing(metrics.isOverflowing);
  };

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('PRATIDIN_active_resume_data', JSON.stringify(docData));
  }, [docData]);

  // Clean any unwanted 'Mechanical' text and ensure no leftover biodata mode on load
  useEffect(() => {
    setDocData((prev) => {
      let cleaned = cleanMechanicalText(prev);
      if (cleaned.mode === 'biodata') {
        cleaned = {
          ...cleaned,
          mode: 'resume',
          docType: (cleaned.docType && cleaned.docType.includes('BIODATA')) ? 'RESUME' : cleaned.docType,
        };
      }
      if (JSON.stringify(cleaned) !== JSON.stringify(prev)) {
        return cleaned;
      }
      return prev;
    });
  }, []);

  // Check page overflow against 1123px A4 canvas standard
  const checkOverflow = () => {
    const el = document.getElementById('a4-document-stage');
    if (el) {
      const hasOverflow = el.scrollHeight > 1125 && fitScale >= 0.98;
      setIsOverflowing(hasOverflow);
      return hasOverflow;
    }
    return false;
  };

  // Step helper for Candidate Name / Main Title Size
  const stepHeaderTitleSize = (delta: number) => {
    setTypography((prev) => {
      const next = Math.max(14, Math.min(36, Number((prev.headerTitleSize + delta).toFixed(1))));
      return {
        ...prev,
        headerTitleSize: next,
      };
    });
  };

  const updateHeaderTitleSize = (newSize: number) => {
    const clamped = Math.max(14, Math.min(36, Number(newSize.toFixed(1))));
    setTypography((prev) => ({
      ...prev,
      headerTitleSize: clamped,
    }));
  };

  // Step helper for Designation / Subtitle Size
  const stepHeaderSubtitleSize = (delta: number) => {
    setTypography((prev) => {
      const next = Math.max(8.5, Math.min(24, Number((prev.headerSubtitleSize + delta).toFixed(1))));
      return {
        ...prev,
        headerSubtitleSize: next,
      };
    });
  };

  const updateHeaderSubtitleSize = (newSize: number) => {
    const clamped = Math.max(8.5, Math.min(24, Number(newSize.toFixed(1))));
    setTypography((prev) => ({
      ...prev,
      headerSubtitleSize: clamped,
    }));
  };

  // Step helper for Section Headings Size
  const stepSectionHeaderSize = (delta: number) => {
    setTypography((prev) => {
      const next = Math.max(8.5, Math.min(22, Number((prev.sectionHeaderSize + delta).toFixed(1))));
      return {
        ...prev,
        sectionHeaderSize: next,
      };
    });
  };

  const updateSectionHeaderSize = (newSize: number) => {
    const clamped = Math.max(8.5, Math.min(22, Number(newSize.toFixed(1))));
    setTypography((prev) => ({
      ...prev,
      sectionHeaderSize: clamped,
    }));
  };

  // Step helper for Body & Personal Details/Contact Font Size (Unified)
  const stepBodyTextSize = (delta: number) => {
    setTypography((prev) => {
      const next = Math.max(8, Math.min(18, Number((prev.bodyTextSize + delta).toFixed(1))));
      return {
        ...prev,
        bodyTextSize: next,
        personalContactSize: next,
      };
    });
  };

  const updateBodyTextSize = (newSize: number) => {
    const clamped = Math.max(8, Math.min(18, Number(newSize.toFixed(1))));
    setTypography((prev) => ({
      ...prev,
      bodyTextSize: clamped,
      personalContactSize: clamped,
    }));
  };

  // Master scaler: scale all text elements across the entire template simultaneously
  const scaleAllTextSizes = (delta: number) => {
    setTypography((prev) => {
      const nextBody = Math.max(8, Math.min(18, Number((prev.bodyTextSize + delta).toFixed(1))));
      const nextSection = Math.max(9, Math.min(22, Number((prev.sectionHeaderSize + delta * 1.1).toFixed(1))));
      const nextSubtitle = Math.max(11, Math.min(26, Number((prev.headerSubtitleSize + delta * 1.2).toFixed(1))));
      const nextTitle = Math.max(16, Math.min(34, Number((prev.headerTitleSize + delta * 1.5).toFixed(1))));
      return {
        ...prev,
        bodyTextSize: nextBody,
        personalContactSize: nextBody,
        sectionHeaderSize: nextSection,
        headerSubtitleSize: nextSubtitle,
        headerTitleSize: nextTitle,
      };
    });
  };

  // Quick 1-click global text size presets across entire template
  const applyGlobalTextSizePreset = (mode: 'compact' | 'normal' | 'large' | 'extralarge') => {
    setTypography((prev) => {
      switch (mode) {
        case 'compact':
          return {
            ...prev,
            bodyTextSize: 10,
            personalContactSize: 10,
            sectionHeaderSize: 11.5,
            headerSubtitleSize: 13,
            headerTitleSize: 20,
          };
        case 'normal':
          return {
            ...prev,
            bodyTextSize: 12,
            personalContactSize: 12,
            sectionHeaderSize: 13.5,
            headerSubtitleSize: 16,
            headerTitleSize: 22,
          };
        case 'large':
          return {
            ...prev,
            bodyTextSize: 13.5,
            personalContactSize: 13.5,
            sectionHeaderSize: 15,
            headerSubtitleSize: 18.5,
            headerTitleSize: 24,
          };
        case 'extralarge':
          return {
            ...prev,
            bodyTextSize: 15,
            personalContactSize: 15,
            sectionHeaderSize: 17,
            headerSubtitleSize: 21,
            headerTitleSize: 26,
          };
        default:
          return prev;
      }
    });
  };

  // Reset all text sizes to standard defaults
  const resetAllFontSizes = () => {
    setTypography((prev) => ({
      ...prev,
      headerTitleSize: DEFAULT_TYPOGRAPHY.headerTitleSize,
      headerSubtitleSize: DEFAULT_TYPOGRAPHY.headerSubtitleSize,
      sectionHeaderSize: DEFAULT_TYPOGRAPHY.sectionHeaderSize,
      bodyTextSize: DEFAULT_TYPOGRAPHY.bodyTextSize,
      personalContactSize: DEFAULT_TYPOGRAPHY.bodyTextSize,
    }));
  };

  // Step helper for Page Padding / Margins
  const stepPagePadding = (delta: number) => {
    setTypography((prev) => ({
      ...prev,
      pagePadding: Math.max(8, Math.min(32, prev.pagePadding + delta)),
    }));
  };

  // Step helper for Section Spacing Gap
  const stepElementSpacing = (delta: number) => {
    setTypography((prev) => ({
      ...prev,
      elementSpacing: Math.max(2, Math.min(24, prev.elementSpacing + delta)),
    }));
  };

  // Step helper for Line Height
  const stepLineHeight = (delta: number) => {
    setTypography((prev) => ({
      ...prev,
      lineHeight: Math.max(1.15, Math.min(1.75, Number((prev.lineHeight + delta).toFixed(2)))),
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkOverflow();
    }, 150);
    return () => clearTimeout(timer);
  }, [docData, templateId, theme, photo, typography]);

  // Auto-Fit Engine: Targets 1123px A4 height, lowers text size in 0.5px steps down to 9.5px, then margin to 10px
  const handleAutoFit = (showNotification = true) => {
    const TARGET_HEIGHT = 1123;
    const currentHeight = pageMetrics.naturalHeight > 100 
      ? pageMetrics.naturalHeight 
      : 1123;

    const diff = currentHeight - TARGET_HEIGHT;
    const isOver = diff > 2 || pageMetrics.isOverflowing;
    const isUnder = diff < -80 || pageMetrics.isUnderflowing;

    setTypography((prev) => {
      let newBody = prev.bodyTextSize;
      let newSpacing = prev.elementSpacing;
      let newPadding = prev.pagePadding;
      let newLineHeight = prev.lineHeight;

      if (isOver) {
        // Lower text size in 0.5px steps down to 9.5px
        const steps = Math.min(8, Math.max(1, Math.ceil(diff / 32)));
        newBody = Math.max(9.5, Number((prev.bodyTextSize - steps * 0.5).toFixed(1)));

        // Then lower page margin down to 10px and element spacing if still overflowing or near limit
        if (newBody <= 11 || diff > 45) {
          newPadding = Math.max(10, Math.round(prev.pagePadding - Math.min(prev.pagePadding - 10, 4)));
          newSpacing = Math.max(4, Math.round(prev.elementSpacing - 2));
          newLineHeight = Math.max(1.30, Number((prev.lineHeight - 0.04).toFixed(2)));
        }
      } else if (isUnder) {
        // Content is brief: expand font and margins gently to fill page
        newBody = Math.min(14.0, Number((prev.bodyTextSize + 0.5).toFixed(1)));
        newSpacing = Math.min(18.0, Number((prev.elementSpacing + 1.5).toFixed(1)));
        newPadding = Math.min(24, prev.pagePadding + 2);
        newLineHeight = Math.min(1.50, Number((prev.lineHeight + 0.03).toFixed(2)));
      }

      const newSectionHeader = Math.max(11, Number((newBody + 1.5).toFixed(1)));
      const newHeaderSubtitle = Math.max(13, Number((newBody + 2.5).toFixed(1)));
      const newHeaderTitle = Math.max(18, Number((newBody * 1.5).toFixed(1)));

      return {
        ...prev,
        bodyTextSize: newBody,
        personalContactSize: newBody,
        sectionHeaderSize: newSectionHeader,
        headerSubtitleSize: newHeaderSubtitle,
        headerTitleSize: newHeaderTitle,
        elementSpacing: newSpacing,
        pagePadding: newPadding,
        lineHeight: newLineHeight,
      };
    });

    setIsOverflowing(false);
    if (showNotification) {
      showToast('⚡ Auto-Fit complete: Optimized to fit 1 page A4 (1123px)');
    }
  };

  // Helper State Handlers
  const updateField = (key: keyof DocumentData, val: any) => {
    setDocData((prev) => ({ ...prev, [key]: val }));
  };

  const getPersonalValue = (keyword: string): string => {
    const item = docData.personalDetails?.find((p) => p.label.toLowerCase().includes(keyword.toLowerCase()));
    return item ? item.value : '';
  };

  const updatePersonalValue = (keyword: string, val: string, defaultLabel: string) => {
    const list = docData.personalDetails ? [...docData.personalDetails] : [];
    const idx = list.findIndex((p) => p.label.toLowerCase().includes(keyword.toLowerCase()));
    if (idx >= 0) {
      list[idx] = { ...list[idx], value: val };
    } else {
      list.push({
        id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        label: defaultLabel,
        value: val,
        isCustom: false,
      });
    }
    updateField('personalDetails', list);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Presets load
  const loadPreset = (preset: DocumentData) => {
    const cleaned = cleanMechanicalText(preset);
    setDocData(cleaned);
    localStorage.setItem('PRATIDIN_active_resume_data', JSON.stringify(cleaned));
    if (cleaned.fullName === 'RAHUL KUMAR') {
      setTemplateId(7);
      setTheme(COLOR_THEMES[0]);
    } else if (cleaned.mode === 'cv') {
      setTemplateId(8);
      setTheme(COLOR_THEMES[2]); // Charcoal
    } else {
      setTemplateId(7);
      setTheme(COLOR_THEMES[0]); // Slate Blue
    }
    showToast('Loaded preset template!');
  };

  // Fill complete demo data for active template
  const fillDemoDataForActiveTemplate = (targetId?: number) => {
    const tId = targetId !== undefined ? targetId : templateId;
    const demo = cleanMechanicalText(getDemoPresetForTemplate(tId));
    setDocData(demo);
    localStorage.setItem('PRATIDIN_active_resume_data', JSON.stringify(demo));
    if (targetId !== undefined) {
      setTemplateId(targetId);
    }
    showToast(`Loaded complete demo input data for Template #${tId}! `);
  };

  const handleSelectTemplate = (id: number) => {
    setTemplateId(id);
    if (id === 1 || id === 6) {
      const violetTheme = COLOR_THEMES.find((t) => t.id === 'amethyst');
      if (violetTheme) setTheme(violetTheme);
    }
    // If the data was completely cleared or blank, auto-populate with the template's demo data
    if (!docData.fullName || docData.fullName.trim() === '') {
      const demo = cleanMechanicalText(getDemoPresetForTemplate(id));
      setDocData(demo);
      localStorage.setItem('PRATIDIN_active_resume_data', JSON.stringify(demo));
    }
  };

  // Clear all text fields to completely blank state (Instant, no blocking window.confirm)
  const clearAllToBlank = () => {
    setDocData(BLANK_TEMPLATE_PRESET);
    localStorage.setItem('PRATIDIN_active_resume_data', JSON.stringify(BLANK_TEMPLATE_PRESET));
    showToast('All fields have been cleared to blank!');
  };

  const [isGeneratingImg, setIsGeneratingImg] = useState(false);

  // Helper to render high-quality document canvas for PDF & Image download
  const captureDocumentImage = async (): Promise<string> => {
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch (e) {
        console.warn('fonts.ready check:', e);
      }
    }

    const pureExportStage = document.getElementById('pure-export-stage');
    const liveStage = document.getElementById('a4-document-stage');
    const printDoc = document.getElementById('print-a4-document');

    // Prefer pureExportStage which is permanently unscaled (0 CSS transform, no zoom distortion)
    const targetEl = pureExportStage || liveStage || printDoc;

    if (!targetEl) {
      throw new Error('Export element not found');
    }

    // Method 1: High-fidelity native SVG foreignObject rendering via toPng
    // skipFonts: true and fontEmbedCSS: '' prevent reading cross-origin cssRules (SecurityError on Google Fonts)
    try {
      const dataUrl = await toPng(targetEl, {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });
      if (dataUrl && dataUrl.length > 2000) {
        return dataUrl;
      }
    } catch (pngErr) {
      console.warn('toPng primary export note:', pngErr);
    }

    // Method 2: html-to-image toJpeg
    try {
      const dataUrl = await toJpeg(targetEl, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });
      if (dataUrl && dataUrl.length > 2000) {
        return dataUrl;
      }
    } catch (jpegErr) {
      console.warn('toJpeg export note:', jpegErr);
    }

    // Method 3: html2canvas with clean unscaled target
    try {
      const canvas = await html2canvas(targetEl, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123,
      });

      const dataUrl = canvas.toDataURL('image/png');
      if (dataUrl && dataUrl.length > 2000) {
        return dataUrl;
      }
    } catch (canvasErr) {
      console.warn('html2canvas fallback note:', canvasErr);
    }

    throw new Error('Could not capture document image');
  };

  // PDF Export
  const downloadPdf = async () => {
    setIsGeneratingPdf(true);

    try {
      const imgData = await captureDocumentImage();

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const format = imgData.startsWith('data:image/png') ? 'PNG' : 'JPEG';
      pdf.addImage(imgData, format, 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const safeName = (docData.fullName || 'Document')
        .trim()
        .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')
        .replace(/_+/g, '_');
      const fileName = `${safeName || 'Document'}_Resume.pdf`;

      // 1. Direct save
      try {
        pdf.save(fileName);
      } catch (saveErr) {
        console.warn('pdf.save note:', saveErr);
      }

      // 2. Direct Blob anchor click
      try {
        const blob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        }, 8000);
      } catch (blobErr) {
        console.warn('Blob download error:', blobErr);
      }

    } catch (err) {
      console.error('PDF Generation Error:', err);
      showToast('Direct PDF generation encountered an issue. Opening browser print/save dialog...');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = async () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Direct print blocked or failed, generating PDF instead:', err);
      await downloadPdf();
    }
  };

  // Direct Image (JPG/PNG) Export
  const downloadImage = async () => {
    setIsGeneratingImg(true);
    try {
      const imgData = await captureDocumentImage();
      const safeName = (docData.fullName || 'Document')
        .trim()
        .replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')
        .replace(/_+/g, '_');
      const fileName = `${safeName || 'Document'}_Resume.jpg`;

      const link = document.createElement('a');
      link.href = imgData;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 8000);
    } catch (err) {
      console.error('Image export error:', err);
      showToast('Could not export image. Please use Print / Save as PDF.');
    } finally {
      setIsGeneratingImg(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col website-ui selection:bg-indigo-600 selection:text-white pb-6 sm:pb-8 overflow-x-clip w-full max-w-full"
    >
      {/* Drafts Manager Modal */}
      <SavedDraftsModal
        isOpen={isDraftsModalOpen}
        onClose={() => setIsDraftsModalOpen(false)}
        currentData={docData}
        currentTemplateId={templateId}
        currentTheme={theme}
        currentPhoto={photo}
        currentTypography={typography}
        onLoadDraft={(draft: SavedDraft) => {
          setDocData(draft.docData);
          setTemplateId(draft.templateId);
          setTheme(draft.theme);
          setPhoto(draft.photo);
          setTypography(draft.typography);
        }}
        onImportJson={(imported) => {
          if (imported.docData) setDocData(imported.docData);
          if (imported.templateId) setTemplateId(imported.templateId);
          if (imported.theme) setTheme(imported.theme);
          if (imported.photo) setPhoto(imported.photo);
          if (imported.typography) setTypography(imported.typography);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVBAR TOOLBAR - THREE FULL-WIDTH ROWS */}
      <header
        ref={headerRef}
        className="bg-white border-b border-slate-200/90 px-2 sm:px-6 py-2 sticky top-0 z-40 shadow-xs no-print w-full max-w-full"
      >
        <div className="w-full flex flex-col gap-1.5">
          {/* ROW 1: Logo, "DocCraft Studio" with subtitle "A4 Resume & Bio-Data Creator", Format dropdown ("Resume") on the left. On the right: theme toggle, Demo Data, Clear, "Draft • Print • Export", Sign In */}
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4 flex-wrap sm:flex-nowrap min-w-0">
            {/* Left: Brand & Format Dropdown */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="leading-tight">
                  <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-1 whitespace-nowrap">
                    <span>DocCraft</span> <span className="text-indigo-600 font-extrabold">Studio</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">A4 Resume & Bio-Data Creator</p>
                </div>
              </div>

              {/* Format dropdown */}
              <div className="relative shrink-0" ref={modeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModeDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 bg-[#0d8f62] hover:bg-[#0b7a53] text-white font-bold text-xs py-1.5 px-3 shadow-xs transition-all duration-150 cursor-pointer ring-2 ring-[#0d8f62]/25 active:scale-95 shrink-0"
                  aria-expanded={isModeDropdownOpen}
                  aria-haspopup="true"
                  title="Select Document Format (Resume, CV, Bio-Data)"
                >
                  <span className="text-white flex items-center shrink-0">
                    {activeModeObj.icon}
                  </span>
                  <span className="tracking-wide uppercase font-extrabold text-xs whitespace-nowrap">
                    {activeModeObj.label}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/90 transition-transform duration-200 shrink-0 ${
                      isModeDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isModeDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 shadow-2xl z-50 p-1.5 space-y-1.5 animate-in fade-in duration-150">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Document Format</span>
                      <span className="text-[#0d8f62] font-extrabold">Selected: {activeModeObj.label}</span>
                    </div>
                    {DOC_MODES.map((m) => {
                      const isSelected = docData.mode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            loadPreset(m.preset);
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 ${
                            isSelected
                              ? 'bg-[#0d8f62] text-white border-2 border-[#0b7a53] shadow-xs font-bold ring-2 ring-[#0d8f62]/25'
                              : 'bg-white hover:bg-emerald-50/70 text-slate-800 hover:text-emerald-950 border border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-7 h-7 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-white/20 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {m.icon}
                            </span>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold ${
                                    isSelected ? 'text-white' : 'text-slate-900'
                                  }`}
                                >
                                  {m.label}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 font-semibold uppercase ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {m.badge}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] truncate mt-0.5 ${
                                  isSelected ? 'text-white/80' : 'text-slate-500'
                                }`}
                              >
                                {m.subtitle}
                              </span>
                            </div>
                          </div>
                          {isSelected && (
                            <span className="shrink-0 w-5 h-5 bg-white text-[#0d8f62] flex items-center justify-center shadow-xs font-black">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: theme toggle, Demo Data, Clear, Draft • Print • Export, Sign In */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0 flex-wrap justify-end">
              {/* Dark / Light Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsDarkMode((prev) => !prev)}
                className="inline-flex items-center justify-center text-xs font-semibold text-slate-700 hover:text-[#0d8f62] bg-white hover:bg-emerald-50/60 p-2 sm:px-2.5 sm:py-1.5 border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => fillDemoDataForActiveTemplate()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#0d8f62] bg-white hover:bg-emerald-50/60 px-2.5 sm:px-3 py-1.5 border border-slate-200 transition cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                title="Fill all fields with complete demo data"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#0d8f62] shrink-0" />
                <span className="whitespace-nowrap font-medium">Demo Data</span>
              </button>

              {/* Clear Button: Requires second click to confirm */}
              <button
                type="button"
                onClick={() => {
                  if (isConfirmingClear) {
                    clearAllToBlank();
                    setIsConfirmingClear(false);
                  } else {
                    setIsConfirmingClear(true);
                    setTimeout(() => setIsConfirmingClear(false), 3500);
                  }
                }}
                className={`text-xs font-semibold px-2.5 py-1.5 flex items-center gap-1.5 transition cursor-pointer shrink-0 border ${
                  isConfirmingClear
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-500/25 animate-pulse'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 bg-white border-slate-200 shadow-2xs'
                }`}
                title={isConfirmingClear ? 'Click again to confirm clearing all data' : 'Clear all fields to blank template'}
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap font-medium">
                  {isConfirmingClear ? 'Confirm clear' : 'Clear'}
                </span>
              </button>

              {/* Draft • Print • Export Dropdown */}
              <div className="relative shrink-0" ref={actionsDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsActionsDropdownOpen((prev) => !prev)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 flex items-center gap-1.5 sm:gap-2 border border-slate-900 shadow-xs transition-all cursor-pointer ring-2 ring-slate-900/10 active:scale-95 shrink-0 whitespace-nowrap"
                  title="Draft, Print & Export PDF Options"
                  aria-expanded={isActionsDropdownOpen}
                  aria-haspopup="true"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">
                    {isGeneratingPdf ? 'Exporting...' : 'Draft • Print • Export'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 shrink-0 ${
                      isActionsDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Options */}
                {isActionsDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-68 sm:w-72 bg-white border border-slate-300 shadow-2xl rounded-none z-50 p-1.5 space-y-1 animate-in fade-in duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Export & Storage</span>
                      <span className="text-emerald-700 font-bold">A4 Ready</span>
                    </div>

                    {/* 1. Export PDF */}
                    <button
                      type="button"
                      disabled={isGeneratingPdf}
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        downloadPdf();
                      }}
                      className="w-full text-left p-2.5 rounded-none border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/70 transition-all duration-150 cursor-pointer flex items-center gap-3 group disabled:opacity-50"
                    >
                      <span className="w-8 h-8 rounded-none bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <Download className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                            Export PDF
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-semibold uppercase">
                            Download
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate">
                          {isGeneratingPdf ? 'Generating PDF...' : 'Download print-ready A4 PDF'}
                        </span>
                      </div>
                    </button>

                    {/* 2. Print */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        handlePrint();
                      }}
                      className="w-full text-left p-2.5 rounded-none border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/70 transition-all duration-150 cursor-pointer flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-none bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <Printer className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-950">
                            Print Document
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 font-semibold uppercase">
                            A4 Print
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate">
                          Direct print or system Save as PDF
                        </span>
                      </div>
                    </button>

                    {/* 3. Drafts */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionsDropdownOpen(false);
                        setIsDraftsModalOpen(true);
                      }}
                      className="w-full text-left p-2.5 rounded-none border border-slate-100 hover:border-sky-300 hover:bg-sky-50/70 transition-all duration-150 cursor-pointer flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-none bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition">
                        <Cloud className="w-4 h-4" />
                      </span>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-sky-950">
                            Saved Drafts
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 font-semibold uppercase">
                            Cloud / Local
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate">
                          Save, load & manage draft versions
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Google / Firebase Auth Control */}
              {user ? (
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg pl-1.5 pr-2 py-1 shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-[10px] font-bold flex items-center justify-center text-white shrink-0">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-slate-700 max-w-[65px] sm:max-w-[85px] truncate hidden sm:inline">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={signOut}
                    title="Sign out from Firebase"
                    className="text-slate-400 hover:text-rose-600 p-0.5 ml-0.5 rounded transition cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 transition cursor-pointer shrink-0 whitespace-nowrap active:scale-95 shadow-2xs"
                  title="Sign in with Google to sync resumes with Firestore"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="whitespace-nowrap font-medium">Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* ROW 2: Content | Colors | Typography | Photo style */}
          <div className="header-row-nav py-1 border-t border-slate-100">
            {[
              { id: 'text', label: 'Content', icon: <FileText className="w-3.5 h-3.5 stroke-[2.2] shrink-0" /> },
              { id: 'color', label: 'Colors', icon: <Palette className="w-3.5 h-3.5 stroke-[2.2] shrink-0" /> },
              { id: 'font', label: 'Typography', icon: <Type className="w-3.5 h-3.5 stroke-[2.2] shrink-0" /> },
              { id: 'photo', label: 'Photo style', icon: <Camera className="w-3.5 h-3.5 stroke-[2.2] shrink-0" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`header-row-item ${
                    isActive
                      ? 'bg-[#0d8f62] text-white shadow-xs font-extrabold ring-1 ring-[#0d8f62]'
                      : 'bg-slate-100/90 text-slate-700 hover:text-[#0d8f62] hover:bg-emerald-50/70 border border-slate-200/60 font-semibold'
                  }`}
                  title={`Switch to ${tab.label}`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ROW 3: All sections | Identity | Summary | Education | Experience | Skills (only visible on Content tab) */}
          {activeTab === 'text' && (
            <div className="header-row-nav py-1 border-t border-slate-100">
              {[
                { id: 'all', title: 'All sections', icon: <Layers className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'basics', title: 'Identity', icon: <User className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'objective', title: 'Summary', icon: <FileText className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'education', title: 'Education', icon: <GraduationCap className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'experience', title: 'Experience', icon: <Briefcase className="w-3.5 h-3.5 shrink-0" /> },
                { id: 'skills', title: 'Skills', icon: <Award className="w-3.5 h-3.5 shrink-0" /> },
              ].map((sub) => {
                const isSelected = textSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setTextSubTab(sub.id as any);
                      const el = document.getElementById('form-area-container');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`header-row-item ${
                      isSelected
                        ? 'bg-[#0d8f62] text-white shadow-xs font-extrabold ring-1 ring-[#0d8f62]'
                        : 'bg-slate-50 text-slate-700 hover:text-[#0d8f62] hover:bg-emerald-50/60 border border-slate-200/70 font-semibold'
                    }`}
                    title={`Filter to ${sub.title}`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.title}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* TWO-COLUMN FULL-PAGE-WIDTH LAYOUT */}
      <main className="two-column-layout w-full max-w-full m-0 p-0 no-print">
        {/* LEFT COLUMN: Form Area, Design Templates, and Controls */}
        <div id="left-column-container" className="left-column-form">
          {/* 1. FORM AREA */}
          <div id="form-area-container" className="doccraft-card w-full m-0 p-3 sm:p-4 bg-white border-b border-slate-200">
            <div id="editor-tab-content" className="space-y-4">
            
            {/* 1. PHOTO UPLOAD SECTION */}
            {activeTab === 'photo' && (
              <div className="space-y-4">
                <PhotoStudio photo={photo} onChange={(updated) => setPhoto(updated)} />
              </div>
            )}

            {/* TAB: BASICS / IDENTITY */}
            {activeTab === 'text' && (textSubTab === 'all' || textSubTab === 'basics') && (
              <div className="section-card bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Personal Particulars & Contact Information
                      </h3>
                      <p className="text-xs text-slate-500">
                        Candidate details, contact channels, bio particulars, and address
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newField = {
                        id: `p-${Date.now()}`,
                        label: 'Custom Field',
                        value: '',
                        isCustom: true,
                      };
                      updateField('personalDetails', [...(docData.personalDetails || []), newField]);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {/* Left-to-Right Auto-Fit Grid: 4 to 5 short fields per row, full row for address & declaration */}
                <div className="form-auto-grid">
                  {/* 1. Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Candidate Full Name
                    </label>
                    <AutoResizeTextarea
                      value={docData.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Enter full legal name"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-semibold placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 2. Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <AutoResizeTextarea
                      value={docData.contactNumber}
                      onChange={(e) => updateField('contactNumber', e.target.value)}
                      placeholder="+91 98765 43210"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 3. Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <AutoResizeTextarea
                      value={docData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="example@domain.com"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 4. Website / LinkedIn */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Website / LinkedIn
                    </label>
                    <AutoResizeTextarea
                      value={docData.websiteOrLinkedin || ''}
                      onChange={(e) => updateField('websiteOrLinkedin', e.target.value)}
                      placeholder="linkedin.com/in/username"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 5. Father's Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Father's Name
                    </label>
                    <AutoResizeTextarea
                      value={getPersonalValue("Father's Name") || getPersonalValue("Father")}
                      onChange={(e) => updatePersonalValue("Father's Name", e.target.value, "Father's Name")}
                      placeholder="Father's full name"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 6. Date of Birth */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Date of Birth
                    </label>
                    <AutoResizeTextarea
                      value={getPersonalValue("Date of Birth") || getPersonalValue("Birth")}
                      onChange={(e) => updatePersonalValue("Date of Birth", e.target.value, "Date of Birth")}
                      placeholder="e.g. 15/08/1998"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 7. Gender */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Gender
                    </label>
                    <AutoResizeTextarea
                      value={getPersonalValue("Gender")}
                      onChange={(e) => updatePersonalValue("Gender", e.target.value, "Gender")}
                      placeholder="e.g. Male / Female"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 8. Nationality */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nationality
                    </label>
                    <AutoResizeTextarea
                      value={getPersonalValue("Nationality")}
                      onChange={(e) => updatePersonalValue("Nationality", e.target.value, "Nationality")}
                      placeholder="e.g. Indian"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 9. Marital Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Marital Status
                    </label>
                    <AutoResizeTextarea
                      value={getPersonalValue("Marital Status") || getPersonalValue("Marital")}
                      onChange={(e) => updatePersonalValue("Marital Status", e.target.value, "Marital Status")}
                      placeholder="Single / Married"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 10. Languages */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Languages
                    </label>
                    <AutoResizeTextarea
                      value={getPersonalValue("Languages Known") || getPersonalValue("Language")}
                      onChange={(e) => updatePersonalValue("Languages Known", e.target.value, "Languages Known")}
                      placeholder="English, Bengali, Hindi"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 11. Document Title / Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Document Title / Type
                    </label>
                    <AutoResizeTextarea
                      value={docData.docType}
                      onChange={(e) => updateField('docType', e.target.value)}
                      placeholder="CURRICULUM VITAE / RESUME"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-semibold placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 12. Designation / Role Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Designation / Role Title
                    </label>
                    <AutoResizeTextarea
                      value={docData.taglineOrRole || ''}
                      onChange={(e) => updateField('taglineOrRole', e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 13. Submission Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Submission Date
                    </label>
                    <AutoResizeTextarea
                      value={docData.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      placeholder="15/08/2026"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 14. Place / Station */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Place / Station
                    </label>
                    <AutoResizeTextarea
                      value={docData.place}
                      onChange={(e) => updateField('place', e.target.value)}
                      placeholder="e.g. Kolkata, West Bengal"
                      allowNewlines={false}
                      minRows={1}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 15. Any Other Custom Fields Added by User */}
                  {docData.personalDetails
                    ?.filter((pf) => pf.isCustom || (!["father's name", "date of birth", "gender", "nationality", "marital status", "languages known"].includes(pf.label.toLowerCase())))
                    .map((pf) => {
                      const origIdx = docData.personalDetails.findIndex((x) => x.id === pf.id);
                      return (
                        <div key={pf.id} className="space-y-1 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between gap-1 pb-1">
                            <input
                              type="text"
                              value={pf.label}
                              onChange={(e) => {
                                const updated = [...docData.personalDetails];
                                if (origIdx >= 0) updated[origIdx].label = e.target.value;
                                updateField('personalDetails', updated);
                              }}
                              placeholder="Field Name"
                              className="text-xs font-semibold text-slate-800 bg-white border border-emerald-300 rounded px-1.5 py-0.5 focus:border-[#0d8f62] outline-none max-w-[130px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateField('personalDetails', docData.personalDetails.filter((x) => x.id !== pf.id));
                              }}
                              className="text-slate-400 hover:text-rose-600 transition cursor-pointer p-0.5"
                              title="Delete field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <AutoResizeTextarea
                            value={pf.value}
                            onChange={(e) => {
                              const updated = [...docData.personalDetails];
                              if (origIdx >= 0) updated[origIdx].value = e.target.value;
                              updateField('personalDetails', updated);
                            }}
                            placeholder={`Enter ${pf.label}...`}
                            allowNewlines={false}
                            minRows={1}
                            className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-[#0d8f62] rounded-none py-2 px-3 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                          />
                        </div>
                      );
                    })}

                  {/* 16. Permanent Address - SPANS FULL ROW (grid-column: 1 / -1) */}
                  <div className="grid-col-full col-span-full">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Permanent Address / Location
                    </label>
                    <AutoResizeTextarea
                      minRows={2}
                      allowNewlines={true}
                      value={docData.addressOrVillage}
                      onChange={(e) => updateField('addressOrVillage', e.target.value)}
                      placeholder="Street, City, State, PIN / Postal Code, Country"
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2.5 px-3 text-xs text-slate-900 font-medium placeholder:text-slate-400 outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* 17. Declaration Statement - SPANS FULL ROW (grid-column: 1 / -1) */}
                  <div className="grid-col-full col-span-full">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Declaration Undertaking Statement
                    </label>
                    <AutoResizeTextarea
                      minRows={2}
                      allowNewlines={true}
                      value={docData.declaration}
                      onChange={(e) => updateField('declaration', e.target.value)}
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-3 text-xs text-slate-900 font-medium outline-none transition shadow-2xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SUMMARY & OBJECTIVE */}
            {activeTab === 'text' && (textSubTab === 'all' || textSubTab === 'objective') && (
              <div className="space-y-4">
                <div className="section-card bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Career Objective / Summary
                        </h3>
                        <p className="text-xs text-slate-500">
                          Summary of your professional focus, key strengths, and career goals
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Objective Statement
                    </label>
                    <AutoResizeTextarea
                      minRows={5}
                      maxRows={16}
                      allowNewlines={true}
                      value={docData.careerObjective}
                      onChange={(e) => updateField('careerObjective', e.target.value)}
                      placeholder="Write your career objective or professional summary here..."
                      className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-3 text-xs text-slate-900 font-medium leading-relaxed outline-none transition shadow-2xs"
                    />
                  </div>

                  {/* Quick preset templates */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-600 block mb-2">
                      Quick Templates (Click to fill):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          label: 'Technical / IT',
                          text: 'Proactive and detail-oriented technical professional with hands-on expertise in operations, troubleshooting, and quality management. Eager to contribute technical acumen toward organizational growth.',
                        },
                        {
                          label: 'Fresher / Entry Level',
                          text: 'Enthusiastic and motivated graduate seeking an entry-level opportunity to apply academic learning, quick learning capabilities, and problem-solving skills in a dynamic environment.',
                        },
                        {
                          label: 'Experienced Professional',
                          text: 'Results-driven professional with proven expertise in project execution, team coordination, and client deliverables. Committed to driving efficiency and continuous improvement.',
                        },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateField('careerObjective', item.text)}
                          className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          + {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: EDUCATION */}
            {activeTab === 'text' && (textSubTab === 'all' || textSubTab === 'education') && (
              <div className="space-y-4">
                <div className="section-card bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Education & Qualifications
                      </h3>
                      <p className="text-xs text-slate-500">
                        Chronological record of degrees, institutions, and scores
                      </p>
                    </div>
                  </div>

                  {/* Stacked entries: full-width bordered cards */}
                  <div className="space-y-4 w-full">
                    {docData.education.map((edu, idx) => (
                      <div
                        key={edu.id || idx}
                        className="w-full bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <span className="text-sm font-bold text-slate-800 truncate pr-2">
                            {edu.examName || `Qualification #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateField(
                                'education',
                                docData.education.filter((_, i) => i !== idx)
                              );
                            }}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 border border-transparent hover:border-rose-200"
                            title="Delete this qualification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {/* Exam/Degree (full row) */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Exam / Degree
                          </label>
                          <input
                            type="text"
                            value={edu.examName}
                            onChange={(e) => {
                              const updated = [...docData.education];
                              updated[idx].examName = e.target.value;
                              updateField('education', updated);
                            }}
                            placeholder="e.g. B.Tech in CSE / Higher Secondary"
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                          />
                        </div>

                        {/* Board/University (full row) */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Board / University / School
                          </label>
                          <input
                            type="text"
                            value={edu.boardUniversity}
                            onChange={(e) => {
                              const updated = [...docData.education];
                              updated[idx].boardUniversity = e.target.value;
                              updateField('education', updated);
                            }}
                            placeholder="e.g. MAKAUT / CBSE / State Board"
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                          />
                        </div>

                        {/* Passing Year and Grade/Marks (2 columns, each at least 140px) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Passing Year
                            </label>
                            <input
                              type="text"
                              value={edu.passingYear}
                              onChange={(e) => {
                                const updated = [...docData.education];
                                updated[idx].passingYear = e.target.value;
                                updateField('education', updated);
                              }}
                              placeholder="e.g. 2022"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>

                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Grade / Marks (%)
                            </label>
                            <input
                              type="text"
                              value={edu.percentage}
                              onChange={(e) => {
                                const updated = [...docData.education];
                                updated[idx].percentage = e.target.value;
                                updateField('education', updated);
                              }}
                              placeholder="e.g. 86.4% / 8.8 CGPA"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add button below the last card, full width */}
                  <button
                    type="button"
                    onClick={() => {
                      const newEdu = {
                        id: `edu-${Date.now()}`,
                        examName: '',
                        boardUniversity: '',
                        passingYear: '',
                        percentage: '',
                      };
                      updateField('education', [...docData.education, newEdu]);
                    }}
                    className="w-full py-3 bg-emerald-50/60 hover:bg-emerald-100/70 text-[#0d8f62] hover:text-[#0b7a53] border border-dashed border-[#0d8f62]/50 hover:border-[#0d8f62] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Education</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: EXPERIENCE & PROJECTS */}
            {activeTab === 'text' && (textSubTab === 'all' || textSubTab === 'experience') && (
              <div className="space-y-4">
                {/* Work Experience */}
                <div className="section-card bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Work Experience
                      </h3>
                      <p className="text-xs text-slate-500">
                        Professional job history, designated roles, organizations, and duties
                      </p>
                    </div>
                  </div>

                  {/* Stacked entries: full-width bordered cards */}
                  <div className="space-y-4 w-full">
                    {docData.workExperience.map((exp, idx) => (
                      <div
                        key={exp.id || idx}
                        className="w-full bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <span className="text-sm font-bold text-slate-800 truncate pr-2">
                            {exp.jobTitle || 'Job Role'} {exp.companyName ? `@ ${exp.companyName}` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateField(
                                'workExperience',
                                docData.workExperience.filter((_, i) => i !== idx)
                              );
                            }}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 border border-transparent hover:border-rose-200"
                            title="Delete this experience"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {/* Job Title and Company (2 columns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Job Title / Designation
                            </label>
                            <input
                              type="text"
                              value={exp.jobTitle}
                              onChange={(e) => {
                                const updated = [...docData.workExperience];
                                updated[idx].jobTitle = e.target.value;
                                updateField('workExperience', updated);
                              }}
                              placeholder="e.g. Senior Software Engineer"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>

                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Company / Organization
                            </label>
                            <input
                              type="text"
                              value={exp.companyName}
                              onChange={(e) => {
                                const updated = [...docData.workExperience];
                                updated[idx].companyName = e.target.value;
                                updateField('workExperience', updated);
                              }}
                              placeholder="e.g. Acme Tech Solutions"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Duration and Location (2 columns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Duration / Period
                            </label>
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => {
                                const updated = [...docData.workExperience];
                                updated[idx].duration = e.target.value;
                                updateField('workExperience', updated);
                              }}
                              placeholder="e.g. 2022 - Present"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>

                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Location
                            </label>
                            <input
                              type="text"
                              value={exp.location || ''}
                              onChange={(e) => {
                                const updated = [...docData.workExperience];
                                updated[idx].location = e.target.value;
                                updateField('workExperience', updated);
                              }}
                              placeholder="e.g. Kolkata, India"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>
                        </div>

                        {/* Responsibilities (full row textarea) */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Responsibilities & Highlights
                          </label>
                          <AutoResizeTextarea
                            minRows={3}
                            maxRows={14}
                            allowNewlines={true}
                            value={Array.isArray(exp.highlights) ? exp.highlights.join('\n') : (exp.highlights || '')}
                            onChange={(e) => {
                              const updated = [...docData.workExperience];
                              const val = e.target.value;
                              updated[idx].highlights = val.split('\n');
                              updateField('workExperience', updated);
                            }}
                            placeholder="Enter key job responsibilities, tasks, and achievements (one per line)..."
                            className="w-full p-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add button below the last card, full width */}
                  <button
                    type="button"
                    onClick={() => {
                      const newExp = {
                        id: `w-${Date.now()}`,
                        jobTitle: '',
                        companyName: '',
                        duration: '',
                        location: '',
                        highlights: [''],
                      };
                      updateField('workExperience', [...docData.workExperience, newExp]);
                    }}
                    className="w-full py-3 bg-emerald-50/60 hover:bg-emerald-100/70 text-[#0d8f62] hover:text-[#0b7a53] border border-dashed border-[#0d8f62]/50 hover:border-[#0d8f62] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Experience</span>
                  </button>
                </div>

                {/* Projects */}
                <div className="section-card bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Projects & Portfolio
                        </h3>
                        <p className="text-xs text-slate-500">
                          Key projects, technology stack, and summaries
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newPr = {
                          id: `pr-${Date.now()}`,
                          title: 'Project Name',
                          technologies: 'React, Node.js',
                          description: 'Project summary description.',
                        };
                        updateField('projects', [...docData.projects, newPr]);
                      }}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Project</span>
                    </button>
                  </div>

                  <div className="form-auto-grid">
                    {docData.projects.map((pr, idx) => (
                      <div
                        key={pr.id || idx}
                        className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                          <span className="text-xs font-bold text-slate-800">
                            {pr.title || `Project #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateField(
                                'projects',
                                docData.projects.filter((_, i) => i !== idx)
                              );
                            }}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
                            <AutoResizeTextarea
                              value={pr.title}
                              onChange={(e) => {
                                const updated = [...docData.projects];
                                updated[idx].title = e.target.value;
                                updateField('projects', updated);
                              }}
                              placeholder="Project Title"
                              allowNewlines={false}
                              minRows={1}
                              className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-1.5 px-3 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies / Tools</label>
                            <AutoResizeTextarea
                              value={pr.technologies || ''}
                              onChange={(e) => {
                                const updated = [...docData.projects];
                                updated[idx].technologies = e.target.value;
                                updateField('projects', updated);
                              }}
                              placeholder="e.g. React, TypeScript, Tailwind"
                              allowNewlines={false}
                              minRows={1}
                              className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-1.5 px-3 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                            <AutoResizeTextarea
                              minRows={2}
                              allowNewlines={true}
                              value={pr.description}
                              onChange={(e) => {
                                const updated = [...docData.projects];
                                updated[idx].description = e.target.value;
                                updateField('projects', updated);
                              }}
                              placeholder="Project summary description..."
                              className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 outline-none transition shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KEY SKILLS & CERTIFICATIONS */}
            {activeTab === 'text' && (textSubTab === 'all' || textSubTab === 'skills') && (
              <div className="space-y-4">
                {/* Key Skills */}
                <div className="section-card bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Technical Skills & Competencies
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Categorized skillsets, specialized software proficiencies, and tools
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => {
                            setSkillsViewMode('rows');
                            updateField('skillsViewMode', 'rows');
                          }}
                          className={`px-3 py-1 rounded-md transition cursor-pointer text-xs font-medium ${
                            skillsViewMode === 'rows'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Row Fields
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSkillsViewMode('text');
                            updateField('skillsViewMode', 'text');
                          }}
                          className={`px-3 py-1 rounded-md transition cursor-pointer text-xs font-medium ${
                            skillsViewMode === 'text'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Bulk Text
                        </button>
                      </div>

                      {skillsViewMode === 'rows' && (
                        <button
                          type="button"
                          onClick={() => {
                            const current = docData.keySkills.filter(Boolean);
                            updateField('keySkills', [...current, 'New Skill: ']);
                          }}
                          className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Skill
                        </button>
                      )}
                    </div>
                  </div>

                  {skillsViewMode === 'text' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 block">
                        Bulk Text Input (one item per line or comma separated):
                      </label>
                      <AutoResizeTextarea
                        minRows={4}
                        maxRows={16}
                        allowNewlines={true}
                        value={keySkillsInput !== null ? keySkillsInput : docData.keySkills.join('\n')}
                        onChange={(e) => {
                          const raw = e.target.value;
                          setKeySkillsInput(raw);
                          const items = raw.includes('\n')
                            ? raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
                            : raw.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
                          updateField('keySkills', items);
                        }}
                        onBlur={() => setKeySkillsInput(null)}
                        placeholder="Enter skills (e.g. JavaScript: ES6, React, Node.js)..."
                        className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-3 text-xs text-slate-900 font-normal outline-none transition shadow-2xs leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {docData.keySkills.map((skillStr, idx) => {
                        const colonIdx = skillStr.indexOf(':');
                        const label = colonIdx !== -1 ? skillStr.slice(0, colonIdx) : skillStr;
                        const value = colonIdx !== -1 ? skillStr.slice(colonIdx + 1).trim() : '';

                        const handleSkillChange = (newLabel: string, newValue: string) => {
                          const updated = [...docData.keySkills];
                          const l = newLabel.trim();
                          const v = newValue.trim();
                          if (l && v) {
                            updated[idx] = `${l}: ${v}`;
                          } else if (l) {
                            updated[idx] = newLabel.includes(':') ? newLabel : `${l}:`;
                          } else if (v) {
                            updated[idx] = v;
                          } else {
                            updated[idx] = '';
                          }
                          updateField('keySkills', updated);
                        };

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 bg-slate-50/70 border border-slate-200"
                          >
                            <div className="sm:col-span-4 min-w-0">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Category / Domain
                              </label>
                              <AutoResizeTextarea
                                value={label}
                                onChange={(e) => handleSkillChange(e.target.value, value)}
                                allowNewlines={false}
                                minRows={1}
                                className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                                placeholder="e.g. Frontend"
                              />
                            </div>

                            <div className="sm:col-span-7 min-w-0">
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Technologies / Skills List
                              </label>
                              <AutoResizeTextarea
                                value={value}
                                onChange={(e) => handleSkillChange(label, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    const updated = [...docData.keySkills];
                                    updated.splice(idx + 1, 0, 'New Skill: ');
                                    updateField('keySkills', updated);
                                  }
                                }}
                                placeholder="e.g. React, TypeScript, Tailwind"
                                allowNewlines={false}
                                minRows={1}
                                className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none py-2 px-3 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                              />
                            </div>

                            <div className="sm:col-span-1 flex justify-center pb-2">
                              <button
                                type="button"
                                onClick={() => {
                                  updateField(
                                    'keySkills',
                                    docData.keySkills.filter((_, i) => i !== idx)
                                  );
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 bg-white transition cursor-pointer"
                                title="Remove skill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggested Skills Chips */}
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs font-medium text-slate-500 block mb-2">
                      Suggested Competencies:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: 'MS Office / Excel', desc: 'Word, Excel, PowerPoint, Outlook' },
                        { label: 'Communication Skills', desc: 'Verbal & Written, Active Listening' },
                        { label: 'Problem Solving', desc: 'Analytical Thinking & Root Cause Analysis' },
                        { label: 'Team Leadership', desc: 'Collaboration & Project Coordination' },
                        { label: 'AutoCAD', desc: '2D Drafting & Architectural Layouts' },
                        { label: 'Troubleshooting', desc: 'Hardware, Software & Network Diagnostics' },
                        { label: 'Customer Relations', desc: 'Client Support & Issue Resolution' },
                        { label: 'Time Management', desc: 'Task Prioritization & Deadline Delivery' },
                        { label: 'Quality Control', desc: 'Standard Operating Procedures & Inspection' },
                      ].map((item, sIdx) => {
                        const toAdd = skillsViewMode === 'text' ? item.label : `${item.label}: ${item.desc}`;
                        const isAlreadyAdded = docData.keySkills.some(
                          (s) => s.toLowerCase().startsWith(item.label.toLowerCase())
                        );
                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              if (!isAlreadyAdded) {
                                const cleanSkills = docData.keySkills.filter(Boolean);
                                updateField('keySkills', [...cleanSkills, toAdd]);
                              }
                            }}
                            disabled={isAlreadyAdded}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                              isAlreadyAdded
                                ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-default'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            {isAlreadyAdded ? '✓' : '+'} {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="section-card bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Certifications & Credentials
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Accredited certifications, issuing organizations, and years
                      </p>
                    </div>
                  </div>

                  {/* Stacked entries: full-width bordered cards */}
                  <div className="space-y-4 w-full">
                    {docData.certifications.map((cert, idx) => (
                      <div
                        key={cert.id || idx}
                        className="w-full bg-white border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <span className="text-sm font-bold text-slate-800 truncate pr-2">
                            {cert.title || `Certification #${idx + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              updateField(
                                'certifications',
                                docData.certifications.filter((_, i) => i !== idx)
                              );
                            }}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0 border border-transparent hover:border-rose-200"
                            title="Delete this certification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {/* Name (full row) */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Certificate / License Name
                          </label>
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => {
                              const updated = [...docData.certifications];
                              updated[idx].title = e.target.value;
                              updateField('certifications', updated);
                            }}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                          />
                        </div>

                        {/* Organization and Year (2 columns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Issuing Organization
                            </label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => {
                                const updated = [...docData.certifications];
                                updated[idx].issuer = e.target.value;
                                updateField('certifications', updated);
                              }}
                              placeholder="e.g. Google / Microsoft / AWS"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>

                          <div className="min-w-[140px]">
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                              Year
                            </label>
                            <input
                              type="text"
                              value={cert.year || ''}
                              onChange={(e) => {
                                const updated = [...docData.certifications];
                                updated[idx].year = e.target.value;
                                updateField('certifications', updated);
                              }}
                              placeholder="e.g. 2025"
                              className="w-full h-11 px-3 text-sm text-slate-900 bg-white border border-slate-300 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 outline-none transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add button below the last card, full width */}
                  <button
                    type="button"
                    onClick={() => {
                      const newCert = {
                        id: `c-${Date.now()}`,
                        title: '',
                        issuer: '',
                        year: '',
                      };
                      updateField('certifications', [...docData.certifications, newCert]);
                    }}
                    className="w-full py-3 bg-emerald-50/60 hover:bg-emerald-100/70 text-[#0d8f62] hover:text-[#0b7a53] border border-dashed border-[#0d8f62]/50 hover:border-[#0d8f62] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certification</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SECTIONS MANAGER */}
            {activeTab === 'text' && (textSubTab === 'all' || textSubTab === 'sections') && (
              <div className="interactive-section-box">
                <SectionManager
                  sectionsOrder={docData.sectionsOrder}
                  customSections={docData.customSections}
                  onUpdateSectionsOrder={(updated) => updateField('sectionsOrder', updated)}
                  onUpdateCustomSections={(updated) => updateField('customSections', updated)}
                />
              </div>
            )}

            {/* 3. THEME & COLORS SECTION */}
            {activeTab === 'color' && (
              <div className="space-y-6">
                {/* Master Color Theme Palette */}
                <div className="section-card bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Primary Color Theme
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Document accent tone applied to headers, rules, badges, and highlights
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                      {COLOR_THEMES.length} Curated Themes
                    </span>
                  </div>

                  {/* Theme cards in 2 columns with the full name on one line */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COLOR_THEMES.map((t) => {
                      const isSelected = theme.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setTheme(t)}
                          className={`flex items-center gap-3 p-3 text-left border text-xs transition cursor-pointer min-w-0 ${
                            isSelected
                              ? 'bg-[#0d8f62] text-white border-[#0d8f62] ring-2 ring-[#0d8f62]/25 shadow-xs font-semibold'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-[#0d8f62]/40 hover:bg-emerald-50/20'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${t.bgDarkBadge} shrink-0 ring-2 ring-white shadow-2xs`} />
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                              {t.name}
                            </span>
                            <span className={`block font-mono text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {t.primary}
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Element Colors - ONE BOX PER ROW */}
                <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Custom Element Colors
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customize individual header or text element colors independently
                      </p>
                    </div>
                    {(typography.headerColor || typography.titleColor || typography.subtitleColor) && (
                      <button
                        type="button"
                        onClick={() => setTypography((prev) => ({ ...prev, headerColor: '', titleColor: '', subtitleColor: '' }))}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 border border-rose-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset Overrides
                      </button>
                    )}
                  </div>

                  {/* One box per row */}
                  <div className="space-y-3">
                    <ColorPickerField
                      label="Header Title Color"
                      sublabel="Main banner heading (e.g. CURRICULUM VITAE)"
                      value={typography.headerColor}
                      themeColor={theme.primary}
                      onChange={(col) => setTypography((prev) => ({ ...prev, headerColor: col }))}
                    />
                    <ColorPickerField
                      label="Candidate Name Color"
                      sublabel="Top applicant full name headline display"
                      value={typography.titleColor}
                      themeColor={theme.primary}
                      onChange={(col) => setTypography((prev) => ({ ...prev, titleColor: col }))}
                    />
                    <ColorPickerField
                      label="Designation & Subtitle Color"
                      sublabel="Professional title or designation subtitle line"
                      value={typography.subtitleColor}
                      themeColor={theme.primary}
                      onChange={(col) => setTypography((prev) => ({ ...prev, subtitleColor: col }))}
                    />
                  </div>
                </div>

                {/* Active Color Scheme Summary - ONE ROW */}
                <div className="section-card bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-semibold text-slate-900">
                        Active Color Summary
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTheme(COLOR_THEMES[0]);
                        setTypography((prev) => ({ ...prev, headerColor: '', titleColor: '', subtitleColor: '' }));
                      }}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Classic Navy
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 ring-1 ring-white"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400">Primary Theme</span>
                        <span className="block text-xs font-medium text-slate-800 truncate">{theme.name}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 ring-1 ring-white"
                        style={{ backgroundColor: typography.headerColor || theme.primary }}
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400">Header Title</span>
                        <span className="block font-mono text-[11px] font-medium text-slate-800 truncate">
                          {typography.headerColor ? typography.headerColor.toUpperCase() : 'Theme Accent'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 ring-1 ring-white"
                        style={{ backgroundColor: typography.titleColor || theme.primary }}
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400">Candidate Name</span>
                        <span className="block font-mono text-[11px] font-medium text-slate-800 truncate">
                          {typography.titleColor ? typography.titleColor.toUpperCase() : 'Theme Accent'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0 ring-1 ring-white"
                        style={{ backgroundColor: typography.subtitleColor || '#475569' }}
                      />
                      <div className="min-w-0">
                        <span className="block text-[10px] text-slate-400">Subtitle / Role</span>
                        <span className="block font-mono text-[11px] font-medium text-slate-800 truncate">
                          {typography.subtitleColor ? typography.subtitleColor.toUpperCase() : 'Theme Accent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. TYPOGRAPHY & SPATIAL SECTION */}
            {activeTab === 'font' && (
              <div className="space-y-4">
                {/* Typeface Selection - 2 COLUMNS */}
                <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Document Font Family
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Choose the primary font style for headers and body content
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 border border-slate-200">
                      {FONT_OPTIONS.length} Fonts
                    </span>
                  </div>

                  {/* Font cards in 2 columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONT_OPTIONS.map((f) => {
                      const isSelected = font.id === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setFont(f);
                            setTypography((prev) => ({ ...prev, fontFamily: f.CSS, fontId: f.id }));
                          }}
                          className={`p-3.5 border text-left text-xs transition cursor-pointer min-w-0 ${
                            isSelected
                              ? 'bg-[#0d8f62] text-white border-[#0d8f62] ring-2 ring-[#0d8f62]/25 shadow-xs font-semibold'
                              : 'bg-white border-slate-200 text-slate-800 hover:border-[#0d8f62]/40 hover:bg-emerald-50/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold truncate" style={{ fontFamily: f.CSS }}>
                              {f.name}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1.5" />}
                          </div>
                          <span className={`block text-xs mt-1 truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {f.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font Sizing & Spatial Controls */}
                <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Font Sizes & Spacing Controls
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Adjust point-size, spacing, and alignment position for each document element
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetAllFontSizes}
                      className="text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 border border-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                      title="Reset all font sizes to standard defaults"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Sizes
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* MASTER GLOBAL TEXT SIZING */}
                    <div className="bg-slate-50/90 border border-slate-200 p-3.5 sm:p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 bg-[#0d8f62] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                            Aa
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              Global Text Size Scaling
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Scale body text, headings, and details proportionately across all sections
                            </p>
                          </div>
                        </div>

                        {/* Quick Step Buttons */}
                        <div className="flex items-center gap-1.5 bg-white border border-slate-300 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => scaleAllTextSizes(-1)}
                            className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                            title="Decrease all text sizes (-1px)"
                          >
                            <span>A-</span>
                            <span className="text-[10px] font-normal text-slate-500">Smaller</span>
                          </button>
                          <span className="text-xs font-mono font-bold text-[#0d8f62] px-2 py-0.5 bg-emerald-50 border border-emerald-200">
                            {typography.bodyTextSize}px
                          </span>
                          <button
                            type="button"
                            onClick={() => scaleAllTextSizes(1)}
                            className="px-2.5 py-1 text-xs font-bold text-[#0d8f62] hover:bg-emerald-50 transition cursor-pointer flex items-center gap-1"
                            title="Increase all text sizes (+1px)"
                          >
                            <span>A+</span>
                            <span className="text-[10px] font-semibold text-[#0d8f62]">Larger</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 Instant Presets */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                        {[
                          { id: 'compact', label: 'Compact', desc: '10px Body' },
                          { id: 'normal', label: 'Standard', desc: '12px Body' },
                          { id: 'large', label: 'Large', desc: '13.5px Body' },
                          { id: 'extralarge', label: 'Extra Large', desc: '15px Body' },
                        ].map((preset) => {
                          const isActive =
                            (preset.id === 'compact' && typography.bodyTextSize <= 10.5) ||
                            (preset.id === 'normal' && typography.bodyTextSize > 10.5 && typography.bodyTextSize <= 12.5) ||
                            (preset.id === 'large' && typography.bodyTextSize > 12.5 && typography.bodyTextSize <= 14) ||
                            (preset.id === 'extralarge' && typography.bodyTextSize > 14);
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => applyGlobalTextSizePreset(preset.id as any)}
                              className={`py-1.5 px-2 text-xs font-semibold border transition text-center cursor-pointer ${
                                isActive
                                  ? 'bg-[#0d8f62] text-white border-[#0d8f62] shadow-2xs font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'
                              }`}
                            >
                              <div className="leading-tight text-[11px]">{preset.label}</div>
                              <div className={`text-[10px] mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {preset.desc}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 1. Header Title (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Header Title</span>
                        <span className="text-xs text-slate-500 ml-1.5">— CURRICULUM VITAE / RESUME banner</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="14"
                          max="34"
                          step="1"
                          value={typography.headerTitleSize}
                          onChange={(e) => updateHeaderTitleSize(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepHeaderTitleSize(-1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-1px)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.headerTitleSize}px
                          </span>
                          <button
                            type="button"
                            onClick={() => stepHeaderTitleSize(1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+1px)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[18, 20, 22, 24, 26, 30].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateHeaderTitleSize(size)}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.headerTitleSize === size
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>

                      {/* Alignment and X/Y offset controls in a second block below, one row each */}
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        {/* Row 1: Alignment */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <AlignLeft className="w-3.5 h-3.5 text-[#0d8f62]" />
                            <span>Alignment</span>
                          </span>
                          <div className="flex items-center bg-white border border-slate-300 p-0.5 gap-1">
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerAlign: 'left' }))}
                              className={`px-3 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                                (!typography.headerAlign || typography.headerAlign === 'left')
                                  ? 'bg-[#0d8f62] text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <AlignLeft className="w-3 h-3" /> Left
                            </button>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerAlign: 'center' }))}
                              className={`px-3 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                                typography.headerAlign === 'center'
                                  ? 'bg-[#0d8f62] text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <AlignCenter className="w-3 h-3" /> Center
                            </button>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerAlign: 'right' }))}
                              className={`px-3 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                                typography.headerAlign === 'right'
                                  ? 'bg-[#0d8f62] text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <AlignRight className="w-3 h-3" /> Right
                            </button>
                          </div>
                        </div>

                        {/* Row 2: X Offset */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-slate-700 shrink-0 w-28 sm:w-32 flex items-center gap-1.5">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-[#0d8f62]" />
                            <span>X Offset</span>
                          </span>
                          <input
                            type="range"
                            min="-80"
                            max="80"
                            step="1"
                            value={typography.headerOffsetX || 0}
                            onChange={(e) => setTypography((prev) => ({ ...prev, headerOffsetX: parseInt(e.target.value) || 0 }))}
                            className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerOffsetX: Math.max(-80, (prev.headerOffsetX || 0) - 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              ←
                            </button>
                            <span className="font-mono text-slate-900 px-2 py-1 bg-white border border-slate-300 min-w-[54px] text-center text-xs font-semibold">
                              {(typography.headerOffsetX || 0) > 0 ? `+${typography.headerOffsetX}` : `${typography.headerOffsetX || 0}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerOffsetX: Math.min(80, (prev.headerOffsetX || 0) + 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              →
                            </button>
                          </div>
                        </div>

                        {/* Row 3: Y Offset */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-slate-700 shrink-0 w-28 sm:w-32 flex items-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#0d8f62]" />
                            <span>Y Offset</span>
                          </span>
                          <input
                            type="range"
                            min="-50"
                            max="50"
                            step="1"
                            value={typography.headerOffsetY || 0}
                            onChange={(e) => setTypography((prev) => ({ ...prev, headerOffsetY: parseInt(e.target.value) || 0 }))}
                            className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerOffsetY: Math.max(-50, (prev.headerOffsetY || 0) - 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              ↑
                            </button>
                            <span className="font-mono text-slate-900 px-2 py-1 bg-white border border-slate-300 min-w-[54px] text-center text-xs font-semibold">
                              {(typography.headerOffsetY || 0) > 0 ? `+${typography.headerOffsetY}` : `${typography.headerOffsetY || 0}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, headerOffsetY: Math.min(50, (prev.headerOffsetY || 0) + 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Candidate Name (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Candidate Name</span>
                        <span className="text-xs text-slate-500 ml-1.5">— Applicant full name headline display</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="10"
                          max="26"
                          step="0.5"
                          value={typography.headerSubtitleSize}
                          onChange={(e) => updateHeaderSubtitleSize(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepHeaderSubtitleSize(-0.5)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-0.5px)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.headerSubtitleSize}px
                          </span>
                          <button
                            type="button"
                            onClick={() => stepHeaderSubtitleSize(0.5)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+0.5px)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[13, 14.5, 16, 18, 20, 22].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateHeaderSubtitleSize(size)}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.headerSubtitleSize === size
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>

                      {/* Alignment and X/Y offset controls in a second block below, one row each */}
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        {/* Row 1: Alignment */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                            <AlignLeft className="w-3.5 h-3.5 text-[#0d8f62]" />
                            <span>Alignment</span>
                          </span>
                          <div className="flex items-center bg-white border border-slate-300 p-0.5 gap-1">
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleAlign: 'left' }))}
                              className={`px-3 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                                (!typography.titleAlign || typography.titleAlign === 'left')
                                  ? 'bg-[#0d8f62] text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <AlignLeft className="w-3 h-3" /> Left
                            </button>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleAlign: 'center' }))}
                              className={`px-3 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                                typography.titleAlign === 'center'
                                  ? 'bg-[#0d8f62] text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <AlignCenter className="w-3 h-3" /> Center
                            </button>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleAlign: 'right' }))}
                              className={`px-3 py-1 text-xs flex items-center gap-1 cursor-pointer transition ${
                                typography.titleAlign === 'right'
                                  ? 'bg-[#0d8f62] text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <AlignRight className="w-3 h-3" /> Right
                            </button>
                          </div>
                        </div>

                        {/* Row 2: X Offset */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-slate-700 shrink-0 w-28 sm:w-32 flex items-center gap-1.5">
                            <ArrowLeftRight className="w-3.5 h-3.5 text-[#0d8f62]" />
                            <span>X Offset</span>
                          </span>
                          <input
                            type="range"
                            min="-80"
                            max="80"
                            step="1"
                            value={typography.titleOffsetX || 0}
                            onChange={(e) => setTypography((prev) => ({ ...prev, titleOffsetX: parseInt(e.target.value) || 0 }))}
                            className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleOffsetX: Math.max(-80, (prev.titleOffsetX || 0) - 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              ←
                            </button>
                            <span className="font-mono text-slate-900 px-2 py-1 bg-white border border-slate-300 min-w-[54px] text-center text-xs font-semibold">
                              {(typography.titleOffsetX || 0) > 0 ? `+${typography.titleOffsetX}` : `${typography.titleOffsetX || 0}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleOffsetX: Math.min(80, (prev.titleOffsetX || 0) + 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              →
                            </button>
                          </div>
                        </div>

                        {/* Row 3: Y Offset */}
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-slate-700 shrink-0 w-28 sm:w-32 flex items-center gap-1.5">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#0d8f62]" />
                            <span>Y Offset</span>
                          </span>
                          <input
                            type="range"
                            min="-50"
                            max="50"
                            step="1"
                            value={typography.titleOffsetY || 0}
                            onChange={(e) => setTypography((prev) => ({ ...prev, titleOffsetY: parseInt(e.target.value) || 0 }))}
                            className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleOffsetY: Math.max(-50, (prev.titleOffsetY || 0) - 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              ↑
                            </button>
                            <span className="font-mono text-slate-900 px-2 py-1 bg-white border border-slate-300 min-w-[54px] text-center text-xs font-semibold">
                              {(typography.titleOffsetY || 0) > 0 ? `+${typography.titleOffsetY}` : `${typography.titleOffsetY || 0}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTypography((prev) => ({ ...prev, titleOffsetY: Math.min(50, (prev.titleOffsetY || 0) + 2) }))}
                              className="w-7 h-7 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Section Headings (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Section Headings</span>
                        <span className="text-xs text-slate-500 ml-1.5">— Education, Experience, Skills, and Projects titles</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="9"
                          max="22"
                          step="0.5"
                          value={typography.sectionHeaderSize}
                          onChange={(e) => updateSectionHeaderSize(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepSectionHeaderSize(-0.5)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-0.5px)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.sectionHeaderSize}px
                          </span>
                          <button
                            type="button"
                            onClick={() => stepSectionHeaderSize(0.5)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+0.5px)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[11, 12, 12.5, 13.5, 15, 16.5].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateSectionHeaderSize(size)}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.sectionHeaderSize === size
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 4. Body Content (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Body Content</span>
                        <span className="text-xs text-slate-500 ml-1.5">— Bullet points, descriptions, and contact info</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="8"
                          max="18"
                          step="0.5"
                          value={typography.bodyTextSize}
                          onChange={(e) => updateBodyTextSize(parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepBodyTextSize(-0.5)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-0.5px)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.bodyTextSize}px
                          </span>
                          <button
                            type="button"
                            onClick={() => stepBodyTextSize(0.5)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+0.5px)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[9.5, 10, 11, 11.5, 12, 13, 14].map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateBodyTextSize(size)}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.bodyTextSize === size
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. Margins (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Margins</span>
                        <span className="text-xs text-slate-500 ml-1.5">— Equal 4-side page margins (top, bottom, left, right)</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="8"
                          max="32"
                          step="1"
                          value={typography.pagePadding}
                          onChange={(e) =>
                            setTypography((prev) => ({ ...prev, pagePadding: parseInt(e.target.value) || 16 }))
                          }
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepPagePadding(-1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-1px)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.pagePadding}px
                          </span>
                          <button
                            type="button"
                            onClick={() => stepPagePadding(1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+1px)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[10, 14, 16, 20, 24].map((pad) => (
                          <button
                            key={pad}
                            type="button"
                            onClick={() => setTypography((prev) => ({ ...prev, pagePadding: pad }))}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.pagePadding === pad
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {pad}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 6. Spacing (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Spacing</span>
                        <span className="text-xs text-slate-500 ml-1.5">— Section spacing gap between content blocks</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="2"
                          max="24"
                          step="1"
                          value={typography.elementSpacing}
                          onChange={(e) =>
                            setTypography((prev) => ({ ...prev, elementSpacing: parseInt(e.target.value) || 8 }))
                          }
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepElementSpacing(-1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-1px)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.elementSpacing}px
                          </span>
                          <button
                            type="button"
                            onClick={() => stepElementSpacing(1)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+1px)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[4, 6, 8, 12, 16].map((gap) => (
                          <button
                            key={gap}
                            type="button"
                            onClick={() => setTypography((prev) => ({ ...prev, elementSpacing: gap }))}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.elementSpacing === gap
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {gap}px
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 7. Line Height (Full-width block, one per row) */}
                    <div className="w-full bg-slate-50/70 p-4 border border-slate-200 space-y-3">
                      {/* line 1: label and short description */}
                      <div>
                        <span className="font-semibold text-slate-900 text-xs">Line Height</span>
                        <span className="text-xs text-slate-500 ml-1.5">— Proportional vertical line spacing for readability</span>
                      </div>

                      {/* line 2: slider on the left, then  -  [ 22px ]  +  on the right */}
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1.15"
                          max="1.75"
                          step="0.05"
                          value={typography.lineHeight}
                          onChange={(e) =>
                            setTypography((prev) => ({ ...prev, lineHeight: parseFloat(e.target.value) || 1.45 }))
                          }
                          className="flex-1 h-2 bg-slate-200 appearance-none accent-[#0d8f62] cursor-pointer min-w-0"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => stepLineHeight(-0.05)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Decrease (-0.05)"
                          >
                            -
                          </button>
                          <span className="font-mono text-slate-900 px-2.5 py-1 bg-white border border-slate-300 min-w-[62px] text-center text-xs font-semibold">
                            {typography.lineHeight}
                          </span>
                          <button
                            type="button"
                            onClick={() => stepLineHeight(0.05)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-bold cursor-pointer transition active:scale-95"
                            title="Increase (+0.05)"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* line 3: preset chips, wrapping if needed */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {[1.2, 1.35, 1.45, 1.6].map((lh) => (
                          <button
                            key={lh}
                            type="button"
                            onClick={() => setTypography((prev) => ({ ...prev, lineHeight: lh }))}
                            className={`px-2.5 py-1 text-xs border font-medium cursor-pointer transition ${
                              typography.lineHeight === lh
                                ? 'bg-[#0d8f62] text-white border-[#0d8f62] font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50/50'
                            }`}
                          >
                            {lh}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

        {/* RIGHT COLUMN (live preview - sticky under header, 520px wide, centered scaled A4) */}
        <div
          id="right-column-preview"
          className="right-column-preview bg-slate-100/70 border-l border-slate-200"
          style={
            windowWidth >= 1000
              ? {
                  position: 'sticky',
                  top: `${headerHeight}px`,
                }
              : {
                  position: 'static',
                  top: 'auto',
                }
          }
        >
          {/* DESIGN TEMPLATES (Numbered compact bar) */}
          <div id="templates-card-container" className="w-full px-2 py-1.5 bg-white border-b border-slate-200 space-y-1.5 shrink-0 select-none">
            {/* Row 1: Templates (1 to 12) + Demo Data + Scale */}
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-700 shrink-0">Template:</span>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[
                    { id: 1, name: 'Classic Border', category: 'Classic' },
                    { id: 2, name: 'Emerald Wave', category: 'Modern' },
                    { id: 3, name: 'Stripe Minimal', category: 'Corporate' },
                    { id: 4, name: 'Apex Executive', category: 'Modern' },
                    { id: 5, name: 'Crest Header', category: 'Formal' },
                    { id: 6, name: 'Frame Accent', category: 'Corporate' },
                    { id: 7, name: 'Navy Technical', category: 'CV' },
                    { id: 8, name: 'Swiss Monospace', category: 'Tech' },
                    { id: 9, name: 'Executive Serif', category: 'Academic' },
                    { id: 10, name: 'Teal Ribbon', category: 'Creative' },
                    { id: 11, name: 'Nordic Clean', category: 'Minimal' },
                    { id: 12, name: 'Timeline CV', category: 'Executive' },
                  ].map((t) => {
                    const isSelected = templateId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTemplate(t.id)}
                        title={`Template ${t.id}: ${t.name} (${t.category})`}
                        className={`w-6 h-6 text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#0d8f62] text-white shadow-xs font-extrabold ring-1 ring-[#0d8f62]'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {t.id}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-500 font-medium ml-1 truncate hidden md:inline">
                  {[
                    { id: 1, name: 'Classic Border' },
                    { id: 2, name: 'Emerald Wave' },
                    { id: 3, name: 'Stripe Minimal' },
                    { id: 4, name: 'Apex Executive' },
                    { id: 5, name: 'Crest Header' },
                    { id: 6, name: 'Frame Accent' },
                    { id: 7, name: 'Navy Technical' },
                    { id: 8, name: 'Swiss Monospace' },
                    { id: 9, name: 'Executive Serif' },
                    { id: 10, name: 'Teal Ribbon' },
                    { id: 11, name: 'Nordic Clean' },
                    { id: 12, name: 'Timeline CV' },
                  ].find((t) => t.id === templateId)?.name}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fillDemoDataForActiveTemplate()}
                  className="text-[10px] font-semibold text-[#0d8f62] hover:text-[#0b7a53] bg-emerald-50 hover:bg-emerald-100/70 px-1.5 py-0.5 border border-emerald-200/70 flex items-center gap-1 transition cursor-pointer"
                  title="Fill all input fields with demo data for this template"
                >
                  <Sparkles className="w-2.5 h-2.5 text-[#0d8f62]" />
                  <span>Demo</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500 px-1 py-0.5 bg-slate-50 border border-slate-200">
                  {Math.round(currentScale * 100)}%
                </span>
              </div>
            </div>

            {/* Row 2: Border styles (Numbered 1 to 6) */}
            <div className="pt-1 border-t border-slate-100 flex items-center gap-1 text-[10px] flex-wrap">
              <span className="font-bold text-slate-700 shrink-0">Border:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'double', num: 1, label: 'Double line' },
                  { id: 'thickThin', num: 2, label: 'Thick-thin' },
                  { id: 'thinThick', num: 3, label: 'Thin-thick' },
                  { id: 'single', num: 4, label: 'Single 2px' },
                  { id: 'oxford', num: 5, label: 'Oxford corner' },
                  { id: 'triple', num: 6, label: 'Triple line' },
                ].map((b) => {
                  const activeBorder = (typography.t1BorderStyle && typography.t1BorderStyle !== 'geometricPurple') ? typography.t1BorderStyle : 'double';
                  const isBSelected = templateId === 1 && activeBorder === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        if (templateId !== 1) handleSelectTemplate(1);
                        setTypography((prev) => ({ ...prev, t1BorderStyle: b.id as any }));
                      }}
                      title={`Border ${b.num}: ${b.label}`}
                      className={`w-5 h-5 text-[10px] font-bold transition cursor-pointer flex items-center justify-center ${
                        isBSelected
                          ? 'bg-[#0d8f62] text-white border border-[#0d8f62] shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      {b.num}
                    </button>
                  );
                })}
              </div>
              <span className="text-slate-500 text-[10px] ml-1">
                {templateId === 1
                  ? `(${[
                      { id: 'double', label: 'Double line' },
                      { id: 'thickThin', label: 'Thick-thin' },
                      { id: 'thinThick', label: 'Thin-thick' },
                      { id: 'single', label: 'Single 2px' },
                      { id: 'oxford', label: 'Oxford corner' },
                      { id: 'triple', label: 'Triple line' },
                    ].find((b) => b.id === ((typography.t1BorderStyle && typography.t1BorderStyle !== 'geometricPurple') ? typography.t1BorderStyle : 'double'))?.label})`
                  : '(Classic Frame only)'}
              </span>
            </div>

            {/* Row 3: Compact controls (Auto-Fit, Status, Margin, Text, Zoom, Photo Nudge, Fullscreen) */}
            <div className="pt-1 border-t border-slate-100 flex items-center gap-1.5 text-[10px] flex-wrap">
              {/* Auto-Fit Button */}
              <button
                type="button"
                onClick={() => handleAutoFit(true)}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-[10px] px-2 py-0.5 shadow-2xs flex items-center gap-1 transition cursor-pointer shrink-0"
                title="Auto-Fit content onto exactly 1 A4 page"
              >
                <Zap className="w-3 h-3 fill-current text-amber-100" />
                <span>Auto-Fit (1 Page A4)</span>
              </button>

              {/* Status Chip */}
              {pageMetrics.naturalHeight > 1123 ? (
                <span className="bg-rose-50 text-rose-800 border border-rose-300 font-semibold px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-2xs shrink-0">
                  <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>Overflows (+{pageMetrics.naturalHeight - 1123}px)</span>
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold px-1.5 py-0.5 text-[10px] flex items-center gap-1 shadow-2xs shrink-0">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Fits 1 page A4</span>
                </span>
              )}

              {/* Margin: 10px 14px 16px 20px 24px */}
              <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/80 px-1 py-0.5 shrink-0">
                <span className="text-[10px] font-semibold text-slate-700 pr-0.5">Margin:</span>
                {[10, 14, 16, 20, 24].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTypography((prev) => ({ ...prev, pagePadding: m }))}
                    className={`px-1 py-0.2 text-[10px] font-bold transition cursor-pointer ${
                      typography.pagePadding === m
                        ? 'bg-[#0d8f62] text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    {m}px
                  </button>
                ))}
              </div>

              {/* Text: A- 12px A+ Compact 11 Standard 12 Large 13 XL 14 */}
              <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/80 px-1 py-0.5 shrink-0">
                <span className="text-[10px] font-bold text-slate-700 pr-0.5">Text:</span>
                <button
                  type="button"
                  onClick={() => stepBodyTextSize(-0.5)}
                  className="px-1 py-0.2 text-[10px] font-bold text-slate-700 hover:bg-white cursor-pointer"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className="font-mono text-slate-900 font-bold text-[10px] px-1 py-0.2 bg-white border border-slate-200">
                  {typography.bodyTextSize}px
                </span>
                <button
                  type="button"
                  onClick={() => stepBodyTextSize(0.5)}
                  className="px-1 py-0.2 text-[10px] font-bold text-[#0d8f62] hover:bg-white cursor-pointer"
                  title="Increase font size"
                >
                  A+
                </button>
                {[
                  { label: 'Compact 11', size: 11 },
                  { label: 'Standard 12', size: 12 },
                  { label: 'Large 13', size: 13 },
                  { label: 'XL 14', size: 14 },
                ].map((p) => (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => updateBodyTextSize(p.size)}
                    className={`px-1 py-0.2 text-[9px] font-semibold transition cursor-pointer ${
                      typography.bodyTextSize === p.size
                        ? 'bg-[#0d8f62] text-white font-bold'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Zoom Controls: Fit, -, real scale %, + (Requirements 6 & 7) */}
              <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/80 px-1 py-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handleFitClick}
                  className={`px-1.5 py-0.5 text-[9px] font-bold border transition cursor-pointer ${
                    isAutoFit
                      ? 'bg-[#0d8f62] text-white border-[#0d8f62]'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title="Fit full A4 page (38%)"
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-0.5 hover:bg-white text-slate-700 transition cursor-pointer"
                  title="Zoom Out (-5%)"
                >
                  <ZoomOut className="w-2.5 h-2.5" />
                </button>
                <span className="font-mono font-bold text-slate-800 text-[10px] px-1 text-center min-w-[34px]">
                  {Math.round(currentScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-0.5 hover:bg-white text-slate-700 transition cursor-pointer"
                  title="Zoom In (+5%)"
                >
                  <ZoomIn className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Photo Nudge */}
              <button
                type="button"
                onClick={() => setShowPhotoPositionBar(!showPhotoPositionBar)}
                className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 border transition cursor-pointer shrink-0 ${
                  showPhotoPositionBar || (photo.topOffset || 0) !== 0 || (photo.leftOffset || 0) !== 0
                    ? 'bg-emerald-50 text-[#0d8f62] border-emerald-300 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title="Nudge Photo Position"
              >
                <Move className="w-3 h-3" />
                <span>Photo Nudge</span>
              </button>

              {/* Fullscreen (Requirement 8) */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 border transition cursor-pointer shrink-0 ${
                  isPreviewFullscreen
                    ? 'bg-emerald-50 text-[#0d8f62] border-emerald-300 font-bold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
                title={isPreviewFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
              >
                {isPreviewFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                <span>{isPreviewFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>

            {/* Photo Position Nudge Popover Arrow Pad */}
            {showPhotoPositionBar && (
              <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-xs flex flex-wrap items-center justify-between gap-1.5 shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="w-5 h-5 bg-[#0d8f62] text-white flex items-center justify-center shadow-2xs">
                    <Move className="w-3 h-3" />
                  </span>
                  <span className="font-bold text-slate-900 text-[10px]">Photo Nudge:</span>
                  <span className="text-slate-800 font-mono text-[9px] bg-white px-1.5 py-0.5 border border-emerald-300 font-semibold">
                    X: {(photo.leftOffset || 0) > 0 ? `+${photo.leftOffset}` : (photo.leftOffset || 0)}px | Y: {(photo.topOffset || 0) > 0 ? `+${photo.topOffset}` : (photo.topOffset || 0)}px
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <div className="flex items-center gap-0.5 bg-white border border-slate-200 p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPhoto((prev) => ({ ...prev, leftOffset: (prev.leftOffset || 0) - 3 }))}
                      className="p-1 hover:bg-slate-100 text-slate-700 transition cursor-pointer font-bold"
                      title="Move Photo LEFT (-3px)"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoto((prev) => ({ ...prev, topOffset: (prev.topOffset || 0) - 3 }))}
                      className="p-1 hover:bg-slate-100 text-slate-700 transition cursor-pointer font-bold"
                      title="Move Photo UP (-3px)"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoto((prev) => ({ ...prev, topOffset: (prev.topOffset || 0) + 3 }))}
                      className="p-1 hover:bg-slate-100 text-slate-700 transition cursor-pointer font-bold"
                      title="Move Photo DOWN (+3px)"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoto((prev) => ({ ...prev, leftOffset: (prev.leftOffset || 0) + 3 }))}
                      className="p-1 hover:bg-slate-100 text-slate-700 transition cursor-pointer font-bold"
                      title="Move Photo RIGHT (+3px)"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPhoto((prev) => ({ ...prev, topOffset: 0, leftOffset: 0 }))}
                    className="px-1.5 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 text-[9px] font-semibold text-slate-700 transition cursor-pointer"
                    title="Reset photo position to (0,0)"
                  >
                    <RotateCcw className="w-2.5 h-2.5 inline mr-0.5 text-slate-500" />
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPhotoPositionBar(false)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 transition cursor-pointer ml-1"
                    title="Close Position Bar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* PREVIEW CONTAINER (Requirements 1, 4, 5, 8) */}
          <div
            ref={previewContainerRef}
            id="preview-scroll-container"
            className={`preview-container ${
              isPreviewFullscreen
                ? 'is-fullscreen'
                : ''
            }`}
            style={
              isPreviewFullscreen
                ? {
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50,
                    height: '100vh',
                    width: '100vw',
                    overflow: 'auto',
                    backgroundColor: 'rgba(15, 23, 42, 0.96)',
                    padding: '16px',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                  }
                : {
                    height: 'min(76vh, 860px)',
                    overflow: 'auto',
                    backgroundColor: '#f8fafc',
                    padding: '16px 8px',
                    boxSizing: 'border-box',
                  }
            }
          >
            {/* Fullscreen Floating Controls Bar */}
            {isPreviewFullscreen && (
              <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2 mb-3 bg-slate-800/95 text-white px-3 py-2 rounded-lg border border-slate-700 shadow-xl shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Fullscreen Inspection (A4)</span>
                  <span className="text-[10px] bg-emerald-700/80 text-white px-2 py-0.5 rounded font-mono font-bold">
                    {Math.round(currentScale * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleFitClick}
                    className={`px-2 py-1 text-xs font-bold rounded transition cursor-pointer ${
                      isAutoFit
                        ? 'bg-[#0d8f62] text-white shadow-xs'
                        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    }`}
                    title="Fit page to screen"
                  >
                    Fit
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition cursor-pointer"
                    title="Zoom Out (-5%)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 bg-slate-700 hover:bg-slate-600 text-white rounded transition cursor-pointer"
                    title="Zoom In (+5%)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewFullscreen(false)}
                    className="ml-2 bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Exit Fullscreen (Esc)"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Exit (Esc)</span>
                  </button>
                </div>
              </div>
            )}

            {/* SIZER DIV (Requirement 4: width = 794 * scale, height = 1123 * scale, centered with margin: 0 auto) */}
            <div
              className="preview-sizer"
              style={{
                width: `${Math.round(794 * currentScale)}px`,
                height: `${Math.round(1123 * currentScale)}px`,
                margin: '0 auto',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* SCALED A4 PAGE (Requirement 1: 794px x 1123px, transform: scale(), transform-origin: top left) */}
              <div
                id="a4-document-viewport"
                className="bg-white border border-slate-300 text-slate-800 shadow-xl"
                style={{
                  width: '794px',
                  height: '1123px',
                  minWidth: '794px',
                  minHeight: '1123px',
                  maxWidth: '794px',
                  maxHeight: '1123px',
                  transform: `scale(${currentScale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <LivePreview
                  id="a4-document-stage"
                  data={docData}
                  templateId={templateId}
                  theme={theme}
                  photo={photo}
                  typography={typography}
                  onFitScaleChange={setFitScale}
                  onMetricsChange={handleMetricsChange}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 100% SCALE DEDICATED EXPORT STAGE (Always unscaled, 0 transform, pixel-perfect 794x1123) */}
      <div
        id="pure-export-wrapper"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0px',
          width: '794px',
          height: '1123px',
          zIndex: -9999,
          opacity: 1,
          pointerEvents: 'none',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
        className="no-print"
      >
        <div
          id="pure-export-stage"
          style={{
            width: '794px',
            height: '1123px',
            maxWidth: '794px',
            maxHeight: '1123px',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
          className="bg-white"
        >
          <LivePreview
            id="pure-export-live-preview"
            data={docData}
            templateId={templateId}
            theme={theme}
            photo={photo}
            typography={typography}
          />
        </div>
      </div>

      {/* PRINT-ONLY CONTAINER (Active during browser print / Save as PDF dialog) */}
      <div id="print-only-container" className="bg-white">
        <div
          id="print-a4-inner"
          className="bg-white"
          style={{
            width: '210mm',
            height: '297mm',
            maxWidth: '210mm',
            maxHeight: '297mm',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          }}
        >
          <LivePreview
            id="print-a4-document"
            data={docData}
            templateId={templateId}
            theme={theme}
            photo={photo}
            typography={typography}
          />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/90 py-4 text-center text-slate-500 text-xs no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Resume & CV Maker &bull; Professional A4 Document Creator</p>
          <p className="font-medium text-[11px] text-slate-400">Autosaved to Local Storage &bull; Cloud Sync Available</p>
        </div>
      </footer>
    </div>
  );
}
