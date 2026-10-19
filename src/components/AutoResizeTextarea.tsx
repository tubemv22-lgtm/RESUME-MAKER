import React, { useRef, useLayoutEffect, useEffect } from 'react';

export interface AutoResizeTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  minRows?: number;
  maxRows?: number;
  allowNewlines?: boolean;
}

export const AutoResizeTextarea: React.FC<AutoResizeTextareaProps> = ({
  value,
  minRows = 1,
  maxRows = 24,
  allowNewlines = true,
  className = '',
  style,
  onChange,
  onKeyDown,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generous height calculation: ~22px per text line + 18px vertical padding/border
  const approxRowHeight = 22;
  const basePadding = 18;
  const minCalculatedHeight = Math.max(minRows * approxRowHeight + basePadding, 38);
  const maxCalculatedHeight = Math.max(maxRows, 24) * approxRowHeight + basePadding;

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;

    // Reset height to calculate true scrollHeight without previous constraints
    el.style.height = 'auto';

    // Account for top and bottom border in box-sizing: border-box + 4px breathing room so text never clips
    const borderOffset = (el.offsetHeight - el.clientHeight) || 2;
    const computedScrollHeight = el.scrollHeight;
    const targetHeight = Math.max(computedScrollHeight + borderOffset + 4, minCalculatedHeight);

    if (targetHeight > maxCalculatedHeight) {
      el.style.height = `${maxCalculatedHeight}px`;
      el.style.overflowY = 'auto';
    } else {
      el.style.height = `${targetHeight}px`;
      el.style.overflowY = 'hidden';
    }
  };

  useLayoutEffect(() => {
    adjustHeight();
  }, [value, minRows, maxRows]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [minRows, maxRows]);

  // Sanitize incoming className: enforce square corners and green focus grading
  const sanitizedClassName = className
    .replace(/\bfocus:ring-(?:indigo|purple|black|slate)-\d+\b/g, 'focus:ring-[#0d8f62]/24')
    .replace(/\bfocus:border-(?:indigo|purple|black|slate)-\d+\b/g, 'focus:border-[#0d8f62]')
    .replace(/\bfocus:bg-(?:indigo|purple|black|slate)-\d+\b/g, 'focus:bg-emerald-50/20');

  const resolvedMinHeight = minRows === 1 ? Math.max(minCalculatedHeight, 44) : minCalculatedHeight;

  return (
    <textarea
      ref={textareaRef}
      value={value ?? ''}
      rows={minRows}
      onChange={(e) => {
        onChange?.(e);
        adjustHeight();
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.code === 'Space') {
          e.stopPropagation();
        }
        if (!allowNewlines && e.key === 'Enter') {
          e.preventDefault();
        }
        onKeyDown?.(e);
      }}
      style={{
        borderRadius: '0px',
        width: '100%',
        minWidth: '140px',
        minHeight: `${resolvedMinHeight}px`,
        fontSize: '14px',
        ...style,
      }}
      className={`w-full rounded-none resize-none box-border break-words whitespace-pre-wrap transition-all duration-150 border border-slate-300 hover:border-slate-400 focus:border-[#0d8f62] focus:ring-[3px] focus:ring-[#0d8f62]/24 focus:bg-emerald-50/20 text-slate-900 outline-none shadow-xs text-sm ${sanitizedClassName}`}
      {...props}
    />
  );
};
