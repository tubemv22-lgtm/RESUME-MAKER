import React from 'react';
import {
  Phone,
  Smartphone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  Settings,
  Award,
  CheckCircle2,
  User,
  Lightbulb,
  Cpu,
  Zap,
  Wrench,
  HardHat,
  Camera,
  Target,
  Languages,
  MessageSquare,
  FileCheck,
  Globe,
  Building2,
  FolderGit2,
  Star,
  UserCheck,
} from 'lucide-react';
import { DocumentData, ThemeColor, PhotoConfig, TypographyConfig, ContentFitMetrics } from '../types';

interface LivePreviewProps {
  id?: string;
  data: DocumentData;
  templateId: number;
  theme: ThemeColor;
  photo: PhotoConfig;
  typography: TypographyConfig;
  onFitScaleChange?: (scale: number) => void;
  onMetricsChange?: (metrics: ContentFitMetrics) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  id = 'a4-document-stage',
  data: rawData,
  templateId,
  theme,
  photo,
  typography,
  onFitScaleChange,
  onMetricsChange,
}) => {
  const data = React.useMemo(() => {
    if (rawData.taglineOrRole && /full-stack|systems engineer/i.test(rawData.taglineOrRole)) {
      return { ...rawData, taglineOrRole: '' };
    }
    return rawData;
  }, [rawData]);
  const {
    fontFamily,
    bodyTextSize,
    personalContactSize: rawPersonalContactSize,
    sectionHeaderSize,
    headerTitleSize,
    headerSubtitleSize,
    pagePadding,
    elementSpacing,
    lineHeight,
    uppercaseHeaders,
    titleAlign = 'left',
    titleOffsetX = 0,
    titleOffsetY = 0,
    headerAlign = 'left',
    headerOffsetX = 0,
    headerOffsetY = 0,
    headerColor,
    titleColor,
    subtitleColor,
  } = typography;

  const customHeaderColor = headerColor && headerColor.trim() !== '' ? headerColor : undefined;
  const customTitleColor = titleColor && titleColor.trim() !== '' ? titleColor : undefined;
  const customSubtitleColor = subtitleColor && subtitleColor.trim() !== '' ? subtitleColor : undefined;

  const headerTitleStyle: React.CSSProperties = {
    textAlign: headerAlign,
    transform: (headerOffsetX !== 0 || headerOffsetY !== 0)
      ? `translate(${headerOffsetX}px, ${headerOffsetY}px)`
      : undefined,
    position: 'relative',
    zIndex: 3,
    transition: 'transform 0.1s ease-out',
    color: customHeaderColor,
  };

  const candidateNameStyle: React.CSSProperties = {
    textAlign: titleAlign,
    transform: (titleOffsetX !== 0 || titleOffsetY !== 0)
      ? `translate(${titleOffsetX}px, ${titleOffsetY}px)`
      : undefined,
    position: 'relative',
    zIndex: 2,
    transition: 'transform 0.1s ease-out',
  };

  const titleBlockStyle = candidateNameStyle;

  // DYNAMIC A4 FIT SPACING ENGINE:
  // When font size increases, smartly compress spacing, padding, line-height & headers
  // so the text itself has room to enlarge without breaking or spilling off the single A4 page.
  const bodyExcess = Math.max(0, bodyTextSize - 12);
  const titleExcess = Math.max(0, headerTitleSize - 22);
  const subtitleExcess = Math.max(0, headerSubtitleSize - 16);
  const sectionExcess = Math.max(0, sectionHeaderSize - 13.5);

  const totalFontExcess = (
    bodyExcess * 1.4 +
    sectionExcess * 0.65 +
    titleExcess * 0.3 +
    subtitleExcess * 0.3
  );

  // 4-side equal page margin safeguard: directly respects user's selected page padding (range 6px - 36px)
  const effectivePagePadding = Math.max(6, Math.min(36, pagePadding || 14));

  const effectiveElementSpacing = Math.max(
    6,
    Math.min(24, Math.round(elementSpacing - Math.min(elementSpacing * 0.35, totalFontExcess * 0.25)))
  );

  const effectiveLineHeight = Math.max(
    1.30,
    Math.min(1.6, Number((lineHeight - totalFontExcess * 0.008).toFixed(2)))
  );

  const effectiveSectionHeaderSize = sectionHeaderSize || 13.5;
  // Unified: Personal contact and details scale directly together with main body content
  const personalContactSize = rawPersonalContactSize ?? bodyTextSize;

  // Dynamic Scale & Containment Guard
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = React.useState<number>(1);

  React.useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const performFitCheck = () => {
      const containerH = container.clientHeight;
      if (containerH <= 0) return;

      const currentScale = fitScale;
      const naturalH = content.scrollHeight;
      const unscaledH = currentScale < 0.999 ? naturalH : naturalH;

      let rawContentH = unscaledH;
      const templateRoot = content.firstElementChild as HTMLElement | null;
      if (templateRoot) {
        // 1. Template 1 specific precise height calculation
        const t1Main = templateRoot.querySelector('[data-t1-main]') as HTMLElement | null;
        const t1Footer = templateRoot.querySelector('[data-t1-footer]') as HTMLElement | null;

        if (templateId === 1 && t1Main) {
          const mainH = t1Main.scrollHeight;
          const footerH = t1Footer ? (t1Footer.scrollHeight || t1Footer.offsetHeight) : 0;
          const bStyle = (typography.t1BorderStyle && typography.t1BorderStyle !== 'geometricPurple') ? typography.t1BorderStyle : 'double';
          const paddingTotal = effectivePagePadding * 2 + Math.max(2, Math.round(effectivePagePadding * 0.35)) * 2;
          rawContentH = mainH + footerH + paddingTotal;
        } else {
          // Multi-column body layout detection:
          // Must exclude small horizontal header rows like applicant name/photo
          let colContainer: HTMLElement | null = null;
          if (
            templateRoot.classList.contains('flex') &&
            !templateRoot.classList.contains('flex-col') &&
            templateRoot.children.length >= 2 &&
            !templateRoot.hasAttribute('data-header-row')
          ) {
            colContainer = templateRoot;
          } else {
            colContainer = templateRoot.querySelector(
              '.flex.min-h-full:not(.flex-col):not([data-header-row]), .flex.flex-1.min-h-0:not(.flex-col):not([data-header-row]), [data-layout="two-col"]'
            ) as HTMLElement | null;
          }

          const footerEl = templateRoot.querySelector('.border-t.border-slate-300, .border-t, [data-footer]') as HTMLElement | null;
          const footerH = (footerEl && footerEl.parentElement === templateRoot) ? footerEl.offsetHeight : 0;

          const isTrueCols = colContainer && colContainer.children.length >= 2 &&
            Array.from(colContainer.children).some(c => (c as HTMLElement).offsetWidth > 100);

          if (isTrueCols && colContainer) {
            const leftEl = colContainer.children[0] as HTMLElement;
            const rightEl = colContainer.children[1] as HTMLElement;

            const getColContentHeight = (el: HTMLElement) => {
              let innerSum = 0;
              for (let i = 0; i < el.children.length; i++) {
                innerSum += (el.children[i] as HTMLElement).scrollHeight || (el.children[i] as HTMLElement).offsetHeight || 0;
              }
              return Math.max(el.scrollHeight, innerSum);
            };

            const leftH = getColContentHeight(leftEl);
            const rightH = getColContentHeight(rightEl);
            rawContentH = Math.max(leftH, rightH) + (colContainer === templateRoot ? 0 : footerH);
          } else {
            const topDiv = templateRoot.querySelector('.flex-1.flex.flex-col, .flex-1') as HTMLElement | null;
            if (topDiv && footerEl && topDiv !== footerEl) {
              rawContentH = topDiv.scrollHeight + (footerEl.scrollHeight || footerEl.offsetHeight);
            } else if (topDiv && topDiv !== footerEl) {
              rawContentH = topDiv.scrollHeight + footerH;
            } else {
              rawContentH = templateRoot.scrollHeight;
            }
          }
        }
      }

      // Target height calculation based on template layout (A4 standard: 1123px)
      const baseH = containerH > 200 ? containerH : 1123;
      const isFullBleedTemplate = templateId === 1 || templateId === 2 || templateId === 4 || templateId === 5 || templateId === 6 || templateId === 7 || templateId === 10 || templateId === 12;
      const targetH = isFullBleedTemplate ? baseH : baseH - effectivePagePadding * 2;
      const effectiveH = Math.max(unscaledH, rawContentH, templateRoot ? templateRoot.scrollHeight : 0);

      // Visual height on screen (Natural 100% scale without shrinking text)
      const visualH = Math.round(effectiveH);
      const diffPx = Math.round(visualH - baseH);
      const isOver = visualH > baseH + 2;
      const isUnder = !isOver && visualH < baseH - 70;
      const fillPct = Math.min(100, Math.max(10, Math.round((visualH / targetH) * 100)));

      onMetricsChange?.({
        naturalHeight: visualH,
        targetHeight: baseH,
        diffPx: diffPx,
        fillPercent: fillPct,
        isOverflowing: isOver,
        isUnderflowing: isUnder,
      });

      if (fitScale !== 1) {
        setFitScale(1);
      }
    };

    performFitCheck();

    const ro = new ResizeObserver(() => {
      performFitCheck();
    });
    ro.observe(content);
    ro.observe(container);

    return () => ro.disconnect();
  }, [
    data,
    templateId,
    theme,
    photo,
    typography,
    bodyTextSize,
    personalContactSize,
    sectionHeaderSize,
    headerTitleSize,
    headerSubtitleSize,
    effectiveElementSpacing,
    effectivePagePadding,
    effectiveLineHeight,
    fitScale,
  ]);

  React.useEffect(() => {
    onFitScaleChange?.(fitScale);
  }, [fitScale, onFitScaleChange]);

  React.useEffect(() => {
    setFitScale(1);
  }, [templateId, data.docType, data.mode]);

  const pageStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${bodyTextSize}px`,
    lineHeight: effectiveLineHeight,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    paddingTop: (templateId === 1 || templateId === 4 || templateId === 6 || templateId === 7 || templateId === 10 || templateId === 12) ? '0px' : `${effectivePagePadding}px`,
    paddingBottom: (templateId === 1 || templateId === 4 || templateId === 6 || templateId === 7 || templateId === 10 || templateId === 12) ? '0px' : `${effectivePagePadding}px`,
    paddingLeft: (templateId === 1 || templateId === 4 || templateId === 6 || templateId === 7 || templateId === 10 || templateId === 12) ? '0px' : `${effectivePagePadding}px`,
    paddingRight: (templateId === 1 || templateId === 4 || templateId === 6 || templateId === 7 || templateId === 10 || templateId === 12) ? '0px' : `${effectivePagePadding}px`,
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    overflow: 'hidden',
    position: 'relative',
    wordBreak: 'break-word',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: theme.primary,
    color: '#ffffff',
  };

  const sectionHeaderStyle: React.CSSProperties = templateId === 10
    ? {
        backgroundColor: 'transparent',
        backgroundImage:
          `linear-gradient(90deg, ${theme.primary} 0%, ${theme.secondary || theme.primary} 40%, ${theme.accent || theme.secondary || theme.primary} 75%, rgba(255, 255, 255, 0) 100%)`,
        color: '#ffffff',
        fontSize: `${effectiveSectionHeaderSize}px`,
        paddingTop: `${Math.max(2.5, effectiveElementSpacing * 0.28)}px`,
        paddingBottom: `${Math.max(2.5, effectiveElementSpacing * 0.28)}px`,
        paddingLeft: '10px',
        paddingRight: '10px',
        textTransform: uppercaseHeaders ? 'uppercase' : 'none',
        borderTop: `2px solid ${theme.primary}`,
        fontWeight: 800,
        letterSpacing: '0.05em',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.45)',
        borderRadius: 0,
      }
    : templateId === 6
    ? {
        backgroundColor: theme.primary,
        backgroundImage: 'none',
        color: '#ffffff',
        fontSize: `${effectiveSectionHeaderSize}px`,
        paddingTop: `${Math.max(2.5, effectiveElementSpacing * 0.28)}px`,
        paddingBottom: `${Math.max(2.5, effectiveElementSpacing * 0.28)}px`,
        paddingLeft: '14px',
        paddingRight: '14px',
        textTransform: uppercaseHeaders ? 'uppercase' : 'none',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)',
        fontWeight: 800,
        letterSpacing: '0.04em',
        borderRadius: 0,
      }
    : {
        backgroundColor: theme.primary,
        backgroundImage: 'none',
        color: '#ffffff',
        fontSize: `${effectiveSectionHeaderSize}px`,
        paddingTop: `${Math.max(2, effectiveElementSpacing * 0.28)}px`,
        paddingBottom: `${Math.max(2, effectiveElementSpacing * 0.28)}px`,
        paddingLeft: `${Math.max(5, effectivePagePadding * 0.45)}px`,
        paddingRight: `${Math.max(5, effectivePagePadding * 0.45)}px`,
        textTransform: uppercaseHeaders ? 'uppercase' : 'none',
      };

  // Profile Photo Box Shape (Round only for Circle / Circular Ring)
  const getPhotoShapeClass = () => {
    switch (photo.shape) {
      case 'circle':
        return 'photo-shape-circle rounded-full';
      case 'rounded':
      case 'oval':
      case 'square':
      default:
        return 'rounded-none';
    }
  };

  const imageStyle: React.CSSProperties = {
    transform: `scale(${photo.scale})`,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const renderPhotoBox = (extraClass = '', defaultBorderColor?: string) => {
    // Dynamic position shift (Up, Down, Left, Right)
    const photoPositionStyle: React.CSSProperties = {
      position: 'relative',
      transform: `translate(${photo.leftOffset || 0}px, ${photo.topOffset || 0}px)`,
      transition: 'transform 0.08s ease-out',
      zIndex: 10,
    };

    // When photo is hidden
    if (!photo.showPhoto) {
      // If preserveLayout is true (default), maintain exact spacing so text never shifts
      const shouldPreserve = photo.preserveLayout !== false;
      if (!shouldPreserve) return null;

      const shapeClass = getPhotoShapeClass();

      // If user enabled affix box for pasting physical photo after printing
      if (photo.affixBox) {
        return (
          <div className={`shrink-0 ${extraClass}`} style={photoPositionStyle}>
            <div
              style={{
                width: `${photo.frameWidth}px`,
                height: `${photo.frameHeight}px`,
                border: `${Math.max(1, photo.borderWidth || 1.5)}px dashed ${photo.borderColor || defaultBorderColor || theme.primary}`,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '4px',
                paddingBottom: '4px',
                paddingLeft: '4px',
                paddingRight: '4px',
                textAlign: 'center',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
              className={`${shapeClass} ${photo.shape === 'circle' ? 'photo-shape-circle' : ''}`}
              data-photo-shape={photo.shape}
            >
              <Camera className="w-4 h-4 text-slate-400 opacity-70 mb-0.5" />
              <span className="text-[8.5px] font-bold text-slate-600 uppercase tracking-tight leading-tight">
                Passport Photo
              </span>
              <span className="text-[7.5px] text-slate-400 leading-tight">Affix Here</span>
            </div>
          </div>
        );
      }

      // Invisible spacer with identical dimensions so texts and sections never shift
      return (
        <div
          className={`shrink-0 ${extraClass}`}
          style={{
            ...photoPositionStyle,
            width: `${photo.frameWidth}px`,
            height: `${photo.frameHeight}px`,
            visibility: 'hidden',
            pointerEvents: 'none',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      );
    }

    const isCircular = photo.shape === 'circle';
    const shapeClass = getPhotoShapeClass();
    const boxStyle: React.CSSProperties = {
      width: `${photo.frameWidth}px`,
      height: `${photo.frameHeight}px`,
      maxWidth: '100%',
      border: `${photo.borderWidth}px solid ${photo.borderColor || defaultBorderColor || theme.primary}`,
      boxShadow: photo.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : 'none',
      overflow: 'hidden',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: isCircular ? '9999px' : '0px',
    };

    return (
      <div className={`shrink-0 ${extraClass}`} style={photoPositionStyle}>
        <div style={boxStyle} className={`${shapeClass} ${isCircular ? 'photo-shape-circle' : ''}`} data-photo-shape={photo.shape}>
          {photo.photoUrl ? (
            <img
              src={photo.photoUrl}
              alt={data.fullName || 'Photo'}
              style={{ ...imageStyle, borderRadius: isCircular ? '9999px' : '0px' }}
              className={`${shapeClass} ${isCircular ? 'photo-shape-circle' : ''}`}
              data-photo-shape={photo.shape}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-slate-400 text-center flex flex-col items-center justify-center p-2">
              <User className="w-8 h-8 text-slate-400 opacity-60" />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Clean contact info renderer
  const renderContactInfo = (textColor = 'text-white/85', addressColor = 'text-white/75') => {
    const contactParts: string[] = [];
    if (data.contactNumber && data.contactNumber.trim() !== '') contactParts.push(`📞 ${data.contactNumber}`);
    if (data.email && data.email.trim() !== '') contactParts.push(`✉ ${data.email}`);

    return (
      <div
        className="space-y-0.5 mt-1"
        style={{ fontSize: `${personalContactSize}px`, lineHeight: 1.3 }}
      >
        {contactParts.length > 0 && (
          <p className={`${textColor} font-medium whitespace-pre-wrap break-words`}>
            {contactParts.join(' | ')}
          </p>
        )}
        {data.websiteOrLinkedin && data.websiteOrLinkedin.trim() !== '' && (
          <p className={`${textColor} whitespace-pre-wrap break-words`}>🌐 {data.websiteOrLinkedin}</p>
        )}
        {data.github && data.github.trim() !== '' && (
          <p className={`${textColor} whitespace-pre-wrap break-words`}>💻 {data.github}</p>
        )}
        {data.addressOrVillage && data.addressOrVillage.trim() !== '' && (
          <p className={`${addressColor} whitespace-pre-wrap break-words leading-snug`}>📍 {data.addressOrVillage}</p>
        )}
      </div>
    );
  };

  const cellPaddingY = `${Math.max(3, Math.min(6, Math.round(effectiveElementSpacing * 0.4)))}px`;
  const cellPaddingX = `${Math.max(4, Math.min(8, Math.round(effectiveElementSpacing * 0.5)))}px`;

  // Section Info Helper: Retrieves custom label and visibility from data.sectionsOrder
  const getSectionInfo = (key: string, defaultLabel: string) => {
    const sec = data.sectionsOrder?.find((s) => s.key === key);
    if (!sec) {
      return { label: defaultLabel, visible: true };
    }
    return {
      label: sec.label && sec.label.trim() ? sec.label : defaultLabel,
      visible: sec.visible !== false,
    };
  };

  // Render individual sections
  const renderCareerObjective = (borderStyle = false) => {
    const sec = getSectionInfo('careerObjective', 'Career Objective');
    if (!sec.visible || !data.careerObjective) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        {borderStyle ? (
          <div
            className="py-0.5 border-b-2 font-bold text-slate-800"
            style={{
              borderColor: theme.primary,
              fontSize: `${effectiveSectionHeaderSize}px`,
              marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px`,
              textTransform: uppercaseHeaders ? 'uppercase' : 'none',
            }}
          >
            {title}
          </div>
        ) : (
          <div
            className="font-bold tracking-wide rounded-sm"
            style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
          >
            {title}
          </div>
        )}
        <p className="text-slate-700 leading-snug break-words whitespace-pre-wrap">
          {data.careerObjective}
        </p>
      </div>
    );
  };

  const renderEducation = () => {
    const sec = getSectionInfo('education', 'Education');
    if (!sec.visible) return null;
    const list = data.education.filter((x) => x.examName || x.boardUniversity);
    if (list.length === 0) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>
        <table
          className="w-full border-collapse border"
          style={{ fontSize: `${bodyTextSize}px`, borderColor: '#cbd5e1' }}
        >
          <thead>
            <tr className="bg-slate-100 font-semibold text-slate-800">
              <th className="border text-left" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                Degree / Exam
              </th>
              <th className="border text-left" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                Board / Institution
              </th>
              <th className="border text-center w-16" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                Year
              </th>
              <th className="border text-right w-20" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                Marks / Grade
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((edu, i) => (
              <tr key={edu.id || i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
                <td className="border font-medium whitespace-pre-wrap break-words" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                  {edu.examName || '—'}
                </td>
                <td className="border whitespace-pre-wrap break-words" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                  {edu.boardUniversity || '—'}
                </td>
                <td className="border text-center whitespace-pre-wrap" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                  {edu.passingYear || '—'}
                </td>
                <td className="border text-right font-medium whitespace-pre-wrap" style={{ borderColor: '#cbd5e1', paddingTop: cellPaddingY, paddingBottom: cellPaddingY, paddingLeft: cellPaddingX, paddingRight: cellPaddingX }}>
                  {edu.percentage ? `${edu.percentage}%` : edu.gradeOrCgpa || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWorkExperience = () => {
    const sec = getSectionInfo('workExperience', 'Work Experience');
    if (!sec.visible) return null;
    const list = data.workExperience.filter((x) => x.jobTitle || x.companyName);
    if (list.length === 0) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;

    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(5, effectiveElementSpacing * 0.7)}px` }}>
          {list.map((exp, idx) => {
            const jobTitle = exp.jobTitle || (exp as any).designation || 'Position';
            const companyName = exp.companyName || (exp as any).organization;
            const duration = exp.duration;
            const location = exp.location;
            const highlights = exp.highlights && exp.highlights.filter(Boolean).length > 0
              ? exp.highlights.filter(Boolean)
              : [];

            return (
              <div key={exp.id || idx} className="text-slate-800" style={{ fontSize: `${bodyTextSize}px` }}>
                <div className="flex items-baseline justify-between gap-2 font-bold text-slate-900 leading-snug">
                  <div>
                    <span className="font-extrabold text-slate-950 text-[102%]">{jobTitle}</span>
                    {companyName && (
                      <span className="font-semibold text-slate-800">
                        {' '}— {companyName}
                        {location && <span className="font-normal text-slate-500 text-[90%]"> ({location})</span>}
                      </span>
                    )}
                  </div>
                  {duration && (
                    <span className="text-[92%] font-normal text-slate-600 shrink-0 select-none">
                      {duration}
                    </span>
                  )}
                </div>

                {highlights.length > 0 && (
                  <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700" style={{ fontSize: `${Math.max(10, bodyTextSize - 0.5)}px` }}>
                    {highlights.map((h, hIdx) => (
                      <li key={hIdx} className="leading-snug">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const sec = getSectionInfo('projects', 'Projects');
    if (!sec.visible) return null;
    const list = data.projects.filter((x) => x.title);
    if (list.length === 0) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${Math.max(2, effectiveElementSpacing * 0.5)}px` }}>
          {list.map((pr, idx) => (
            <div key={pr.id || idx}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900 whitespace-pre-wrap">{pr.title}</span>
                {pr.technologies && (
                  <span className="text-[85%] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 whitespace-pre-wrap">
                    {pr.technologies}
                  </span>
                )}
              </div>
              {pr.description && <p className="text-slate-700 mt-0.5 leading-snug whitespace-pre-wrap">{pr.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKeySkills = () => {
    const sec = getSectionInfo('keySkills', 'Key Skills');
    if (!sec.visible) return null;
    const list = data.keySkills.filter(Boolean);
    if (list.length === 0) return null;
    const skillTitle = sec.label;
    const isBulkTextMode = data.skillsViewMode === 'text';

    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {uppercaseHeaders ? skillTitle.toUpperCase() : skillTitle}
        </div>
        <div
          className="flex flex-col"
          style={{
            fontSize: `${personalContactSize}px`,
            lineHeight: 1.35,
            gap: `${Math.max(2, Math.round(effectiveElementSpacing * 0.28))}px`,
          }}
        >
          {list.map((skill, idx) => {
            if (isBulkTextMode) {
              return (
                <div key={idx} className="flex items-start gap-1.5 leading-snug min-w-0">
                  <span
                    className="font-black shrink-0 select-none text-[115%] leading-none mt-0.5"
                    style={{ color: theme.primary }}
                  >
                    •
                  </span>
                  <div
                    className="flex-1 min-w-0 break-words leading-snug font-semibold text-black"
                    style={{ color: '#000000' }}
                  >
                    {skill}
                  </div>
                </div>
              );
            }

            const colonIdx = skill.indexOf(':');
            let label = '';
            let desc = '';
            if (colonIdx !== -1) {
              label = skill.slice(0, colonIdx).trim();
              desc = skill.slice(colonIdx + 1).trim();
            } else {
              desc = skill.trim();
            }

            return (
              <div key={idx} className="flex items-start gap-1.5 leading-snug min-w-0">
                <span
                  className="font-black shrink-0 select-none text-[115%] leading-none mt-0.5"
                  style={{ color: theme.primary }}
                >
                  •
                </span>
                <div className="flex-1 min-w-0 break-words leading-snug">
                  {label && (
                    <span
                      className="font-bold tracking-tight inline mr-1.5"
                      style={{ color: theme.primary }}
                    >
                      {label}:
                    </span>
                  )}
                  {desc && (
                    <span className="text-black font-normal inline whitespace-pre-wrap break-words" style={{ color: '#000000' }}>
                      {desc}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    const sec = getSectionInfo('certifications', 'Certifications');
    if (!sec.visible) return null;
    const list = data.certifications.filter((x) => x.title);
    if (list.length === 0) return null;
    const certTitle = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {certTitle}
        </div>
        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
          {list.map((c, idx) => (
            <li key={c.id || idx}>
              <span className="font-semibold text-slate-900">{c.title}</span> — {c.issuer} ({c.year})
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderExtraQualifications = () => {
    const sec = getSectionInfo('extraQualifications', 'Additional Skills');
    if (!sec.visible) return null;
    const list = (data.extraQualifications || []).filter(Boolean);
    if (list.length === 0) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>
        <div className="space-y-0.5 text-slate-800" style={{ fontSize: `${personalContactSize}px` }}>
          {list.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1.5 leading-snug">
              <span className="font-bold shrink-0 select-none text-[110%] leading-none mt-0.5" style={{ color: theme.primary }}>•</span>
              <span className="break-words">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonalDetails = () => {
    const sec = getSectionInfo('personalDetails', 'Personal Details');
    if (!sec.visible) return null;
    const items = data.personalDetails ? data.personalDetails.filter((x) => x.value !== undefined && x.value !== null && x.value !== '') : [];

    const displayItems = items.length > 0 ? items : (templateId === 12 ? [
      { id: 'dob', label: 'Date of Birth', value: '15 May 1999' },
      { id: 'nat', label: 'Nationality', value: 'Indian' },
      { id: 'rel', label: 'Religion', value: 'Hindu' },
      { id: 'mar', label: 'Marital Status', value: 'Unmarried' },
      { id: 'lan', label: 'Languages', value: 'Bengali, Hindi, English' },
    ] : []);

    if (displayItems.length === 0) return null;

    const leftCount = Math.ceil(displayItems.length / 2);
    const leftItems = displayItems.slice(0, leftCount);
    const rightItems = displayItems.slice(leftCount);

    const renderItemRow = (it: { id?: string; label: string; value: string }, idx: number) => {
      const trimmedLabel = (it.label || '').replace(/[:\s]+$/, '');
      return (
        <div
          key={it.id || idx}
          className="flex items-baseline leading-snug min-w-0 border-b border-slate-100/80"
          style={{
            paddingTop: `${Math.max(1, Math.min(3, effectiveElementSpacing * 0.16))}px`,
            paddingBottom: `${Math.max(1, Math.min(3, effectiveElementSpacing * 0.16))}px`,
            fontSize: `${personalContactSize}px`,
          }}
        >
          <span
            className="w-32 sm:w-36 shrink-0 font-bold tracking-tight text-slate-800"
            style={{ color: theme.primary }}
          >
            {trimmedLabel}
          </span>
          <span className="w-3 shrink-0 font-bold text-slate-500 text-center select-none mr-1">:</span>
          <span className="flex-1 min-w-0 font-medium text-slate-900 whitespace-pre-wrap break-words">
            {it.value}
          </span>
        </div>
      );
    };

    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;

    return (
      <div className="w-full text-left" style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>

        {rightItems.length === 0 ? (
          <div className="flex flex-col w-full">
            {leftItems.map((it, idx) => renderItemRow(it, idx))}
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 items-start w-full"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              columnGap: '24px',
              alignItems: 'start',
            }}
          >
            <div className="flex flex-col min-w-0">
              {leftItems.map((it, idx) => renderItemRow(it, idx))}
            </div>
            <div className="flex flex-col min-w-0">
              {rightItems.map((it, idx) => renderItemRow(it, idx + leftCount))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFamilyDetails = () => {
    const sec = getSectionInfo('familyDetails', 'Family Details');
    if (!sec.visible) return null;
    const items = data.familyDetails.filter((x) => x.value !== undefined && x.value !== null && x.value !== '');
    if (items.length === 0) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div className="w-full text-left" style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>
        <div className="flex flex-col w-full">
          {items.map((it, idx) => {
            const trimmedLabel = (it.label || '').replace(/[:\s]+$/, '');
            return (
              <div
                key={it.id || idx}
                className="flex items-baseline leading-snug min-w-0 border-b border-slate-100/80"
                style={{
                  paddingTop: `${Math.max(1, Math.min(3, effectiveElementSpacing * 0.16))}px`,
                  paddingBottom: `${Math.max(1, Math.min(3, effectiveElementSpacing * 0.16))}px`,
                  fontSize: `${personalContactSize}px`,
                }}
              >
                <span
                  className="w-32 sm:w-36 shrink-0 font-bold tracking-tight text-slate-800"
                  style={{ color: theme.primary }}
                >
                  {trimmedLabel}
                </span>
                <span className="w-3 shrink-0 font-bold text-slate-500 text-center select-none mr-1">:</span>
                <span className="flex-1 min-w-0 font-medium text-slate-900 whitespace-pre-wrap break-words">
                  {it.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHoroscopeDetails = () => {
    const items = (data.horoscopeDetails || []).filter((x) => x.value !== undefined && x.value !== null && x.value !== '');
    if (items.length === 0) return null;
    return (
      <div className="w-full text-left" style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {uppercaseHeaders ? 'HOROSCOPE DETAILS' : 'Horoscope Details'}
        </div>
        <div className="flex flex-col w-full">
          {items.map((it, idx) => {
            const trimmedLabel = it.label ? it.label.trim() : '';
            const formattedLabel = trimmedLabel ? (trimmedLabel.endsWith(':') ? trimmedLabel : `${trimmedLabel}:`) : '';
            return (
              <div
                key={it.id || idx}
                className="flex items-start gap-1.5 leading-snug min-w-0"
                style={{
                  paddingTop: `${Math.max(1, Math.min(3, effectiveElementSpacing * 0.16))}px`,
                  paddingBottom: `${Math.max(1, Math.min(3, effectiveElementSpacing * 0.16))}px`,
                  fontSize: `${personalContactSize}px`,
                }}
              >
                <span
                  className="font-black shrink-0 select-none text-[115%] leading-none mt-0.5"
                  style={{ color: theme.primary }}
                >
                  •
                </span>
                <div className="flex-1 min-w-0 break-words leading-snug">
                  {formattedLabel && (
                    <span
                      className="font-bold tracking-tight inline mr-1.5"
                      style={{ color: theme.primary }}
                    >
                      {formattedLabel}
                    </span>
                  )}
                  <span className="text-slate-800 font-medium inline whitespace-pre-wrap break-words">
                    {it.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPartnerExpectations = () => {
    if (!data.partnerExpectations) return null;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          Partner Expectations
        </div>
        <div
          className="bg-rose-50/40 border border-rose-200 rounded text-slate-800 leading-snug whitespace-pre-wrap"
          style={{
            paddingTop: `${Math.max(3, effectiveElementSpacing * 0.4)}px`,
            paddingBottom: `${Math.max(3, effectiveElementSpacing * 0.4)}px`,
            paddingLeft: `${Math.max(3, effectiveElementSpacing * 0.4)}px`,
            paddingRight: `${Math.max(3, effectiveElementSpacing * 0.4)}px`,
          }}
        >
          {data.partnerExpectations}
        </div>
      </div>
    );
  };

  const renderCustomSections = () => {
    if (!data.customSections || data.customSections.length === 0) return null;
    return (
      <>
        {data.customSections.map((cs) => (
          <div key={cs.id} style={{ marginBottom: `${effectiveElementSpacing}px` }}>
            <div
              className="font-bold tracking-wide rounded-sm"
              style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
            >
              {cs.title}
            </div>
            <div className="space-y-1.5">
              {cs.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{item.title}</span>
                    {item.dateOrYear && <span className="text-slate-500 font-normal">{item.dateOrYear}</span>}
                  </div>
                  {item.subtitle && <p className="text-indigo-800 italic text-[95%] whitespace-pre-wrap">{item.subtitle}</p>}
                  {item.description && <p className="text-slate-700 mt-0.5 leading-snug whitespace-pre-wrap">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderReferences = () => {
    const sec = getSectionInfo('references', 'References');
    if (!sec.visible) return null;
    const list = data.references.filter((x) => x.name);
    if (list.length === 0) return null;
    const title = uppercaseHeaders ? sec.label.toUpperCase() : sec.label;
    return (
      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
        <div
          className="font-bold tracking-wide rounded-sm"
          style={{ ...sectionHeaderStyle, marginBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px` }}
        >
          {title}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {list.map((r, idx) => (
            <div
              key={r.id || idx}
              className="border border-slate-200 rounded bg-slate-50/40"
              style={{
                paddingTop: `${Math.max(2, effectiveElementSpacing * 0.35)}px`,
                paddingBottom: `${Math.max(2, effectiveElementSpacing * 0.35)}px`,
                paddingLeft: `${Math.max(2, effectiveElementSpacing * 0.35)}px`,
                paddingRight: `${Math.max(2, effectiveElementSpacing * 0.35)}px`,
              }}
            >
              <p className="font-bold text-slate-900 whitespace-pre-wrap">{r.name}</p>
              <p className="text-slate-700 whitespace-pre-wrap">{r.designation} — {r.company}</p>
              <p className="text-slate-500 text-[90%] whitespace-pre-wrap">{r.contact}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDeclarationFooter = () => {
    return (
      <div
        className="border-t border-slate-300 shrink-0 mt-auto w-full"
        style={{
          marginTop: 'auto',
          paddingTop: `${Math.max(8, Math.round(effectiveElementSpacing * 0.55))}px`,
          paddingBottom: '0px',
        }}
      >
        {data.declaration && (
          <p className="text-slate-600 italic text-[90%] mb-1.5 leading-snug break-words whitespace-pre-wrap">
            {data.declaration}
          </p>
        )}
        <div className="flex justify-between items-end text-slate-800">
          <div className="space-y-1">
            <p>
              <span className="font-bold text-slate-900">Date :</span> {data.date || '_____________'}
            </p>
            <p>
              <span className="font-bold text-slate-900">Place :</span> {data.place || '_____________'}
            </p>
          </div>
          <div className="text-right min-w-[160px] flex flex-col items-end gap-1">
            <p className="font-semibold text-slate-900">
              <span className="font-bold">Signature :</span> ___________________
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Section Ordering Map
  const sectionComponentMap: Record<string, () => React.ReactNode> = {
    careerObjective: () => renderCareerObjective(templateId === 4 || templateId === 8),
    education: renderEducation,
    workExperience: renderWorkExperience,
    projects: renderProjects,
    keySkills: renderKeySkills,
    extraQualifications: renderExtraQualifications,
    certifications: renderCertifications,
    personalDetails: renderPersonalDetails,
    familyDetails: renderFamilyDetails,
    horoscopeDetails: renderHoroscopeDetails,
    partnerExpectations: renderPartnerExpectations,
    customSections: renderCustomSections,
    references: renderReferences,
  };

  const renderOrderedSections = () => {
    if (!data.sectionsOrder || data.sectionsOrder.length === 0) {
      // Default fallback render sequence
      return (
        <>
          {renderCareerObjective(templateId === 4 || templateId === 8)}
          {renderEducation()}
          {renderWorkExperience()}
          {renderProjects()}
          {renderKeySkills()}
          {renderExtraQualifications()}
          {renderCertifications()}
          {renderPersonalDetails()}
          {renderFamilyDetails()}
          {renderHoroscopeDetails()}
          {renderPartnerExpectations()}
          {renderCustomSections()}
          {renderReferences()}
        </>
      );
    }

    return (
      <>
        {data.sectionsOrder
          .filter((s) => s.visible && s.key !== 'declaration')
          .map((sec) => {
            const renderer = sectionComponentMap[sec.key];
            if (renderer) return <React.Fragment key={sec.id || sec.key}>{renderer()}</React.Fragment>;
            if (sec.key.startsWith('custom_')) {
              return <React.Fragment key={sec.id}>{renderCustomSections()}</React.Fragment>;
            }
            return null;
          })}
      </>
    );
  };

  const getFullBleedHeaderStyle = (extraStyles: React.CSSProperties = {}): React.CSSProperties => {
    const padY = Math.max(6, Math.round(effectivePagePadding * 0.55));
    const padX = effectivePagePadding;
    return {
      ...headerStyle,
      paddingTop: `${padY}px`,
      paddingBottom: `${padY}px`,
      paddingLeft: `${padX}px`,
      paddingRight: `${padX}px`,
      marginLeft: `-${effectivePagePadding}px`,
      marginRight: `-${effectivePagePadding}px`,
      marginTop: `-${effectivePagePadding}px`,
      marginBottom: `${effectiveElementSpacing}px`,
      ...extraStyles,
    };
  };

  return (
    <div
      id={id}
      ref={containerRef}
      className="w-full h-full bg-white relative overflow-hidden flex flex-col resume-document-root"
      style={pageStyle}
    >
      <div
        ref={contentRef}
        className="w-full h-full min-h-full flex-1 flex flex-col justify-start"
        style={{
          height: '100%',
          minHeight: '100%',
          width: '100%',
        }}
      >
      {/* TEMPLATE 1: Classical Bio-Data with Double Border & Ornamental Accents (Matching Reference Image) */}
      {templateId === 1 && (() => {
        const primaryColor = theme.primary || '#0f172a';
        const outerMargin = Math.max(3, Math.round(effectivePagePadding * 0.4)); // Dynamically scales with Equal Page Margins
        const borderGap = 4; // Gap between outer border and inner border

        // Filter and organize personal details
        const personalItems = (data.personalDetails || []).filter(
          (x) => x && x.label && x.value !== undefined && x.value !== null && x.value.toString().trim() !== ''
        );

        // Separate language if present so we can display Languages Known cleanly or in sequence
        const educationList = (data.education || []).filter((e) => e && (e.examName || e.boardUniversity));
        const experienceList = (data.workExperience || []).filter((w) => w && (w.jobTitle || w.companyName));
        const keySkillsList = (data.keySkills || []).filter((s) => s && s.trim());
        const certList = (data.certifications || []).filter((c) => c && c.title);
        const extraQualList = (data.extraQualifications || []).filter((q) => q && q.trim());

        const bStyle = (typography.t1BorderStyle && typography.t1BorderStyle !== 'geometricPurple') ? typography.t1BorderStyle : 'double';
        const borderColor = primaryColor === '#0f172a' ? '#000000' : (primaryColor || '#000000');
        const sectionBorderColor = '#000000';
        const innerPadding = effectivePagePadding;

        // Helper to render authentic page border based on selected style
        const renderBorderBox = (children: React.ReactNode) => {
          if (bStyle === 'geometricPurple') {
            return (
              <div
                className="w-full h-full min-h-full flex-1 flex flex-col justify-start relative bg-white overflow-hidden p-0"
                style={{ position: 'relative' }}
              >
                {/* SVG Geometric Dual-Frame (Perimeter border framing) */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-0 select-none"
                  viewBox="0 0 800 1130"
                  preserveAspectRatio="none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Border Line (Perimeter at 20px with subtle corner chamfers) */}
                  <path
                    d="M 20 44 L 44 20 L 756 20 L 780 44 L 780 1086 L 756 1110 L 44 1110 L 20 1086 Z"
                    stroke={borderColor}
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Inner Border Line (Perimeter at 32px with gentle corner bevels) */}
                  <path
                    d="M 32 48 L 48 32 L 752 32 L 768 48 L 768 1082 L 752 1098 L 48 1098 L 32 1082 Z"
                    stroke={borderColor}
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* TOP-RIGHT ACCENTS */}
                  {/* Top-Right Floating Top Horizontal Bar */}
                  <polygon
                    points="590,14 600,8 732,8 742,14"
                    fill={borderColor}
                  />

                  {/* Top-Right Corner Accent Block (Stays strictly within perimeter band) */}
                  <polygon
                    points="756,20 780,44 780,68 768,56 768,48 752,32 742,32"
                    fill={borderColor}
                  />

                  {/* Top-Right Floating Right Flank Bar */}
                  <polygon
                    points="786,50 792,44 792,160 786,154"
                    fill={borderColor}
                  />

                  {/* BOTTOM-LEFT ACCENTS */}
                  {/* Bottom-Left Floating Left Flank Bar */}
                  <polygon
                    points="8,970 14,976 14,1074 8,1080"
                    fill={borderColor}
                  />

                  {/* Bottom-Left Corner Accent Block (Stays strictly within perimeter band, never encroaches inward) */}
                  <polygon
                    points="20,1062 20,1086 44,1110 56,1110 48,1098 32,1082 32,1072"
                    fill={borderColor}
                  />

                  {/* Bottom-Left Floating Bottom Horizontal Bar */}
                  <polygon
                    points="58,1116 68,1122 200,1122 210,1116"
                    fill={borderColor}
                  />
                </svg>

                {/* Safe Inner Content Container - Dynamically scales with Equal Page Margins */}
                <div
                  data-t1-border="geometricPurple"
                  className="flex-1 flex flex-col justify-between relative z-10 box-border"
                  style={{
                    paddingTop: `${Math.max(14, effectivePagePadding + 14)}px`,
                    paddingBottom: `${Math.max(14, effectivePagePadding + 14)}px`,
                    paddingLeft: `${Math.max(16, effectivePagePadding + 18)}px`,
                    paddingRight: `${Math.max(16, effectivePagePadding + 18)}px`,
                  }}
                >
                  {children}
                </div>
              </div>
            );
          }

          if (bStyle === 'thickThin') {
            return (
              <div
                data-t1-border="thickThin"
                className="w-full h-full min-h-full flex-1 flex flex-col relative box-border bg-white"
                style={{
                  border: `3px solid ${borderColor}`,
                  padding: '2.5px',
                }}
              >
                <div
                  className="w-full h-full min-h-full flex-1 flex flex-col justify-between relative box-border bg-white"
                  style={{
                    border: `1px solid ${borderColor}`,
                    padding: `${innerPadding}px`,
                  }}
                >
                  {children}
                </div>
              </div>
            );
          }

          if (bStyle === 'thinThick') {
            return (
              <div
                data-t1-border="thinThick"
                className="w-full h-full min-h-full flex-1 flex flex-col relative box-border bg-white"
                style={{
                  border: `1px solid ${borderColor}`,
                  padding: '2.5px',
                }}
              >
                <div
                  className="w-full h-full min-h-full flex-1 flex flex-col justify-between relative box-border bg-white"
                  style={{
                    border: `3px solid ${borderColor}`,
                    padding: `${innerPadding}px`,
                  }}
                >
                  {children}
                </div>
              </div>
            );
          }

          if (bStyle === 'single') {
            return (
              <div
                data-t1-border="single"
                className="w-full h-full min-h-full flex-1 flex flex-col justify-start relative box-border bg-white"
                style={{
                  border: `2px solid ${borderColor}`,
                  padding: `${innerPadding}px`,
                }}
              >
                {children}
              </div>
            );
          }

          if (bStyle === 'triple') {
            return (
              <div
                data-t1-border="triple"
                className="w-full h-full min-h-full flex-1 flex flex-col relative box-border bg-white"
                style={{
                  border: `1px solid ${borderColor}`,
                  padding: '1.5px',
                }}
              >
                <div
                  className="w-full h-full min-h-full flex-1 flex flex-col relative box-border bg-white"
                  style={{
                    border: `2px solid ${borderColor}`,
                    padding: '1.5px',
                  }}
                >
                  <div
                    className="w-full h-full min-h-full flex-1 flex flex-col justify-start relative box-border bg-white"
                    style={{
                      border: `1px solid ${borderColor}`,
                      padding: `${innerPadding}px`,
                    }}
                  >
                    {children}
                  </div>
                </div>
              </div>
            );
          }

          if (bStyle === 'oxford') {
            return (
              <div
                data-t1-border="oxford"
                className="w-full h-full min-h-full flex-1 flex flex-col justify-start relative box-border bg-white"
                style={{
                  padding: `${innerPadding}px`,
                }}
              >
                {/* Clean Oxford intersecting crosshair lines */}
                <div className="absolute inset-0 pointer-events-none select-none">
                  <div className="absolute top-2 left-0 right-0 h-[2px] bg-black" />
                  <div className="absolute bottom-2 left-0 right-0 h-[2px] bg-black" />
                  <div className="absolute top-0 bottom-0 left-2 w-[2px] bg-black" />
                  <div className="absolute top-0 bottom-0 right-2 w-[2px] bg-black" />
                </div>
                {children}
              </div>
            );
          }

          // Default: Classic MS Word Double Border (sharp 90-degree corners, pure parallel lines)
          return (
            <div
              data-t1-border="double"
              className="w-full h-full min-h-full flex-1 flex flex-col justify-start relative box-border bg-white"
              style={{
                border: `4.5px double ${borderColor}`,
                padding: `${innerPadding}px`,
              }}
            >
              {children}
            </div>
          );
        };

        return (
          <div
            key="template-1"
            className="w-full h-full min-h-full flex-1 flex flex-col relative box-border bg-white"
            style={{
              padding: bStyle === 'geometricPurple' ? '0px' : `${outerMargin}px`,
            }}
          >
            {renderBorderBox(
              <>
                {/* MAIN INNER CONTENT AREA */}
                <div data-t1-main="true" className="flex-1 flex flex-col justify-start">
                  
                  {/* TOP HEADER: Centered Document Title & APPLICANT DETAILS ROW (Photo cleanly at top-right) */}
                  <div
                    data-header-row="true"
                    className="flex items-start justify-between gap-3 pb-2"
                    style={{
                      marginBottom: `${effectiveElementSpacing}px`,
                      borderBottom: '1px solid #cbd5e1',
                    }}
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      {/* Document Title: Centered */}
                      <div
                        className="text-center relative"
                        style={{
                          ...headerTitleStyle,
                          marginBottom: `${Math.max(4, Math.round(effectiveElementSpacing * 0.55))}px`,
                        }}
                      >
                        <h1
                          className="font-bold uppercase tracking-wide inline-block pb-0.5"
                          style={{
                            fontSize: `${headerTitleSize + 2}px`,
                            color: customHeaderColor || (bStyle === 'geometricPurple' ? borderColor : '#000000'),
                            borderBottom: `2px solid ${bStyle === 'geometricPurple' ? borderColor : '#000000'}`,
                            fontFamily: "'Times New Roman', Times, 'Playfair Display', serif, inherit",
                          }}
                        >
                          {data.docType || 'BIO - DATA'}
                        </h1>
                      </div>

                      {/* Candidate Name & Contact Details */}
                      <div style={candidateNameStyle} className="mt-0.5">
                        <h2
                          className="font-extrabold uppercase tracking-wide text-slate-900 leading-tight"
                          style={{
                            fontSize: `${headerSubtitleSize + 3}px`,
                            color: customTitleColor || (bStyle === 'geometricPurple' ? borderColor : '#000000'),
                          }}
                        >
                          {data.fullName || 'YOUR FULL NAME'}
                        </h2>
                        {data.taglineOrRole && (
                          <p
                            className="font-semibold text-slate-700 italic mt-0.5 leading-snug"
                            style={{
                              fontSize: `${bodyTextSize}px`,
                              color: customSubtitleColor || undefined,
                            }}
                          >
                            {data.taglineOrRole}
                          </p>
                        )}
                        {/* Compact Contact details row */}
                        <div
                          className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 font-medium"
                          style={{ fontSize: `${personalContactSize}px`, lineHeight: 1.35 }}
                        >
                          {data.contactNumber && (
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-slate-900">Phone:</span>
                              <span>{data.contactNumber}</span>
                            </span>
                          )}
                          {data.email && (
                            <span className="flex items-center gap-1">
                              <span className="font-semibold text-slate-900">Email:</span>
                              <span>{data.email}</span>
                            </span>
                          )}
                          {data.addressOrVillage && (
                            <span className="flex items-center gap-1 w-full">
                              <span className="font-semibold text-slate-900">Address:</span>
                              <span>{data.addressOrVillage}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Passport Photo Box (Aligned cleanly at the top right, higher up) */}
                    {photo.showPhoto && (
                      <div className="shrink-0 flex items-start justify-center pt-0 self-start">
                        {renderPhotoBox()}
                      </div>
                    )}
                  </div>

                  {/* DYNAMIC ORDERED SECTIONS OR CUSTOM TECHNICAL SECTIONS */}
                  <div className="w-full">
                    {/* 1. CAREER OBJECTIVE */}
                    {getSectionInfo('careerObjective', 'Career Objective').visible && data.careerObjective && (
                      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
                        <div
                          className="font-bold uppercase tracking-wider text-black pb-0.5 mb-1.5 flex items-center justify-between"
                          style={{
                            fontSize: `${sectionHeaderSize}px`,
                            borderBottom: `1.5px solid ${sectionBorderColor}`,
                            fontFamily: "'Times New Roman', Times, serif, inherit",
                            color: bStyle === 'geometricPurple' ? sectionBorderColor : '#000000',
                          }}
                        >
                          <span>{getSectionInfo('careerObjective', 'Career Objective').label}</span>
                        </div>
                        <p
                          className="text-slate-800 text-justify leading-relaxed"
                          style={{ fontSize: `${bodyTextSize}px`, lineHeight: effectiveLineHeight }}
                        >
                          {data.careerObjective}
                        </p>
                      </div>
                    )}

                    {/* 2. ACADEMIC QUALIFICATION (TABLE FORMAT) */}
                    {getSectionInfo('education', 'Academic Qualification').visible && educationList.length > 0 && (
                      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
                        <div
                          className="font-bold uppercase tracking-wider text-black pb-0.5 mb-1.5 flex items-center justify-between"
                          style={{
                            fontSize: `${sectionHeaderSize}px`,
                            borderBottom: `1.5px solid ${sectionBorderColor}`,
                            fontFamily: "'Times New Roman', Times, serif, inherit",
                            color: bStyle === 'geometricPurple' ? sectionBorderColor : '#000000',
                          }}
                        >
                          <span>{getSectionInfo('education', 'Academic Qualification').label}</span>
                        </div>
                        <div className="w-full overflow-hidden border" style={{ borderColor: sectionBorderColor }}>
                          <table className="w-full text-left border-collapse" style={{ fontSize: `${bodyTextSize}px` }}>
                            <thead>
                              <tr className="bg-slate-100 font-bold border-b text-black" style={{ borderColor: sectionBorderColor }}>
                                <th className="py-1 px-2 border-r w-[32%]" style={{ borderColor: sectionBorderColor }}>Exam / Course</th>
                                <th className="py-1 px-2 border-r w-[36%]" style={{ borderColor: sectionBorderColor }}>Board / University</th>
                                <th className="py-1 px-2 border-r text-center w-[16%]" style={{ borderColor: sectionBorderColor }}>Year</th>
                                <th className="py-1 px-2 text-center w-[16%]">Marks / %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {educationList.map((edu, idx) => (
                                <tr
                                  key={edu.id || idx}
                                  className={`border-b last:border-b-0 ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
                                  style={{ borderColor: sectionBorderColor }}
                                >
                                  <td className="py-1 px-2 border-r font-semibold text-slate-900" style={{ borderColor: sectionBorderColor }}>
                                    {edu.examName}
                                  </td>
                                  <td className="py-1 px-2 border-r text-slate-800" style={{ borderColor: sectionBorderColor }}>
                                    {edu.boardUniversity}
                                  </td>
                                  <td className="py-1 px-2 border-r text-center font-medium text-slate-800" style={{ borderColor: sectionBorderColor }}>
                                    {edu.passingYear || '-'}
                                  </td>
                                  <td className="py-1 px-2 text-center font-semibold text-slate-900">
                                    {edu.percentage ? `${edu.percentage}%` : (edu.gradeOrCgpa || '-')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* 3. WORK EXPERIENCE (IF PRESENT) */}
                    {getSectionInfo('workExperience', 'Work Experience').visible && experienceList.length > 0 && (
                      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
                        <div
                          className="font-bold uppercase tracking-wider text-black pb-0.5 mb-1.5 flex items-center justify-between"
                          style={{
                            fontSize: `${sectionHeaderSize}px`,
                            borderBottom: `1.5px solid ${sectionBorderColor}`,
                            fontFamily: "'Times New Roman', Times, serif, inherit",
                            color: bStyle === 'geometricPurple' ? sectionBorderColor : '#000000',
                          }}
                        >
                          <span>{getSectionInfo('workExperience', 'Work Experience').label}</span>
                        </div>
                        <div className="space-y-1.5">
                          {experienceList.map((w, idx) => (
                            <div key={w.id || idx} className="text-slate-800">
                              <div className="flex items-center justify-between font-bold text-black" style={{ fontSize: `${bodyTextSize}px` }}>
                                <span>{w.jobTitle} - <span className="font-semibold text-slate-700">{w.companyName}</span></span>
                                <span className="text-xs font-normal text-slate-600">{w.duration}</span>
                              </div>
                              {w.highlights && w.highlights.length > 0 && (
                                <ul className="list-disc ml-4 mt-0.5 space-y-0.5 text-slate-700" style={{ fontSize: `${bodyTextSize - 0.5}px` }}>
                                  {w.highlights.map((h, hIdx) => (
                                    <li key={hIdx}>{h}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. TECHNICAL / KEY SKILLS */}
                    {getSectionInfo('keySkills', 'Key Skills & Competencies').visible && keySkillsList.length > 0 && (
                      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
                        <div
                          className="font-bold uppercase tracking-wider text-black pb-0.5 mb-1.5 flex items-center justify-between"
                          style={{
                            fontSize: `${sectionHeaderSize}px`,
                            borderBottom: `1.5px solid ${sectionBorderColor}`,
                            fontFamily: "'Times New Roman', Times, serif, inherit",
                            color: bStyle === 'geometricPurple' ? sectionBorderColor : '#000000',
                          }}
                        >
                          <span>{getSectionInfo('keySkills', 'Key Skills & Competencies').label}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {keySkillsList.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-900 rounded font-medium"
                              style={{ fontSize: `${bodyTextSize - 0.5}px` }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. EXTRA QUALIFICATIONS / CERTIFICATIONS */}
                    {getSectionInfo('certifications', 'Certifications & Qualifications').visible && (certList.length > 0 || extraQualList.length > 0) && (
                      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
                        <div
                          className="font-bold uppercase tracking-wider text-black pb-0.5 mb-1.5 flex items-center justify-between"
                          style={{
                            fontSize: `${sectionHeaderSize}px`,
                            borderBottom: `1.5px solid ${sectionBorderColor}`,
                            fontFamily: "'Times New Roman', Times, serif, inherit",
                            color: bStyle === 'geometricPurple' ? sectionBorderColor : '#000000',
                          }}
                        >
                          <span>{getSectionInfo('certifications', 'Certifications & Qualifications').label}</span>
                        </div>
                        <ul className="list-disc ml-4 space-y-0.5 text-slate-800" style={{ fontSize: `${bodyTextSize}px` }}>
                          {certList.map((c, idx) => (
                            <li key={idx}>
                              <span className="font-semibold text-black">{c.title}</span>
                              {c.issuer && <span className="text-slate-600"> - {c.issuer}</span>}
                              {c.year && <span className="text-slate-500"> ({c.year})</span>}
                            </li>
                          ))}
                          {extraQualList.map((q, idx) => (
                            <li key={idx} className="text-slate-800 font-medium">
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 6. PERSONAL DETAILS (2-COLUMN GRID TABLE WITH ALIGNED COLONS) */}
                    {getSectionInfo('personalDetails', 'Personal Details').visible && personalItems.length > 0 && (
                      <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
                        <div
                          className="font-bold uppercase tracking-wider text-black pb-0.5 mb-1.5 flex items-center justify-between"
                          style={{
                            fontSize: `${sectionHeaderSize}px`,
                            borderBottom: `1.5px solid ${sectionBorderColor}`,
                            fontFamily: "'Times New Roman', Times, serif, inherit",
                            color: bStyle === 'geometricPurple' ? sectionBorderColor : '#000000',
                          }}
                        >
                          <span>{getSectionInfo('personalDetails', 'Personal Details').label}</span>
                        </div>
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5"
                          style={{ fontSize: `${bodyTextSize}px` }}
                        >
                          {personalItems.map((item, idx) => (
                            <div key={item.id || idx} className="flex items-start text-slate-800 py-0.5 border-b border-slate-100 last:border-b-0">
                              <span className="font-bold text-black min-w-[96px] max-w-[116px] sm:min-w-[102px] shrink-0 leading-tight">
                                {item.label}
                              </span>
                              <span className="font-bold text-black mr-1 shrink-0">:</span>
                              <span className="flex-1 font-medium text-slate-900 break-words leading-tight">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* DECLARATION & SIGNATURE FOOTER */}
                <div
                  data-t1-footer="true"
                  className="mt-auto shrink-0 pt-1.5"
                  style={{
                    borderTop: `1px solid ${sectionBorderColor}`,
                    marginTop: `${effectiveElementSpacing}px`,
                  }}
                >
                  <p
                    className="text-slate-800 text-justify mb-1.5 leading-relaxed"
                    style={{ fontSize: `${bodyTextSize - 0.5}px` }}
                  >
                    {data.declaration ||
                      'I hereby declare that all the information furnished above is true and correct to the best of my knowledge and belief.'}
                  </p>
                  <div
                    className="flex items-end justify-between font-semibold text-slate-900 pt-0.5"
                    style={{ fontSize: `${bodyTextSize}px` }}
                  >
                    <div className="space-y-0.5 pl-3 sm:pl-4">
                      <div>Date : <span className="font-normal">{data.date || '____/____/2026'}</span></div>
                      <div>Place : <span className="font-normal">{data.place || '_________________'}</span></div>
                    </div>
                    <div className="text-right pr-1">
                      <div className="w-32 border-b border-black mb-1 mx-auto sm:ml-auto"></div>
                      <div className="font-bold uppercase tracking-wider text-black text-[90%]">
                        (Signature)
                      </div>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        );
      })()}

      {/* TEMPLATE 2: Wave Emerald */}
      {templateId === 2 && (
        <div key="template-2" className="w-full h-full min-h-full flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start">
            <div className="border-b-4 border-amber-400" style={getFullBleedHeaderStyle()}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div style={headerTitleStyle}>
                    <h1 className="font-black uppercase tracking-widest text-white whitespace-pre-wrap break-words" style={{ fontSize: `${headerTitleSize + 4}px`, color: customHeaderColor || undefined }}>
                      {data.docType || 'CURRICULUM VITAE'}
                    </h1>
                  </div>
                  <div style={candidateNameStyle}>
                    <h2 className="font-bold uppercase mt-0.5 text-amber-300 whitespace-pre-wrap break-words" style={{ fontSize: `${headerSubtitleSize + 2}px`, color: customTitleColor || undefined }}>
                      {data.fullName || 'YOUR FULL NAME'}
                    </h2>
                    {data.taglineOrRole && <p className="text-[90%] text-white/90 italic mt-0.5 whitespace-pre-wrap break-words" style={{ color: customSubtitleColor || undefined }}>{data.taglineOrRole}</p>}
                  </div>
                  {renderContactInfo('text-white/90', 'text-white/80')}
                </div>
                {renderPhotoBox()}
              </div>
            </div>
            <div className="flex-1">{renderOrderedSections()}</div>
          </div>
          <div className="mt-auto shrink-0">{renderDeclarationFooter()}</div>
        </div>
      )}

      {/* TEMPLATE 3: Sidebar Stripe (Full-Fit with Left Accent Stripe) */}
      {templateId === 3 && (
        <div key="template-3" className="w-full h-full min-h-full flex-1 flex flex-col justify-between border-l-4 pl-3.5" style={{ borderColor: theme.primary }}>
          <div className="flex-1 flex flex-col justify-start">
            <div
              className="border-b-2 flex items-center justify-between gap-4 pb-2"
              style={{
                borderColor: theme.primary,
                paddingBottom: `${effectiveElementSpacing}px`,
                marginBottom: `${effectiveElementSpacing}px`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div style={headerTitleStyle}>
                  <h1 className="font-black uppercase tracking-wider whitespace-pre-wrap break-words" style={{ color: customHeaderColor || theme.primary, fontSize: `${headerTitleSize + 4}px` }}>
                    {data.docType || 'CURRICULUM VITAE'}
                  </h1>
                </div>
                <div style={candidateNameStyle}>
                  <h2 className="font-bold text-slate-800 uppercase mt-0.5 whitespace-pre-wrap break-words" style={{ fontSize: `${headerSubtitleSize + 2}px`, color: customTitleColor || undefined }}>
                    {data.fullName || 'YOUR FULL NAME'}
                  </h2>
                  {data.taglineOrRole && <p className="text-slate-600 italic text-[90%] whitespace-pre-wrap break-words" style={{ color: customSubtitleColor || undefined }}>{data.taglineOrRole}</p>}
                </div>
                {renderContactInfo('text-slate-600', 'text-slate-500')}
              </div>
              {renderPhotoBox()}
            </div>
            <div className="flex-1">{renderOrderedSections()}</div>
          </div>
          <div className="mt-auto shrink-0">{renderDeclarationFooter()}</div>
        </div>
      )}

      {/* TEMPLATE 4: Apex Executive (Modern Architectural Executive Resume Layout) */}
      {templateId === 4 && (() => {
        const primaryColor = theme.primary || '#0d8f62';
        const secondaryColor = theme.secondary || '#0b7a53';
        const accentColor = theme.accent || '#34d399';

        // Filter personal details: STRICTLY EXCLUDE all matrimonial biodata fields
        const personalItems = (data.personalDetails || []).filter(
          (x) =>
            x.value !== undefined &&
            x.value !== null &&
            x.value.trim() !== '' &&
            !/language/i.test(x.label) &&
            !/father'?s\s*name|mother'?s\s*name|marital\s*status|religion|caste|gotra|rashi|complexion|height|weight/i.test(x.label)
        );

        // Extract languages
        const languageField = data.personalDetails?.find(
          (x) => /language/i.test(x.label) && x.value && x.value.trim() !== ''
        );
        const languageList = languageField
          ? languageField.value.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
          : ['English (Fluent)', 'Bengali (Native)', 'Hindi (Conversational)'];

        // Work experience
        const expList = (data.workExperience || []).filter(
          (x) =>
            (x.jobTitle && x.jobTitle.trim() !== '') ||
            (x.companyName && x.companyName.trim() !== '') ||
            ((x as any).designation && (x as any).designation.trim() !== '') ||
            ((x as any).organization && (x as any).organization.trim() !== '')
        );
        // Section titles & visibility from data.sectionsOrder
        const getSecInfo = (key: string, fallback: string) => {
          const s = data.sectionsOrder?.find((x) => x.key === key);
          return {
            label: s?.label && s.label.trim() ? s.label : fallback,
            visible: s ? s.visible !== false : true,
          };
        };

        const eduSec = getSecInfo('education', 'Education');
        const skillsSec = getSecInfo('keySkills', 'Core Skills');
        const certSec = getSecInfo('certifications', 'Certifications & Licences');
        const workSec = getSecInfo('workExperience', 'Professional Experience');
        const objSec = getSecInfo('careerObjective', 'Executive Summary');
        const projSec = getSecInfo('projects', 'Key Projects');
        const extraSec = getSecInfo('extraQualifications', 'Key Achievements & Honors');
        const personalSec = getSecInfo('personalDetails', 'Profile Details');
        const refSec = getSecInfo('references', 'References');

        const showWorkExp = expList.length > 0 || (data.workExperience && data.workExperience.length > 0);

        const eduList = (data.education || []).filter(
          (x) =>
            (x.examName && x.examName.trim() !== '') ||
            (x.boardUniversity && x.boardUniversity.trim() !== '') ||
            (x.passingYear && x.passingYear.trim() !== '')
        );

        const hasContact = data.contactNumber || data.email || data.addressOrVillage || data.websiteOrLinkedin;

        const renderSectionBadge = (title: string, Icon: React.ComponentType<{ className?: string }>) => (
          <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-slate-200">
            <div
              className="w-4.5 h-4.5 rounded flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <Icon className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
            <h3
              className="font-black uppercase tracking-wider text-slate-900 text-[10.5px]"
              style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
            >
              {uppercaseHeaders ? title.toUpperCase() : title}
            </h3>
          </div>
        );

        return (
          <div
            key="template-4"
            className="w-full h-full min-h-full flex flex-col justify-between bg-white overflow-hidden text-slate-800"
            style={{
              fontSize: `${bodyTextSize}px`,
              lineHeight: effectiveLineHeight,
            }}
          >
            <div className="flex-1 flex flex-col justify-start">
              {/* TOP ACCENT LINE */}
              <div
                className="w-full h-1.5 shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 60%, ${accentColor} 100%)`,
                }}
              />

              {/* 1. DISTINCTIVE EDITORIAL HEADER (Light, Modern, Zero Heavy Box) */}
              <div className="w-full bg-slate-50/60 border-b border-slate-200/90 px-6 py-3.5 shrink-0">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Identity & Contact Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block uppercase tracking-[0.22em] text-[9px] font-black px-2 py-0.5 rounded-xs"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          color: customHeaderColor || primaryColor,
                          fontSize: `${Math.max(8.5, Math.round(headerTitleSize * 0.42))}px`,
                        }}
                      >
                        {data.docType || 'CURRICULUM VITAE'}
                      </span>
                    </div>

                    <div style={candidateNameStyle}>
                      <h1
                        className="font-black uppercase tracking-tight text-slate-950 leading-none whitespace-pre-wrap break-words"
                        style={{
                          fontSize: `${headerSubtitleSize + 5}px`,
                          color: customTitleColor || undefined,
                        }}
                      >
                        {data.fullName || 'SAHIB KHAN'}
                      </h1>
                    </div>

                    {data.taglineOrRole && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                        <span
                          className="font-semibold text-slate-700 tracking-wide text-[11.5px] whitespace-pre-wrap break-words"
                          style={{
                            fontSize: `${Math.max(10, Math.round(headerSubtitleSize * 0.62))}px`,
                            color: customSubtitleColor || undefined,
                          }}
                        >
                          {data.taglineOrRole}
                        </span>
                      </div>
                    )}

                    {/* Integrated Micro Contact Row */}
                    {hasContact && (
                      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-slate-600 text-[10.5px] font-medium">
                        {data.contactNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                            <span>{data.contactNumber}</span>
                          </div>
                        )}
                        {data.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                            <span>{data.email}</span>
                          </div>
                        )}
                        {data.addressOrVillage && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                            <span className="truncate max-w-[240px]">{data.addressOrVillage}</span>
                          </div>
                        )}
                        {data.websiteOrLinkedin && (
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3 shrink-0" style={{ color: primaryColor }} />
                            <span className="truncate max-w-[180px]">{data.websiteOrLinkedin}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Candidate Photo */}
                  <div className="shrink-0">
                    {renderPhotoBox('shadow-sm ring-2 ring-white ring-offset-1 ring-offset-slate-200 rounded-lg overflow-hidden', '#ffffff')}
                  </div>
                </div>
              </div>

              {/* 2. ASYMMETRIC TWO-COLUMN PRECISION GRID (40% Left Credentials & Education / 60% Right Narrative) */}
              <div className="flex-1 flex min-h-0">
                {/* LEFT COLUMN: Education (Structured Table), Core Skills, Certifications, Languages, Profile */}
                <div
                  className="w-[40%] bg-slate-50/45 border-r border-slate-200/80 p-3 space-y-3 shrink-0 flex flex-col justify-start"
                  style={{
                    paddingLeft: `${Math.max(8, effectivePagePadding)}px`,
                    paddingRight: `${Math.max(8, effectivePagePadding)}px`,
                    paddingTop: `${Math.max(8, effectiveElementSpacing)}px`,
                  }}
                >
                  {/* Education (Structured Table Format as requested) */}
                  {eduSec.visible && eduList.length > 0 && (
                    <div>
                      {renderSectionBadge(eduSec.label, GraduationCap)}
                      <table
                        className="w-full border-collapse border border-slate-300 text-left bg-white leading-tight"
                        style={{ fontSize: `${Math.max(8.5, bodyTextSize - 1.5)}px` }}
                      >
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-300">
                            <th className="border border-slate-300 py-1 px-1.5 text-left">Exam / Degree</th>
                            <th className="border border-slate-300 py-1 px-1.5 text-left">Board / University</th>
                            <th className="border border-slate-300 py-1 px-1 text-center w-11">Year</th>
                            <th className="border border-slate-300 py-1 px-1 text-center w-14">Marks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eduList.map((edu, idx) => (
                            <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                              <td className="border border-slate-300 py-1 px-1.5 font-bold text-slate-900 break-words leading-tight">
                                {edu.examName || '—'}
                              </td>
                              <td className="border border-slate-300 py-1 px-1.5 text-slate-700 break-words leading-tight">
                                {edu.boardUniversity || '—'}
                              </td>
                              <td className="border border-slate-300 py-1 px-1 text-center font-mono text-slate-700 whitespace-nowrap">
                                {edu.passingYear || '—'}
                              </td>
                              <td className="border border-slate-300 py-1 px-1 text-center font-semibold text-slate-900 whitespace-nowrap">
                                {edu.percentage ? `${edu.percentage}%` : (edu.gradeOrCgpa || (edu as any).resultOrGpa || '—')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Core Technical Skills (Placed on Left Side as requested) */}
                  {skillsSec.visible && data.keySkills && data.keySkills.filter(Boolean).length > 0 && (
                    <div>
                      {renderSectionBadge(skillsSec.label, Award)}
                      <div className="space-y-1.5">
                        {data.keySkills.filter(Boolean).map((skill, idx) => {
                          const colonIdx = skill.indexOf(':');
                          let label = '';
                          let desc = '';
                          if (colonIdx !== -1) {
                            label = skill.slice(0, colonIdx).trim();
                            desc = skill.slice(colonIdx + 1).trim();
                          } else {
                            desc = skill.trim();
                          }

                          return (
                            <div
                              key={idx}
                              className="bg-white px-2 py-1.5 border border-slate-200/90 rounded shadow-2xs text-[10.5px] leading-tight"
                            >
                              {label ? (
                                <div>
                                  <span className="font-bold block" style={{ color: primaryColor }}>
                                    {label}
                                  </span>
                                  <span className="text-slate-700 font-normal text-[9.5px]">
                                    {desc}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                                  <span className="font-medium text-slate-800">{desc}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Certifications / Licence */}
                  {certSec.visible && data.certifications && data.certifications.filter((x) => x.title && x.title.trim() !== '').length > 0 && (
                    <div>
                      {renderSectionBadge(certSec.label, FileCheck)}
                      <div className="space-y-1.5">
                        {data.certifications
                          .filter((x) => x.title && x.title.trim() !== '')
                          .map((cert, idx) => (
                            <div key={idx} className="bg-white p-2 border border-slate-200/80 rounded shadow-2xs leading-snug">
                              <div className="font-bold text-slate-900 text-[10px]">{cert.title}</div>
                              {(cert.issuer || cert.year) && (
                                <div className="text-slate-500 text-[9px] mt-0.5">
                                  {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Languages Known */}
                  {languageList.length > 0 && (
                    <div>
                      {renderSectionBadge(getSecInfo('languages', 'Languages').label, Languages)}
                      <div className="flex flex-wrap gap-1.5">
                        {languageList.map((lang, idx) => (
                          <span
                            key={idx}
                            className="bg-white px-2 py-0.5 border border-slate-200 text-slate-700 font-medium text-[9px] rounded-full shadow-2xs"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Profile Details (Only if personalDetails section is visible) */}
                  {personalSec.visible && personalItems.length > 0 && (
                    <div>
                      {renderSectionBadge(personalSec.label, UserCheck)}
                      <div className="bg-white p-2 border border-slate-200/80 rounded shadow-2xs space-y-1 text-[9.5px]">
                        {personalItems.map((item, idx) => {
                          const trimmedLabel = item.label ? item.label.trim().replace(/[:\s]+$/, '') : '';
                          return (
                            <div key={idx} className="flex items-baseline justify-between gap-1 leading-snug">
                              <span className="font-semibold text-slate-600 shrink-0">{trimmedLabel}:</span>
                              <span className="text-slate-900 font-medium truncate text-right">{item.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Experience, Summary, Projects, Achievements, References */}
                <div
                  className="flex-1 p-3.5 space-y-3 bg-white flex flex-col justify-start"
                  style={{
                    paddingLeft: `${Math.max(10, effectivePagePadding)}px`,
                    paddingRight: `${Math.max(10, effectivePagePadding)}px`,
                    paddingTop: `${Math.max(8, effectiveElementSpacing)}px`,
                  }}
                >
                  {/* Executive Summary / Career Objective */}
                  {objSec.visible && data.careerObjective && (
                    <div>
                      {renderSectionBadge(objSec.label, Briefcase)}
                      <div
                        className="p-2.5 bg-slate-50/60 border-l-3 shadow-2xs text-slate-700 leading-relaxed rounded-r"
                        style={{ borderLeftColor: primaryColor }}
                      >
                        <p className="whitespace-pre-wrap break-words text-[95%]">
                          {data.careerObjective}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Professional Experience */}
                  {workSec.visible && showWorkExp && (
                    <div>
                      {renderSectionBadge(workSec.label, Building2)}
                      <div className="border-l-2 pl-3 space-y-2.5 relative ml-1.5" style={{ borderColor: `${primaryColor}28` }}>
                        {expList.length > 0 ? (
                          expList.map((exp, idx) => {
                            const title = exp.jobTitle || (exp as any).designation || 'Position';
                            const company = exp.companyName || (exp as any).organization;
                            const duration = exp.duration;
                            const location = exp.location;
                            const highlights =
                              exp.highlights && exp.highlights.filter(Boolean).length > 0
                                ? exp.highlights.filter(Boolean)
                                : (exp as any).description
                                ? [(exp as any).description]
                                : [];

                            return (
                              <div key={exp.id || idx} className="relative group">
                                <div
                                  className="absolute -left-[17px] top-1 w-2 h-2 rounded-full ring-2 ring-white"
                                  style={{ backgroundColor: primaryColor }}
                                />
                                <div className="flex items-baseline justify-between gap-2 font-bold text-slate-900 leading-snug">
                                  <div>
                                    <span className="font-extrabold text-slate-950 text-[103%]">{title}</span>
                                    {company && (
                                      <span className="font-semibold text-slate-700">
                                        {' '}— {company}
                                        {location && <span className="font-normal text-slate-500 text-[90%]"> ({location})</span>}
                                      </span>
                                    )}
                                  </div>
                                  {duration && (
                                    <span className="text-[9.5px] font-mono text-slate-600 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 shrink-0 select-none">
                                      {duration}
                                    </span>
                                  )}
                                </div>

                                {highlights.length > 0 && (
                                  <ul
                                    className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700"
                                    style={{ fontSize: `${Math.max(9.5, bodyTextSize - 0.5)}px` }}
                                  >
                                    {highlights.map((h, hIdx) => (
                                      <li key={hIdx} className="leading-snug">
                                        {h}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="relative">
                            <div
                              className="absolute -left-[17px] top-1 w-2 h-2 rounded-full ring-2 ring-white"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>Senior Executive / Specialist</span>
                              <span className="text-slate-500 font-mono text-[9.5px] bg-slate-100 px-1.5 py-0.5 rounded">2022 - Present</span>
                            </div>
                            <div className="text-slate-600 font-semibold text-[95%]">Enterprise Corp • Kolkata</div>
                            <p className="text-slate-600 text-xs leading-snug mt-1">
                              • Directed cross-functional initiatives delivering high operational impact.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Projects */}
                  {projSec.visible && data.projects && data.projects.filter((x) => x.title).length > 0 && (
                    <div>
                      {renderSectionBadge(projSec.label, FolderGit2)}
                      <div className="space-y-2">
                        {data.projects
                          .filter((x) => x.title)
                          .map((proj, idx) => (
                            <div key={idx} className="p-2 bg-slate-50/60 border border-slate-200 rounded">
                              <div className="font-bold text-slate-900 text-[100%]">{proj.title}</div>
                              {proj.description && (
                                <p className="text-slate-600 text-[92%] leading-snug mt-0.5 whitespace-pre-wrap">
                                  {proj.description}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Key Achievements & Honors (Extra Qualifications) */}
                  {extraSec.visible && data.extraQualifications && data.extraQualifications.filter(Boolean).length > 0 && (
                    <div>
                      {renderSectionBadge(extraSec.label, Star)}
                      <div className="space-y-1">
                        {data.extraQualifications.filter(Boolean).map((eq, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-slate-700 text-[95%] leading-snug">
                            <span className="font-bold" style={{ color: primaryColor }}>•</span>
                            <span>{eq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Sections */}
                  {data.customSections &&
                    data.customSections
                      .filter((cs) => {
                        const secInfo = getSecInfo(cs.id ? `custom_${cs.id}` : 'customSections', cs.title);
                        return secInfo.visible && cs.title && cs.content;
                      })
                      .map((cs, idx) => {
                        const secInfo = getSecInfo(cs.id ? `custom_${cs.id}` : 'customSections', cs.title);
                        return (
                          <div key={idx}>
                            {renderSectionBadge(secInfo.label, FileCheck)}
                            <p className="text-slate-700 leading-snug whitespace-pre-wrap break-words pl-1 text-[95%]">
                              {cs.content}
                            </p>
                          </div>
                        );
                      })}

                  {/* References */}
                  {refSec.visible && data.references && data.references.filter((x) => x.name).length > 0 && (
                    <div>
                      {renderSectionBadge(refSec.label, User)}
                      <div className="grid grid-cols-2 gap-2 pl-1 text-slate-700">
                        {data.references
                          .filter((x) => x.name)
                          .map((ref, idx) => (
                            <div key={idx} className="p-1.5 border border-slate-200 rounded bg-slate-50/40">
                              <div className="font-bold text-slate-900 text-[10px]">{ref.name}</div>
                              {ref.designation && (
                                <div className="text-slate-600 text-[9px]">
                                  {ref.designation} {ref.organization ? `, ${ref.organization}` : ''}
                                </div>
                              )}
                              {ref.phone && <div className="text-slate-500 text-[9px]">Ph: {ref.phone}</div>}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. CLEAN DECLARATION FOOTER */}
            <div className="px-6 py-2 mt-auto shrink-0 border-t border-slate-200/80 bg-slate-50/30">
              {renderDeclarationFooter()}
            </div>
          </div>
        );
      })()}

      {/* TEMPLATE 5: Symmetric V-Crest (Full-Fit Crest Header & Full-Width Content) */}
      {templateId === 5 && (
        <div key="template-5" className="w-full h-full min-h-full flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start">
            <div
              className="text-white"
              style={getFullBleedHeaderStyle({
                clipPath: 'polygon(0 0, 100% 0, 100% 82%, 50% 100%, 0 82%)',
                paddingBottom: `${Math.max(10, Math.round(effectiveElementSpacing * 1.1))}px`,
              })}
            >
              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <div style={headerTitleStyle}>
                    <h1 className="font-extrabold uppercase tracking-widest text-white whitespace-pre-wrap break-words" style={{ fontSize: `${headerTitleSize + 4}px`, color: customHeaderColor || undefined }}>
                      {data.docType || 'CURRICULUM VITAE'}
                    </h1>
                  </div>
                  <div style={candidateNameStyle}>
                    <h2 className="tracking-tight font-bold uppercase mt-0.5 text-amber-300 whitespace-pre-wrap break-words" style={{ fontSize: `${headerSubtitleSize + 2}px`, color: customTitleColor || undefined }}>
                      {data.fullName || 'YOUR FULL NAME'}
                    </h2>
                    {data.taglineOrRole && (
                      <p className="tracking-tight font-medium text-white/90 text-[90%] whitespace-pre-wrap break-words" style={{ color: customSubtitleColor || undefined }}>
                        {data.taglineOrRole}
                      </p>
                    )}
                  </div>
                  {renderContactInfo('text-white/95', 'text-white/80')}
                </div>
                {renderPhotoBox()}
              </div>
            </div>
            <div className="flex-1">{renderOrderedSections()}</div>
          </div>
          <div className="mt-auto shrink-0">{renderDeclarationFooter()}</div>
        </div>
      )}

      {/* TEMPLATE 6: Geometric Dual-Frame (Matching user reference photo 03fdc05285235f8f34013c4909923263.jpg) */}
      {templateId === 6 && (
        <div key="template-6" className="w-full h-full min-h-full flex-1 flex flex-col justify-between relative bg-white overflow-hidden p-0">
          {/* SVG Geometric Dual-Frame & Corner Accents (Matching user uploaded image) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 800 1130"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Border Line (Perimeter at 20px) */}
            <path
              d="M 20 36 A 14 14 0 0 1 36 20 L 710 20 L 780 90 L 780 1096 A 14 14 0 0 1 766 1110 L 90 1110 L 20 1040 Z"
              stroke={theme.secondary || theme.primary}
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Inner Border Line (Perimeter at 32px) */}
            <path
              d="M 32 44 A 8 8 0 0 1 44 32 L 704 32 L 768 96 L 768 1088 A 8 8 0 0 1 758 1098 L 96 1098 L 32 1034 Z"
              stroke={theme.secondary || theme.primary}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* Top-Right Corner Accent Block (Between outer & inner chamfers) */}
            <path
              d="M 768 180 L 780 168 L 780 90 L 710 20 L 684 20 L 696 32 L 704 32 L 768 96 Z"
              fill={theme.primary}
            />

            {/* Top-Right Floating Top Bar */}
            <polygon
              points="570,12 580,6 740,6 750,12"
              fill={theme.primary}
            />

            {/* Top-Right Floating Right Bar */}
            <polygon
              points="786,40 792,34 792,150 786,156"
              fill={theme.primary}
            />

            {/* Bottom-Left Corner Accent Block (Between outer & inner chamfers) */}
            <path
              d="M 32 950 L 20 962 L 20 1040 L 90 1110 L 116 1110 L 104 1098 L 96 1098 L 32 1034 Z"
              fill={theme.primary}
            />

            {/* Bottom-Left Floating Bottom Bar */}
            <polygon
              points="50,1118 60,1124 220,1124 230,1118"
              fill={theme.primary}
            />

            {/* Bottom-Left Floating Left Bar */}
            <polygon
              points="8,974 14,968 14,1084 8,1090"
              fill={theme.primary}
            />
          </svg>

          {/* Safe Inner Content Container - Safely recessed inside the inner border line */}
          <div
            className="flex-1 flex flex-col justify-start relative z-10"
            style={{
              paddingTop: `${24 + effectivePagePadding}px`,
              paddingBottom: `${24 + effectivePagePadding}px`,
              paddingLeft: `${32 + effectivePagePadding}px`,
              paddingRight: `${32 + effectivePagePadding}px`,
            }}
          >
            {/* Header: Candidate Details & Photo */}
            <div
              className="flex items-start justify-between gap-4 border-b-2"
              style={{
                borderColor: theme.secondary || theme.primary,
                marginBottom: `${effectiveElementSpacing + 4}px`,
                paddingBottom: `${Math.max(10, Math.round(effectiveElementSpacing * 0.65))}px`,
              }}
            >
              <div className="flex-1 min-w-0 pr-2">
                <div style={headerTitleStyle}>
                  <h1
                    className="font-extrabold uppercase tracking-widest whitespace-pre-wrap break-words"
                    style={{
                      fontSize: `${headerTitleSize + 4}px`,
                      color: customHeaderColor || theme.headingColor || theme.primary,
                      lineHeight: 1.15,
                    }}
                  >
                    {data.docType || 'CURRICULUM VITAE'}
                  </h1>
                </div>

                <div style={candidateNameStyle}>
                  <h2
                    className="font-black uppercase tracking-tight text-slate-900 mt-1 whitespace-pre-wrap break-words"
                    style={{
                      fontSize: `${headerSubtitleSize + 3}px`,
                      color: customTitleColor || theme.primary,
                      lineHeight: 1.2,
                    }}
                  >
                    {data.fullName || 'YOUR FULL NAME'}
                  </h2>
                  {data.taglineOrRole && (
                    <p
                      className="font-semibold text-xs mt-1 whitespace-pre-wrap break-words"
                      style={{ color: customSubtitleColor || theme.secondary || theme.accent }}
                    >
                      {data.taglineOrRole}
                    </p>
                  )}
                </div>

                <div className="mt-1.5">
                  {renderContactInfo('text-slate-800 font-semibold', 'text-slate-700')}
                </div>
              </div>

              {/* Profile Photo with matching frame border */}
              <div className="shrink-0 relative z-10 pt-1 pr-2">
                {renderPhotoBox('shadow-sm', theme.primary)}
              </div>
            </div>

            {/* Ordered Content Sections */}
            <div className="flex-1 relative z-10">
              {renderOrderedSections()}
            </div>

            {/* Bottom Footer: Date, Place & Signature with ample clearance from bottom-left corner */}
            <div className="mt-auto shrink-0 relative z-10 w-full pt-1">
              <div
                className="border-t border-slate-300 shrink-0 mt-auto w-full"
                style={{
                  marginTop: 'auto',
                  paddingTop: `${Math.max(8, Math.round(effectiveElementSpacing * 0.55))}px`,
                  paddingBottom: '0px',
                }}
              >
                {data.declaration && (
                  <p className="text-slate-600 italic text-[90%] mb-1.5 leading-snug break-words whitespace-pre-wrap">
                    {data.declaration}
                  </p>
                )}
                <div className="flex justify-between items-end text-slate-800">
                  <div className="space-y-1 pl-8 sm:pl-10">
                    <p>
                      <span className="font-bold text-slate-900">Date :</span> {data.date || '_____________'}
                    </p>
                    <p>
                      <span className="font-bold text-slate-900">Place :</span> {data.place || '_____________'}
                    </p>
                  </div>
                  <div className="text-right min-w-[160px] flex flex-col items-end gap-1 pr-4 sm:pr-6">
                    <p className="font-semibold text-slate-900">
                      <span className="font-bold">Signature :</span> ___________________
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 7: Navy Technical Pro (Tailored to Technical & Electrician CV Reference Format) */}
      {templateId === 7 && (() => {
        const primaryColor = theme.primary || '#0b2545';
        const accentColor = theme.accent || '#f59e0b';

        const renderT7SectionHeader = (title: string) => (
          <div
            className="flex items-center text-white font-bold uppercase tracking-wider rounded-xs select-none"
            style={{
              backgroundColor: primaryColor,
              fontSize: `${effectiveSectionHeaderSize}px`,
              paddingTop: `${Math.max(2.5, Math.min(5, effectiveElementSpacing * 0.28))}px`,
              paddingBottom: `${Math.max(2.5, Math.min(5, effectiveElementSpacing * 0.28))}px`,
              paddingLeft: '10px',
              paddingRight: '10px',
              marginBottom: `${Math.max(2.5, Math.min(6, effectiveElementSpacing * 0.35))}px`,
              borderLeft: `4px solid ${accentColor}`,
            }}
          >
            <span>{uppercaseHeaders ? title.toUpperCase() : title}</span>
          </div>
        );

        // 1. Career Objective
        const renderCareerObjective = () => {
          if (!data.careerObjective) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'careerObjective');
          const title = sec?.label || 'Career Objective';
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <p
                className="text-slate-800 leading-snug break-words whitespace-pre-wrap pl-1"
                style={{ fontSize: `${bodyTextSize}px` }}
              >
                {data.careerObjective}
              </p>
            </div>
          );
        };

        // 2. Educational Qualification (Structured Table)
        const renderEducation = () => {
          const list = (data.education || []).filter((x) => x.examName || x.boardUniversity);
          if (list.length === 0) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'education');
          const title = sec?.label || 'Educational Qualification';
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <table
                className="w-full border-collapse border border-slate-300 text-left"
                style={{ fontSize: `${bodyTextSize}px` }}
              >
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-300">
                    <th className="border border-slate-300 py-1 px-2 text-left">Exam / Degree</th>
                    <th className="border border-slate-300 py-1 px-2 text-left">Board / University</th>
                    <th className="border border-slate-300 py-1 px-2 text-center w-20">Year</th>
                    <th className="border border-slate-300 py-1 px-2 text-center w-24">Marks / Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((edu, idx) => (
                    <tr key={edu.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="border border-slate-300 py-1 px-2 font-semibold text-slate-900 break-words">
                        {edu.examName || '—'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-slate-800 break-words">
                        {edu.boardUniversity || '—'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-center text-slate-800 whitespace-nowrap">
                        {edu.passingYear || '—'}
                      </td>
                      <td className="border border-slate-300 py-1 px-2 text-center font-medium text-slate-900 whitespace-nowrap">
                        {edu.percentage ? `${edu.percentage}%` : edu.gradeOrCgpa || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        };

        // 3. Work Experience (Designation, Company, Details with Individual Bullets)
        const renderWorkExperience = () => {
          const list = (data.workExperience || []).filter((x) => x.jobTitle || x.companyName);
          if (list.length === 0) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'workExperience');
          const title = sec?.label || 'Work Experience';
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <div className="space-y-2 pl-1" style={{ fontSize: `${bodyTextSize}px` }}>
                {list.map((exp, idx) => {
                  const highlights = exp.highlights && exp.highlights.filter(Boolean).length > 0
                    ? exp.highlights.filter(Boolean)
                    : [];

                  return (
                    <div key={exp.id || idx}>
                      <div className="flex justify-between items-baseline flex-wrap gap-1 leading-snug">
                        <div>
                          <span className="font-extrabold text-slate-950 text-[102%]">
                            {exp.jobTitle || 'Position'}
                          </span>
                          {exp.companyName && (
                            <span className="font-bold text-slate-800"> — {exp.companyName}</span>
                          )}
                        </div>
                        <div className="text-[92%] font-semibold text-slate-600">
                          {exp.duration && <span>{exp.duration}</span>}
                          {exp.location && <span> | {exp.location}</span>}
                        </div>
                      </div>
                      {highlights.length > 0 && (
                        <div className="mt-0.5 space-y-0.5 pl-3">
                          {highlights.map((h, hIdx) => (
                            <div key={hIdx} className="flex items-start gap-1.5 leading-snug text-slate-700">
                              <span
                                className="font-black select-none text-[115%] leading-none mt-0.5"
                                style={{ color: primaryColor }}
                              >
                                •
                              </span>
                              <span className="break-words">{h}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        };

        // 4. Technical Skills
        const renderKeySkills = () => {
          const list = (data.keySkills || []).filter(Boolean);
          if (list.length === 0) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'keySkills');
          const title = sec?.label || 'Technical Skills';
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <div className="space-y-0.5 pl-1" style={{ fontSize: `${personalContactSize}px` }}>
                {list.map((skill, idx) => {
                  const colonIdx = skill.indexOf(':');
                  let label = '';
                  let desc = '';
                  if (colonIdx !== -1) {
                    label = skill.slice(0, colonIdx).trim();
                    desc = skill.slice(colonIdx + 1).trim();
                  } else {
                    desc = skill.trim();
                  }
                  return (
                    <div key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span
                        className="font-black select-none text-[115%] leading-none mt-0.5"
                        style={{ color: primaryColor }}
                      >
                        •
                      </span>
                      <div className="flex-1 min-w-0">
                        {label && <span className="font-bold text-slate-900 mr-1.5">{label}:</span>}
                        <span className="text-slate-800">{desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        };

        // 5. Additional Skills (Extra Qualifications)
        const renderExtraQualifications = () => {
          const list = (data.extraQualifications || []).filter(Boolean);
          if (list.length === 0) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'extraQualifications');
          const title = sec?.label || 'Additional Skills';
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <div className="space-y-0.5 pl-1 text-slate-800" style={{ fontSize: `${personalContactSize}px` }}>
                {list.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 leading-snug">
                    <span
                      className="font-black select-none text-[115%] leading-none mt-0.5"
                      style={{ color: primaryColor }}
                    >
                      •
                    </span>
                    <span className="break-words">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        };

        // 6. Certification / License
        const renderCertifications = () => {
          const list = (data.certifications || []).filter((x) => x.title);
          if (list.length === 0) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'certifications');
          const title = sec?.label || 'Certification / License';
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <div className="space-y-0.5 pl-1" style={{ fontSize: `${personalContactSize}px` }}>
                {list.map((c, idx) => (
                  <div key={c.id || idx} className="flex items-start gap-1.5 leading-snug">
                    <span
                      className="font-black select-none text-[115%] leading-none mt-0.5"
                      style={{ color: primaryColor }}
                    >
                      •
                    </span>
                    <div>
                      <span className="font-bold text-slate-950">{c.title}</span>
                      {(c.issuer || c.year) && (
                        <span className="text-slate-700"> — {c.issuer} {c.year ? `(${c.year})` : ''}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        };

        // 7. Personal Details (2-Column Aligned Table Grid)
        const renderPersonalDetails = () => {
          const items = (data.personalDetails || []).filter(
            (x) => x.value !== undefined && x.value !== null && x.value !== ''
          );
          if (items.length === 0) return null;
          const sec = data.sectionsOrder?.find((s) => s.key === 'personalDetails');
          const title = sec?.label || 'Personal Details';

          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader(title)}
              <div className="pl-1 w-full">
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 items-start w-full"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    columnGap: '28px',
                    rowGap: `${Math.max(2, Math.min(5, effectiveElementSpacing * 0.25))}px`,
                  }}
                >
                  {items.map((it, idx) => {
                    const trimmedLabel = (it.label || '').replace(/[:\s]+$/, '');
                    return (
                      <div
                        key={it.id || idx}
                        className="flex items-baseline leading-snug min-w-0"
                        style={{ fontSize: `${personalContactSize}px` }}
                      >
                        <span className="w-28 sm:w-32 shrink-0 font-bold text-slate-950">
                          {trimmedLabel}
                        </span>
                        <span className="w-3 shrink-0 font-bold text-slate-600 text-center select-none mr-1.5">:</span>
                        <span className="flex-1 min-w-0 font-medium text-slate-800 break-words">
                          {it.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        };

        // 8. Projects
        const renderProjects = () => {
          const list = (data.projects || []).filter((x) => x.title);
          if (list.length === 0) return null;
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader('Projects')}
              <div className="space-y-1 pl-1" style={{ fontSize: `${bodyTextSize}px` }}>
                {list.map((pr, idx) => (
                  <div key={pr.id || idx}>
                    <div className="flex justify-between items-baseline font-bold text-slate-900">
                      <span>{pr.title}</span>
                      {pr.technologies && (
                        <span className="text-[85%] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {pr.technologies}
                        </span>
                      )}
                    </div>
                    {pr.description && <p className="text-slate-700 leading-snug whitespace-pre-wrap">{pr.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        };

        // 9. Family Details (if in biodata mode)
        const renderFamilyDetails = () => {
          const items = (data.familyDetails || []).filter(
            (x) => x.value !== undefined && x.value !== null && x.value !== ''
          );
          if (items.length === 0) return null;
          return (
            <div style={{ marginBottom: `${effectiveElementSpacing}px` }}>
              {renderT7SectionHeader('Family Background')}
              <div className="space-y-1 pl-1" style={{ fontSize: `${personalContactSize}px` }}>
                {items.map((it, idx) => {
                  const trimmedLabel = (it.label || '').replace(/[:\s]+$/, '');
                  return (
                    <div key={it.id || idx} className="flex items-baseline leading-snug">
                      <span className="w-28 sm:w-32 shrink-0 font-bold text-slate-950">{trimmedLabel}</span>
                      <span className="w-3 shrink-0 font-bold text-slate-600 text-center select-none mr-1.5">:</span>
                      <span className="flex-1 min-w-0 font-medium text-slate-800">{it.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        };

        // 10. Declaration & Signature Footer
        const renderFooter = () => (
          <div
            className="border-t border-slate-300 shrink-0 mt-auto w-full pl-1"
            style={{
              paddingTop: `${Math.max(6, Math.round(effectiveElementSpacing * 0.5))}px`,
              paddingBottom: '0px',
            }}
          >
            {data.declaration && (
              <p className="text-slate-700 italic text-[90%] mb-1.5 leading-snug break-words whitespace-pre-wrap">
                {data.declaration}
              </p>
            )}
            <div className="flex justify-between items-end text-slate-800" style={{ fontSize: `${personalContactSize}px` }}>
              <div className="space-y-1">
                <p>
                  <span className="font-bold text-slate-950">Date :</span> {data.date || '_____________'}
                </p>
                <p>
                  <span className="font-bold text-slate-950">Place :</span> {data.place || '_____________'}
                </p>
              </div>
              <div className="text-right min-w-[160px] flex flex-col items-end gap-1">
                <p className="font-semibold text-slate-900">
                  <span className="font-bold">Signature :</span> ___________________
                </p>
              </div>
            </div>
          </div>
        );

        const sectionMap: Record<string, () => React.ReactNode> = {
          careerObjective: renderCareerObjective,
          education: renderEducation,
          workExperience: renderWorkExperience,
          keySkills: renderKeySkills,
          extraQualifications: renderExtraQualifications,
          certifications: renderCertifications,
          personalDetails: renderPersonalDetails,
          projects: renderProjects,
          familyDetails: renderFamilyDetails,
        };

        const renderSections = () => {
          if (!data.sectionsOrder || data.sectionsOrder.length === 0) {
            return (
              <>
                {renderCareerObjective()}
                {renderEducation()}
                {renderWorkExperience()}
                {renderKeySkills()}
                {renderExtraQualifications()}
                {renderCertifications()}
                {renderPersonalDetails()}
              </>
            );
          }

          return (
            <>
              {data.sectionsOrder
                .filter((s) => s.visible && s.key !== 'declaration')
                .map((sec) => {
                  const renderer = sectionMap[sec.key];
                  if (renderer) return <React.Fragment key={sec.id || sec.key}>{renderer()}</React.Fragment>;
                  if (sec.key === 'customSections' || sec.key.startsWith('custom_')) {
                    return <React.Fragment key={sec.id || sec.key}>{renderCustomSections()}</React.Fragment>;
                  }
                  if (sec.key === 'references') {
                    return <React.Fragment key={sec.id || sec.key}>{renderReferences()}</React.Fragment>;
                  }
                  return null;
                })}
            </>
          );
        };

        return (
          <div key="template-7" className="w-full h-full min-h-full flex-1 flex flex-col justify-between bg-white">
            <div className="flex-1 flex flex-col justify-start">
              {/* TOP NAVY HEADER BANNER */}
              <div
                className="w-full text-white shadow-xs border-b-2"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: accentColor,
                  paddingTop: `${Math.max(10, Math.round(effectivePagePadding * 0.7))}px`,
                  paddingBottom: `${Math.max(10, Math.round(effectivePagePadding * 0.7))}px`,
                  paddingLeft: `${effectivePagePadding}px`,
                  paddingRight: `${effectivePagePadding}px`,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div style={headerTitleStyle}>
                      <div
                        className="font-black uppercase tracking-widest mb-0.5 whitespace-pre-wrap break-words"
                        style={{
                          fontSize: `${headerTitleSize}px`,
                          color: customHeaderColor || accentColor,
                          letterSpacing: '0.12em',
                        }}
                      >
                        {data.docType || 'CURRICULUM VITAE'}
                      </div>
                    </div>
                    <div style={candidateNameStyle}>
                      <h1
                        className="font-black uppercase tracking-tight text-white leading-none whitespace-pre-wrap break-words"
                        style={{
                          fontSize: `${headerSubtitleSize + 6}px`,
                          color: customTitleColor || '#ffffff',
                        }}
                      >
                        {data.fullName || 'RAHUL KUMAR'}
                      </h1>
                      {data.taglineOrRole && (
                        <p
                          className="font-bold tracking-wide mt-1 whitespace-pre-wrap break-words uppercase"
                          style={{
                            fontSize: `${headerSubtitleSize}px`,
                            color: customSubtitleColor || accentColor,
                          }}
                        >
                          {data.taglineOrRole}
                        </p>
                      )}
                    </div>
                    {renderContactInfo('text-slate-100 font-medium', 'text-slate-200')}
                  </div>
                  {/* Top-Right Profile Photo */}
                  <div className="shrink-0">
                    {renderPhotoBox('shadow-md border-2 border-white rounded-xs overflow-hidden', '#ffffff')}
                  </div>
                </div>
              </div>

              {/* BODY SECTIONS CONTAINER */}
              <div
                className="flex-1 flex flex-col justify-between"
                style={{
                  paddingTop: `${Math.max(6, Math.round(effectiveElementSpacing * 0.8))}px`,
                  paddingBottom: `${Math.max(8, Math.round(effectivePagePadding * 0.65))}px`,
                  paddingLeft: `${effectivePagePadding}px`,
                  paddingRight: `${effectivePagePadding}px`,
                }}
              >
                <div className="flex-1">{renderSections()}</div>
              </div>
            </div>

            {/* DECLARATION & SIGNATURE FOOTER */}
            <div
              style={{
                paddingLeft: `${effectivePagePadding}px`,
                paddingRight: `${effectivePagePadding}px`,
                paddingBottom: `${Math.max(8, Math.round(effectivePagePadding * 0.65))}px`,
              }}
            >
              {renderFooter()}
            </div>
          </div>
        );
      })()}

      {/* TEMPLATE 8: Swiss Monospace Classic */}
      {templateId === 8 && (
        <div key="template-8" className="w-full h-full min-h-full flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start">
            <div
              className="border-b-2 flex items-center justify-between gap-4"
              style={{ borderColor: theme.primary, paddingBottom: `${effectiveElementSpacing}px`, marginBottom: `${effectiveElementSpacing}px` }}
            >
              <div className="flex-1 min-w-0">
                <div style={headerTitleStyle}>
                  <h1 className="font-black uppercase tracking-widest text-slate-900 whitespace-pre-wrap break-words" style={{ color: customHeaderColor || theme.primary, fontSize: `${headerTitleSize + 4}px` }}>
                    {data.docType || 'CURRICULUM VITAE'}
                  </h1>
                </div>
                <div style={candidateNameStyle}>
                  <h2 className="uppercase font-extrabold text-slate-800 mt-0.5 whitespace-pre-wrap break-words" style={{ fontSize: `${headerSubtitleSize + 2}px`, color: customTitleColor || undefined }}>
                    {data.fullName || 'YOUR FULL NAME'}
                  </h2>
                  {data.taglineOrRole && (
                    <p className="uppercase font-bold text-slate-600 text-[90%] whitespace-pre-wrap break-words" style={{ color: customSubtitleColor || undefined }}>
                      {data.taglineOrRole}
                    </p>
                  )}
                </div>
                {renderContactInfo('text-slate-600 font-mono', 'text-slate-500 font-mono')}
              </div>
              {renderPhotoBox()}
            </div>
            <div className="flex-1">{renderOrderedSections()}</div>
          </div>
          <div className="mt-auto shrink-0">{renderDeclarationFooter()}</div>
        </div>
      )}

      {/* TEMPLATE 9: Classic Serif Executive CV / Bio-Data (Full-Fit Double Border) */}
      {templateId === 9 && (
        <div
          key="template-9"
          className="w-full h-full min-h-full flex-1 flex flex-col justify-between p-2"
          style={{
            borderColor: theme.primary,
            borderWidth: '6px',
            borderStyle: 'double',
          }}
        >
          <div className="flex-1 flex flex-col justify-start">
            <div
              className="border-b-2 flex items-center justify-between gap-4 pb-2"
              style={{
                borderColor: theme.primary,
                paddingBottom: `${effectiveElementSpacing}px`,
                marginBottom: `${effectiveElementSpacing}px`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div style={headerTitleStyle}>
                  <h1 className="font-serif font-black uppercase text-slate-900 tracking-wider whitespace-pre-wrap break-words" style={{ color: customHeaderColor || theme.primary, fontSize: `${headerTitleSize + 6}px` }}>
                    {data.docType || 'CURRICULUM VITAE'}
                  </h1>
                </div>
                <div style={candidateNameStyle}>
                  <h2 className="font-serif font-bold uppercase text-slate-900 mt-1 whitespace-pre-wrap break-words" style={{ fontSize: `${headerSubtitleSize + 4}px`, color: customTitleColor || undefined }}>
                    {data.fullName || 'YOUR FULL NAME'}
                  </h2>
                  {data.taglineOrRole && <p className="font-medium italic text-[95%] whitespace-pre-wrap break-words" style={{ color: customSubtitleColor || theme.primary }}>{data.taglineOrRole}</p>}
                </div>
                {renderContactInfo('text-slate-600 font-serif', 'text-slate-500 font-serif')}
              </div>
              {renderPhotoBox()}
            </div>
            <div className="flex-1">{renderOrderedSections()}</div>
          </div>
          <div className="mt-auto shrink-0">{renderDeclarationFooter()}</div>
        </div>
      )}

      {/* TEMPLATE 10: Teal Wave Ribbon & Corner Accents (Matching user uploaded sketch 20261004_110652.jpg) */}
      {templateId === 10 && (
        <div
          key="template-10"
          className="w-full h-full min-h-full flex-1 flex flex-col justify-between relative bg-white overflow-hidden"
          style={{
            padding: `${Math.max(3, Math.round(effectivePagePadding * 0.3))}px`,
          }}
        >
          {/* Double Frame Border */}
          <div
            className="w-full h-full min-h-full flex-1 flex flex-col justify-between relative bg-white overflow-hidden"
            style={{
              border: `1.5px solid ${theme.secondary || theme.primary}`,
              boxShadow: `inset 0 0 0 3px #ffffff, inset 0 0 0 4.5px ${theme.secondary || theme.primary}`,
              paddingTop: `${effectivePagePadding}px`,
              paddingBottom: `${effectivePagePadding}px`,
              paddingLeft: `${effectivePagePadding}px`,
              paddingRight: `${effectivePagePadding}px`,
            }}
          >
            {/* Top-Right Wave Accent */}
            <svg
              className="absolute top-0 right-0 pointer-events-none z-0"
              style={{ width: '200px', height: '140px' }}
              viewBox="0 0 200 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 25,0 C 35,40 55,85 105,85 C 145,85 170,100 200,125 L 200,0 Z"
                fill={theme.secondary || theme.primary}
              />
            </svg>

            {/* Bottom-Left Wave Accent */}
            <svg
              className="absolute bottom-0 left-0 pointer-events-none z-0"
              style={{ width: '180px', height: '125px' }}
              viewBox="0 0 180 125"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 0,15 C 0,55 35,85 75,85 C 115,85 145,105 170,125 L 0,125 Z"
                fill={theme.secondary || theme.primary}
              />
            </svg>

            {/* Content Container */}
            <div className="flex-1 flex flex-col justify-start relative z-10">
              {/* Header Bar: Left details + Right photo over wave */}
              <div
                className="flex items-start justify-between gap-4"
                style={{
                  marginBottom: `${effectiveElementSpacing}px`,
                }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div style={headerTitleStyle}>
                    <h1
                      className="font-extrabold uppercase tracking-wider text-slate-900 whitespace-pre-wrap break-words"
                      style={{
                        fontSize: `${headerTitleSize + 4}px`,
                        color: customHeaderColor || theme.headingColor || theme.primary,
                        lineHeight: 1.15,
                      }}
                    >
                      {data.docType || 'CURRICULUM VITAE'}
                    </h1>
                  </div>

                  <div style={candidateNameStyle}>
                    <h2
                      className="font-black uppercase tracking-tight text-slate-900 mt-1 whitespace-pre-wrap break-words"
                      style={{
                        fontSize: `${headerSubtitleSize + 3}px`,
                        color: customTitleColor || theme.primary,
                        lineHeight: 1.2,
                      }}
                    >
                      {data.fullName || 'YOUR FULL NAME'}
                    </h2>
                    {data.taglineOrRole && (
                      <p
                        className="font-semibold text-xs text-slate-700 mt-0.5 whitespace-pre-wrap break-words"
                        style={{ color: customSubtitleColor || theme.secondary || theme.accent }}
                      >
                        {data.taglineOrRole}
                      </p>
                    )}
                  </div>

                  <div className="mt-1.5">
                    {renderContactInfo('text-slate-800 font-semibold', 'text-slate-700')}
                  </div>
                </div>

                {/* Right Photo Box */}
                <div className="shrink-0 relative z-10 pt-1 pr-1">
                  {renderPhotoBox('shadow-sm', theme.primary)}
                </div>
              </div>

              {/* Ordered Sections */}
              <div className="flex-1 relative z-10">
                {renderOrderedSections()}
              </div>
            </div>

            {/* Bottom Footer: Date, Place & Signature */}
            <div className="mt-auto shrink-0 relative z-10 w-full pt-1">
              {renderDeclarationFooter()}
            </div>
          </div>
        </div>
      )}

      {/* TEMPLATE 11: Nordic Clean Line (Full-Fit Left Border Accent) */}
      {templateId === 11 && (
        <div key="template-11" className="w-full h-full min-h-full flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-start">
            <div
              className="border-l-4 pl-3 flex items-center justify-between gap-4"
              style={{
                borderColor: theme.primary,
                marginBottom: `${effectiveElementSpacing}px`,
                paddingBottom: `${Math.max(2, effectiveElementSpacing * 0.4)}px`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div style={headerTitleStyle}>
                  <h1 className="font-extrabold uppercase tracking-widest text-slate-900 whitespace-pre-wrap break-words" style={{ color: customHeaderColor || theme.primary, fontSize: `${headerTitleSize + 4}px` }}>
                    {data.docType || 'CURRICULUM VITAE'}
                  </h1>
                </div>
                <div style={candidateNameStyle}>
                  <h2 className="uppercase font-bold text-slate-800 tracking-wide mt-0.5 whitespace-pre-wrap break-words" style={{ fontSize: `${headerSubtitleSize + 2}px`, color: customTitleColor || undefined }}>
                    {data.fullName || 'YOUR FULL NAME'}
                  </h2>
                  {data.taglineOrRole && <p className="uppercase font-medium text-slate-600 text-xs whitespace-pre-wrap break-words" style={{ color: customSubtitleColor || undefined }}>{data.taglineOrRole}</p>}
                </div>
                {renderContactInfo('text-slate-500', 'text-slate-500')}
              </div>
              {renderPhotoBox()}
            </div>
            <div className="flex-1">{renderOrderedSections()}</div>
          </div>
          <div className="mt-auto shrink-0">{renderDeclarationFooter()}</div>
        </div>
      )}

      {/* TEMPLATE 12: Executive Navy Sidebar with Timeline Content (Matching user's reference image IMG_20261002_075303) */}
      {templateId === 12 && (() => {
        const sidebarBg = theme.id === 'emerald' ? '#1b4332' : (theme.secondary || '#15324e');
        const accentLineColor = theme.primary || '#1e40af';

        // Personal details excluding language (so language isn't duplicated)
        const personalItems = data.personalDetails
          ? data.personalDetails.filter((x) => x.value !== undefined && x.value !== null && x.value.trim() !== '' && !/language/i.test(x.label))
          : [];
        const displayPersonal = personalItems.length > 0 ? personalItems : [
          { id: '1', label: "Father's Name", value: 'Mr. R. Khan' },
          { id: '2', label: 'Date of Birth', value: '15 Aug 1996' },
          { id: '3', label: 'Nationality', value: 'Indian' },
          { id: '4', label: 'Marital Status', value: 'Single' },
        ];

        // Extract languages if present in personal details
        const languageField = data.personalDetails?.find(
          (x) => /language/i.test(x.label) && x.value && x.value.trim() !== ''
        );
        const languageList = languageField
          ? languageField.value.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
          : (personalItems.length === 0 ? ['English (Fluent)', 'Bengali (Native)', 'Hindi (Spoken)'] : []);

        // Work experience items:
        const expList = (data.workExperience || []).filter(
          (x) => (x.jobTitle && x.jobTitle.trim() !== '') ||
                 (x.companyName && x.companyName.trim() !== '') ||
                 ((x as any).designation && (x as any).designation.trim() !== '') ||
                 ((x as any).organization && (x as any).organization.trim() !== '')
        );
        const workExpSection = data.sectionsOrder?.find((s) => s.key === 'workExperience');
        const workExpTitle = workExpSection?.label || 'WORK EXPERIENCE';
        const showWorkExp = expList.length > 0 || (data.workExperience && data.workExperience.length > 0);

        // Licence Work Permit / Certifications (placed in Right column for Template 12 as per reference image!)
        const certSection = data.sectionsOrder?.find((s) => s.key === 'certifications');
        const certTitle = certSection?.label || 'Licence work permit';
        const certList = (data.certifications || []).filter((x) => x.title && x.title.trim() !== '');

        const hasContact = data.contactNumber || data.email || data.addressOrVillage || data.websiteOrLinkedin;

        return (
          <div key="template-12" className="flex min-h-full h-full relative overflow-hidden bg-white">
            {/* LEFT SIDEBAR (Dark Navy, approx 33% width) */}
            <div
              className="w-[33%] shrink-0 text-white flex flex-col justify-between relative"
              style={{
                backgroundColor: sidebarBg,
                paddingTop: `${effectivePagePadding}px`,
                paddingBottom: `${effectivePagePadding}px`,
                paddingLeft: `${Math.max(8, Math.round(effectivePagePadding * 0.85))}px`,
                paddingRight: `${Math.max(8, Math.round(effectivePagePadding * 0.85))}px`,
                fontSize: `${personalContactSize}px`,
              }}
            >
              {/* Photo Box at Top */}
              <div className="flex justify-center pb-2">
                {renderPhotoBox('shadow-md border-2 border-white rounded-none overflow-hidden mx-auto', '#ffffff')}
              </div>

              {/* Middle Information Blocks: Contact, Personal Details, Languages */}
              <div className="flex-1 flex flex-col justify-around py-3" style={{ gap: `${Math.max(8, Math.min(22, Math.round(effectiveElementSpacing * 1.25)))}px` }}>
                {/* 1. CONTACT Section */}
                {hasContact && (
                  <div>
                    <h3
                      className="font-extrabold text-white uppercase tracking-wider pb-1 border-b border-white/40 mb-2"
                      style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                    >
                      CONTACT
                    </h3>
                    <div className="space-y-2 text-white/90">
                      {data.contactNumber && (
                        <div className="flex items-start gap-2 leading-snug">
                          <Phone className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                          <span className="break-all font-medium">{data.contactNumber}</span>
                        </div>
                      )}
                      {data.email && (
                        <div className="flex items-start gap-2 leading-snug">
                          <Mail className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                          <span className="break-all font-medium">{data.email}</span>
                        </div>
                      )}
                      {data.addressOrVillage && (
                        <div className="flex items-start gap-2 leading-snug">
                          <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                          <span className="whitespace-pre-line break-words leading-tight">{data.addressOrVillage}</span>
                        </div>
                      )}
                      {data.websiteOrLinkedin && (
                        <div className="flex items-start gap-2 leading-snug">
                          <Globe className="w-3.5 h-3.5 text-white/80 shrink-0 mt-0.5" />
                          <span className="break-all text-[85%] text-cyan-200 underline">{data.websiteOrLinkedin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Personal Details Section */}
                {displayPersonal.length > 0 && (
                  <div>
                    <h3
                      className="font-extrabold text-white uppercase tracking-wider pb-1 border-b border-white/40 mb-2"
                      style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                    >
                      Personal details
                    </h3>
                    <div className="space-y-1 text-white/90">
                      {displayPersonal.map((item, idx) => {
                        const trimmedLabel = item.label ? item.label.trim() : '';
                        const formattedLabel = trimmedLabel ? (trimmedLabel.endsWith(':') ? trimmedLabel : `${trimmedLabel}:`) : '';
                        return (
                          <div key={idx} className="flex items-start gap-1.5 leading-snug text-xs">
                            <span className="font-bold text-white shrink-0">•</span>
                            <div className="flex-1 min-w-0 break-words leading-snug">
                              {formattedLabel && (
                                <span className="font-bold text-white inline mr-1">{formattedLabel}</span>
                              )}
                              <span className="text-white/80 font-normal inline break-words">{item.value}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. LANGUAGES Section */}
                {languageList.length > 0 && (
                  <div>
                    <h3
                      className="font-extrabold text-white uppercase tracking-wider pb-1 border-b border-white/40 mb-2"
                      style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                    >
                      LANGUAGES
                    </h3>
                    <div className="space-y-1.5 text-white/90">
                      {languageList.map((lang, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 leading-snug font-medium">
                          <span className="text-white font-bold shrink-0">•</span>
                          <span className="break-words">{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT MAIN CONTENT (approx 67% width) */}
            <div
              className="flex-1 min-w-0 bg-white flex flex-col justify-between relative"
              style={{
                paddingTop: `${effectivePagePadding}px`,
                paddingBottom: `${effectivePagePadding}px`,
                paddingLeft: `${effectivePagePadding}px`,
                paddingRight: `${effectivePagePadding}px`,
              }}
            >
              {/* Top & Timeline Content */}
              <div className="flex-1 flex flex-col justify-between" style={{ gap: `${Math.max(6, Math.min(16, Math.round(effectiveElementSpacing * 0.95)))}px` }}>
                {/* 1. Header Name, Title & Underline Bar */}
                <div>
                  <div style={headerTitleStyle}>
                    <div
                      className="font-black uppercase tracking-widest text-slate-500 mb-0.5 whitespace-pre-wrap break-words text-[10px]"
                      style={{ fontSize: `${Math.max(9, headerTitleSize - 8)}px`, color: customHeaderColor || undefined }}
                    >
                      {data.docType || 'CURRICULUM VITAE'}
                    </div>
                  </div>
                  <div style={candidateNameStyle}>
                    <h1
                      className="font-black uppercase tracking-tight text-slate-900 leading-none whitespace-pre-wrap break-words"
                      style={{ fontSize: `${headerTitleSize + 6}px`, color: customTitleColor || '#0f172a' }}
                    >
                      {data.fullName || 'SAHIB KHAN'}
                    </h1>
                    {data.taglineOrRole && (
                      <p
                        className="font-bold text-slate-600 tracking-wide mt-1 whitespace-pre-wrap break-words"
                        style={{ fontSize: `${headerSubtitleSize}px`, color: customSubtitleColor || '#475569' }}
                      >
                        {data.taglineOrRole}
                      </p>
                    )}
                  </div>
                  {/* Underline accent bar */}
                  <div
                    className="w-14 h-[2.5px] mt-2 mb-2"
                    style={{ backgroundColor: accentLineColor }}
                  />
                </div>

                {/* 2. Career Objective */}
                {data.careerObjective && (
                  <div>
                    <h3
                      className="font-extrabold uppercase text-slate-900 tracking-wider pb-1 border-b border-slate-700 mb-1.5"
                      style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                    >
                      Career Objective
                    </h3>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap break-words text-[95%]">
                      {data.careerObjective}
                    </p>
                  </div>
                )}

                {/* 3. Main Timeline Spine */}
                <div
                  className="relative pl-4 ml-1 border-l-2 border-slate-700 flex-1 flex flex-col justify-around"
                  style={{ gap: `${Math.max(6, Math.min(18, Math.round(effectiveElementSpacing * 1.1)))}px` }}
                >
                  {/* WORK EXPERIENCE */}
                  {showWorkExp && (
                    <div className="relative">
                      {/* Node bullet */}
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-800" />
                      <h3
                        className="font-extrabold uppercase text-slate-900 tracking-wider pb-0.5 border-b border-slate-300 mb-2"
                        style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                      >
                        {workExpTitle}
                      </h3>
                      <div className="flex flex-col" style={{ gap: `${Math.max(4, Math.round(effectiveElementSpacing * 0.65))}px` }}>
                        {expList.length > 0 ? (
                          expList.map((exp, idx) => {
                            const title = exp.jobTitle || (exp as any).designation || 'Position';
                            const company = exp.companyName || (exp as any).organization;
                            const duration = exp.duration;
                            const location = exp.location;
                            const highlights = (exp.highlights && exp.highlights.filter(Boolean).length > 0)
                              ? exp.highlights.filter(Boolean)
                              : [];

                            return (
                              <div key={idx} className="text-slate-700">
                                <div className="flex items-baseline justify-between gap-2 font-bold text-slate-900 leading-snug">
                                  <div>
                                    <span className="font-extrabold text-slate-950 text-[102%]">{title}</span>
                                    {company && (
                                      <span className="font-semibold text-slate-800">
                                        {' '}— {company}
                                        {location && <span className="font-normal text-slate-500 text-[90%]"> ({location})</span>}
                                      </span>
                                    )}
                                  </div>
                                  {duration && (
                                    <span className="text-[92%] font-normal text-slate-600 shrink-0 select-none">
                                      {duration}
                                    </span>
                                  )}
                                </div>
                                {highlights.length > 0 && (
                                  <ul className="list-disc ml-4 mt-1 space-y-0.5 text-slate-700" style={{ fontSize: `${Math.max(10, bodyTextSize - 0.5)}px` }}>
                                    {highlights.map((h, hIdx) => (
                                      <li key={hIdx} className="leading-snug">
                                        {h}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-slate-500 text-xs italic">
                            Work experience entries will be displayed here.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* EDUCATION on Timeline Spine */}
                  {data.education && data.education.filter(x => (x.examName && x.examName.trim() !== '') || (x.boardUniversity && x.boardUniversity.trim() !== '') || (x.passingYear && x.passingYear.trim() !== '')).length > 0 && (
                    <div className="relative">
                      {/* Node bullet */}
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-800" />
                      <h3
                        className="font-extrabold uppercase text-slate-900 tracking-wider pb-0.5 border-b border-slate-300 mb-2"
                        style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                      >
                        EDUCATION
                      </h3>
                      <div className="flex flex-col" style={{ gap: `${Math.max(3.5, Math.round(effectiveElementSpacing * 0.55))}px` }}>
                        {data.education.filter(x => (x.examName && x.examName.trim() !== '') || (x.boardUniversity && x.boardUniversity.trim() !== '') || (x.passingYear && x.passingYear.trim() !== '')).map((edu, idx) => (
                          <div key={idx} className="text-slate-700">
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{edu.examName || 'Degree'}</span>
                              {edu.passingYear && <span className="text-slate-500 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{edu.passingYear}</span>}
                            </div>
                            {edu.boardUniversity && <div className="text-slate-600 font-medium text-[95%]">{edu.boardUniversity}</div>}
                            {(edu.gradeOrCgpa || edu.percentage || (edu as any).resultOrGpa || (edu as any).specialization) && (
                              <div className="text-slate-500 text-[10px] mt-0.5">
                                {(edu as any).specialization && <span>Specialization: {(edu as any).specialization} </span>}
                                {edu.percentage && <span>Marks: {edu.percentage}% </span>}
                                {(edu.gradeOrCgpa || (edu as any).resultOrGpa) && <span>Grade: {edu.gradeOrCgpa || (edu as any).resultOrGpa}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LICENCE WORK PERMIT / CERTIFICATIONS */}
                  {certList.length > 0 && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-800" />
                      <h3
                        className="font-extrabold uppercase text-slate-900 tracking-wider pb-0.5 border-b border-slate-300 mb-2"
                        style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                      >
                        {certTitle}
                      </h3>
                      <div className="flex flex-col" style={{ gap: `${Math.max(3, Math.round(effectiveElementSpacing * 0.5))}px` }}>
                        {certList.map((cert, idx) => (
                          <div key={idx} className="leading-snug">
                            <div className="font-bold text-slate-900">{cert.title}</div>
                            {(cert.issuer || cert.year) && (
                              <div className="text-slate-500 text-[10px]">
                                {cert.issuer} {cert.year ? `(${cert.year})` : ''}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* KEY PROJECTS (if present) */}
                  {data.projects && data.projects.filter(p => p.title && p.title.trim() !== '').length > 0 && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-800" />
                      <h3
                        className="font-extrabold uppercase text-slate-900 tracking-wider pb-0.5 border-b border-slate-300 mb-2"
                        style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                      >
                        Key Projects
                      </h3>
                      <div className="flex flex-col" style={{ gap: `${Math.max(3, Math.round(effectiveElementSpacing * 0.5))}px` }}>
                        {data.projects.filter(p => p.title && p.title.trim() !== '').map((proj, idx) => (
                          <div key={idx} className="text-slate-700">
                            <div className="font-bold text-slate-900">{proj.title}</div>
                            {proj.description && <div className="text-slate-600 text-xs mt-0.5">{proj.description}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TECHNICAL SKILLS on Timeline Spine */}
                  {data.keySkills && data.keySkills.filter(Boolean).length > 0 && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-800" />
                      <h3
                        className="font-extrabold uppercase text-slate-900 tracking-wider pb-0.5 border-b border-slate-300 mb-2"
                        style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                      >
                        TECHNICAL SKILLS
                      </h3>
                      <div className="space-y-1 text-slate-800 text-[95%]">
                        {data.keySkills.filter(Boolean).map((skill, idx) => {
                          if (data.skillsViewMode === 'text') {
                            return (
                              <div key={idx} className="flex items-start gap-1.5 leading-snug min-w-0">
                                <span className="font-black shrink-0 select-none text-[115%] leading-none mt-0.5" style={{ color: theme.primary }}>•</span>
                                <div className="flex-1 min-w-0 break-words leading-snug font-semibold text-black" style={{ color: '#000000' }}>
                                  {skill}
                                </div>
                              </div>
                            );
                          }

                          const colonIdx = skill.indexOf(':');
                          let label = '';
                          let desc = '';
                          if (colonIdx !== -1) {
                            label = skill.slice(0, colonIdx).trim();
                            desc = skill.slice(colonIdx + 1).trim();
                          } else {
                            desc = skill.trim();
                          }
                          return (
                            <div key={idx} className="flex items-start gap-1.5 leading-snug min-w-0">
                              <span className="font-black shrink-0 select-none text-[115%] leading-none mt-0.5" style={{ color: theme.primary }}>•</span>
                              <div className="flex-1 min-w-0 break-words leading-snug">
                                {label && (
                                  <span className="font-bold tracking-tight inline mr-1.5" style={{ color: theme.primary }}>
                                    {label}:
                                  </span>
                                )}
                                {desc && (
                                  <span className="text-black font-normal inline whitespace-pre-wrap break-words" style={{ color: '#000000' }}>{desc}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CUSTOM SECTIONS (if present) */}
                  {data.customSections && data.customSections.filter(c => c.title && c.title.trim() !== '').length > 0 && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-white ring-1 ring-slate-800" />
                      {data.customSections.filter(c => c.title && c.title.trim() !== '').map((sec, idx) => (
                        <div key={idx} className="mb-1.5">
                          <h3
                            className="font-extrabold uppercase text-slate-900 tracking-wider pb-0.5 border-b border-slate-300 mb-1"
                            style={{ fontSize: `${effectiveSectionHeaderSize}px` }}
                          >
                            {sec.title}
                          </h3>
                          <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap">{sec.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Declaration and Signature */}
              <div className="pt-2 mt-auto shrink-0">
                {renderDeclarationFooter()}
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
};
