import React from 'react';
import { PhotoConfig } from '../types';
import { Image, ZoomIn, Square, Circle, Eye, EyeOff, Trash2, Upload, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface PhotoStudioProps {
  photo: PhotoConfig;
  onChange: (updated: PhotoConfig) => void;
}

export const PhotoStudio: React.FC<PhotoStudioProps> = ({ photo, onChange }) => {
  const isPreserved = photo.preserveLayout !== false;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ ...photo, photoUrl: reader.result as string, showPhoto: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    onChange({ ...photo, photoUrl: null });
  };

  return (
    /* Stack the cards in ONE column */
    <div className="flex flex-col space-y-4 w-full">
      {/* 1. Passport Photograph */}
      <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 w-full">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Passport Photograph
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload image (JPG, PNG, WebP)
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...photo, showPhoto: !photo.showPhoto })}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 transition cursor-pointer border ${
              photo.showPhoto
                ? 'bg-[#0d8f62] text-white border-[#0d8f62] shadow-xs ring-2 ring-[#0d8f62]/25'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {photo.showPhoto ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>{photo.showPhoto ? 'Visible' : 'Hidden'}</span>
          </button>
        </div>

        {/* Preview Box & Upload Action */}
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          <div
            className={`relative w-28 h-36 bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-2xs group ${
              photo.shape === 'circle' ? 'photo-shape-circle' : ''
            }`}
            data-photo-shape={photo.shape}
          >
            {photo.photoUrl ? (
              <>
                <img
                  src={photo.photoUrl}
                  alt="Candidate Photo"
                  className={`w-full h-full object-cover transition ${photo.shape === 'circle' ? 'photo-shape-circle' : ''}`}
                  data-photo-shape={photo.shape}
                  style={{
                    transform: `scale(${photo.scale})`,
                    borderRadius: photo.shape === 'circle' ? '50%' : '0',
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer shadow-sm"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-2 text-slate-400">
                <Image className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                <span className="text-[10px] font-medium block text-slate-500">No Photo</span>
                <span className="text-[9px] text-slate-400 block">35 × 45 mm</span>
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1 min-w-[200px]">
            <input
              type="file"
              accept="image/*"
              id="passport-file-input"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="passport-file-input"
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-[#0d8f62] hover:bg-[#0b7a53] text-white text-xs font-semibold cursor-pointer transition shadow-2xs w-full justify-center"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{photo.photoUrl ? 'Replace Photo' : 'Choose Photo'}</span>
            </label>

            {photo.photoUrl && (
              <button
                type="button"
                onClick={removePhoto}
                className="inline-flex items-center gap-1 px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-medium cursor-pointer transition w-full justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}

            <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
              <span>Status:</span>
              <span className={`font-semibold ${photo.photoUrl ? 'text-[#0d8f62]' : 'text-slate-400'}`}>
                {photo.photoUrl ? 'Uploaded ✓' : 'Empty'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="text-slate-600 font-medium">Layout Space Reservation</span>
          <button
            type="button"
            onClick={() => onChange({ ...photo, preserveLayout: !isPreserved })}
            className={`px-2.5 py-1 text-xs font-medium border transition cursor-pointer ${
              isPreserved ? 'bg-emerald-50 text-[#0d8f62] border-[#0d8f62]/40 font-semibold' : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {isPreserved ? 'Preserve Space ✓' : 'Collapse Space'}
          </button>
        </div>
      </div>

      {/* 2. Frame Shape */}
      <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 w-full">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Frame Shape
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select contour geometry for photograph
          </p>
        </div>

        {/* Frame Shape buttons in 2 columns with labels on one line */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { id: 'rounded', label: 'Rounded Box', icon: <Square className="w-4 h-4 rounded-sm shrink-0" /> },
            { id: 'circle', label: 'Circular Ring', icon: <Circle className="w-4 h-4 shrink-0" /> },
            { id: 'square', label: 'Square Box', icon: <Square className="w-4 h-4 shrink-0" /> },
            { id: 'oval', label: 'Oval Contour', icon: <Circle className="w-4 h-4 scale-y-125 shrink-0" /> },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange({ ...photo, shape: s.id as any })}
              className={`flex items-center justify-center gap-2.5 py-2.5 px-3 text-xs font-semibold border transition cursor-pointer min-w-0 ${
                photo.shape === s.id
                  ? 'bg-[#0d8f62] text-white border-[#0d8f62] shadow-xs ring-2 ring-[#0d8f62]/25 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-[#0d8f62]/40 hover:bg-emerald-50/20'
              }`}
            >
              {s.icon}
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">{s.label}</span>
            </button>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Print Affix Box</label>
          <button
            type="button"
            onClick={() => onChange({ ...photo, affixBox: !photo.affixBox })}
            className={`w-full py-2.5 px-3 text-xs font-medium border transition cursor-pointer flex items-center justify-between ${
              photo.affixBox
                ? 'bg-emerald-50 text-[#0d8f62] border-[#0d8f62]/40 font-semibold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>Dashed Box on Print (for physical photo pasting)</span>
            <span className="font-semibold">{photo.affixBox ? 'Enabled ✓' : 'Disabled'}</span>
          </button>
        </div>
      </div>

      {/* 3. Dimensions and Sliders */}
      <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 w-full">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Dimensions and Sliders
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Control width, height, zoom, and border thickness
          </p>
        </div>

        {/* Each slider row has the label on top and the slider with its value box below */}
        <div className="space-y-3">
          {/* Frame Width */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700">
              Frame Width
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="range"
                min="70"
                max="220"
                step="2"
                value={photo.frameWidth}
                onChange={(e) => onChange({ ...photo, frameWidth: parseInt(e.target.value) || 100 })}
                className="flex-1 h-2 bg-slate-200 appearance-none cursor-pointer accent-[#0d8f62] min-w-0"
              />
              <span className="font-mono text-slate-900 bg-white px-2.5 py-1 border border-slate-300 text-xs font-semibold min-w-[62px] text-center shrink-0">
                {photo.frameWidth}px
              </span>
            </div>
          </div>

          {/* Frame Height */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700">
              Frame Height
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="range"
                min="80"
                max="260"
                step="2"
                value={photo.frameHeight}
                onChange={(e) => onChange({ ...photo, frameHeight: parseInt(e.target.value) || 130 })}
                className="flex-1 h-2 bg-slate-200 appearance-none cursor-pointer accent-[#0d8f62] min-w-0"
              />
              <span className="font-mono text-slate-900 bg-white px-2.5 py-1 border border-slate-300 text-xs font-semibold min-w-[62px] text-center shrink-0">
                {photo.frameHeight}px
              </span>
            </div>
          </div>

          {/* Photo Zoom */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <ZoomIn className="w-3.5 h-3.5 text-[#0d8f62]" />
              <span>Zoom Scale</span>
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={photo.scale}
                onChange={(e) => onChange({ ...photo, scale: parseFloat(e.target.value) || 1 })}
                className="flex-1 h-2 bg-slate-200 appearance-none cursor-pointer accent-[#0d8f62] min-w-0"
              />
              <span className="font-mono text-slate-900 bg-white px-2.5 py-1 border border-slate-300 text-xs font-semibold min-w-[62px] text-center shrink-0">
                {photo.scale}x
              </span>
            </div>
          </div>

          {/* Border Width */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700">
              Border Thickness
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={photo.borderWidth}
                onChange={(e) => onChange({ ...photo, borderWidth: parseInt(e.target.value) || 0 })}
                className="flex-1 h-2 bg-slate-200 appearance-none cursor-pointer accent-[#0d8f62] min-w-0"
              />
              <span className="font-mono text-slate-900 bg-white px-2.5 py-1 border border-slate-300 text-xs font-semibold min-w-[62px] text-center shrink-0">
                {photo.borderWidth}px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Position Controls */}
      <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 w-full">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Position Controls
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fine-tune X & Y offset on canvas
            </p>
          </div>
          {((photo.topOffset || 0) !== 0 || (photo.leftOffset || 0) !== 0) && (
            <button
              type="button"
              onClick={() => onChange({ ...photo, topOffset: 0, leftOffset: 0 })}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 border border-rose-200 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Visual D-Pad */}
        <div className="p-3 bg-slate-50/80 border border-slate-200 flex flex-col items-center justify-center space-y-1">
          <button
            type="button"
            onClick={() => onChange({ ...photo, topOffset: (photo.topOffset || 0) - 4 })}
            className="w-12 h-8 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs cursor-pointer"
            title="Nudge Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...photo, leftOffset: (photo.leftOffset || 0) - 4 })}
              className="w-10 h-8 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs cursor-pointer"
              title="Nudge Left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...photo, topOffset: 0, leftOffset: 0 })}
              className="w-12 h-8 flex items-center justify-center bg-slate-100 hover:bg-white border border-slate-300 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
              title="Reset 0,0"
            >
              0,0
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...photo, leftOffset: (photo.leftOffset || 0) + 4 })}
              className="w-10 h-8 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs cursor-pointer"
              title="Nudge Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...photo, topOffset: (photo.topOffset || 0) + 4 })}
            className="w-12 h-8 flex items-center justify-center bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs cursor-pointer"
            title="Nudge Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sliders: label on top, slider with value box below */}
        <div className="space-y-3 pt-1">
          {/* Vertical (Y) */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700">
              Vertical Offset (Y)
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="range"
                min="-120"
                max="120"
                step="1"
                value={photo.topOffset || 0}
                onChange={(e) => onChange({ ...photo, topOffset: parseInt(e.target.value) || 0 })}
                className="flex-1 h-2 bg-slate-200 appearance-none cursor-pointer accent-[#0d8f62] min-w-0"
              />
              <span className="font-mono text-slate-900 bg-white px-2.5 py-1 border border-slate-300 text-xs font-semibold min-w-[62px] text-center shrink-0">
                {(photo.topOffset || 0) > 0 ? `+${photo.topOffset}px` : `${photo.topOffset || 0}px`}
              </span>
            </div>
          </div>

          {/* Horizontal (X) */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 space-y-1.5 w-full">
            <label className="block text-xs font-semibold text-slate-700">
              Horizontal Offset (X)
            </label>
            <div className="flex items-center gap-3 min-w-0">
              <input
                type="range"
                min="-160"
                max="160"
                step="1"
                value={photo.leftOffset || 0}
                onChange={(e) => onChange({ ...photo, leftOffset: parseInt(e.target.value) || 0 })}
                className="flex-1 h-2 bg-slate-200 appearance-none cursor-pointer accent-[#0d8f62] min-w-0"
              />
              <span className="font-mono text-slate-900 bg-white px-2.5 py-1 border border-slate-300 text-xs font-semibold min-w-[62px] text-center shrink-0">
                {(photo.leftOffset || 0) > 0 ? `+${photo.leftOffset}px` : `${photo.leftOffset || 0}px`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Presets */}
      <div className="section-card bg-white border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3 w-full">
        <div className="pb-2 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Quick Presets
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Instant position offsets
          </p>
        </div>

        {/* Preset buttons wrap and never overflow */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: 'Default Centered (0, 0)', top: 0, left: 0 },
            { label: 'Nudge Up (-15px)', top: -15, left: photo.leftOffset || 0 },
            { label: 'Nudge Down (+15px)', top: 15, left: photo.leftOffset || 0 },
            { label: 'Nudge Left (-25px)', top: photo.topOffset || 0, left: -25 },
            { label: 'Nudge Right (+25px)', top: photo.topOffset || 0, left: 25 },
            { label: 'Top-Right Corner', top: -20, left: 20 },
            { label: 'Reset (0, 0)', top: 0, left: 0 },
          ].map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange({ ...photo, topOffset: p.top, leftOffset: p.left })}
              className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-[#0d8f62] hover:border-[#0d8f62]/50 border border-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer whitespace-nowrap shadow-2xs active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
