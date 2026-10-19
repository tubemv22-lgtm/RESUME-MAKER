import React, { useState, useEffect } from 'react';
import { SavedDraft, DocumentData, ThemeColor, PhotoConfig, TypographyConfig } from '../types';
import {
  Bookmark,
  Trash2,
  Download,
  Upload,
  Plus,
  X,
  FolderOpen,
  Check,
  Cloud,
  CloudUpload,
  HardDrive,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveResumeToCloud, getResumesFromCloud, deleteResumeFromCloud } from '../lib/firebase';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: DocumentData;
  currentTemplateId: number;
  currentTheme: ThemeColor;
  currentPhoto: PhotoConfig;
  currentTypography: TypographyConfig;
  onLoadDraft: (draft: SavedDraft) => void;
  onImportJson: (importedState: any) => void;
}

export const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  isOpen,
  onClose,
  currentData,
  currentTemplateId,
  currentTheme,
  currentPhoto,
  currentTypography,
  onLoadDraft,
  onImportJson,
}) => {
  const { user, signIn } = useAuth();
  const [localDrafts, setLocalDrafts] = useState<SavedDraft[]>([]);
  const [cloudDrafts, setCloudDrafts] = useState<SavedDraft[]>([]);
  const [newDraftTitle, setNewDraftTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'cloud' | 'local' | 'save' | 'json'>('cloud');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAllDraftsFromStorage();
      if (user) {
        loadCloudDrafts();
      } else {
        setActiveTab('local');
      }
    }
  }, [isOpen, user]);

  const loadAllDraftsFromStorage = () => {
    const raw = localStorage.getItem('PRATIDIN_saved_resume_drafts');
    if (raw) {
      try {
        setLocalDrafts(JSON.parse(raw));
      } catch (e) {
        setLocalDrafts([]);
      }
    } else {
      setLocalDrafts([]);
    }
  };

  const loadCloudDrafts = async () => {
    if (!user) return;
    setIsLoadingCloud(true);
    try {
      const drafts = await getResumesFromCloud(user.uid);
      setCloudDrafts(drafts);
    } catch (err) {
      console.error('Failed to load cloud drafts:', err);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  if (!isOpen) return null;

  const saveCurrentDraft = async (saveToFirestore: boolean = false) => {
    const title = newDraftTitle.trim() || `${currentData.fullName || 'Draft'} - ${currentData.docType}`;
    const newDraft: SavedDraft = {
      id: `draft-${Date.now()}`,
      title,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      docData: currentData,
      templateId: currentTemplateId,
      theme: currentTheme,
      photo: currentPhoto,
      typography: currentTypography,
    };

    // Save to LocalStorage
    const updatedLocal = [newDraft, ...localDrafts];
    setLocalDrafts(updatedLocal);
    localStorage.setItem('PRATIDIN_saved_resume_drafts', JSON.stringify(updatedLocal));

    // Save to Cloud Firestore if user is authenticated
    if (saveToFirestore && user) {
      setIsSavingCloud(true);
      try {
        await saveResumeToCloud(user.uid, newDraft);
        await loadCloudDrafts();
      } catch (err) {
        console.error('Cloud save failed:', err);
        alert('Saved to local storage, but cloud sync encountered an issue.');
      } finally {
        setIsSavingCloud(false);
      }
    }

    setNewDraftTitle('');
    setActiveTab(user && saveToFirestore ? 'cloud' : 'local');
  };

  const deleteLocalDraft = (id: string) => {
    const updated = localDrafts.filter((d) => d.id !== id);
    setLocalDrafts(updated);
    localStorage.setItem('PRATIDIN_saved_resume_drafts', JSON.stringify(updated));
  };

  const deleteCloudDraft = async (id: string) => {
    if (!user) return;
    try {
      await deleteResumeFromCloud(user.uid, id);
      setCloudDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete cloud draft:', err);
    }
  };

  const exportFullStateJson = () => {
    const fullBundle = {
      app: 'Resume & CV Maker',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      docData: currentData,
      templateId: currentTemplateId,
      theme: currentTheme,
      photo: currentPhoto,
      typography: currentTypography,
    };

    const blob = new Blob([JSON.stringify(fullBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentData.fullName || 'Resume'}_Backup_Config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed.docData) {
            onImportJson(parsed);
            onClose();
          } else {
            alert('Invalid JSON structure. Could not find docData.');
          }
        } catch (err) {
          alert('Error parsing JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] relative space-y-4 text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Cloud className="w-5 h-5 text-indigo-600 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 leading-tight truncate">Firebase Cloud & Drafts</h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[240px] sm:max-w-xs">
                {user ? `Connected as ${user.email || user.displayName}` : 'Sign in with Google to sync across all devices'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'cloud'
                ? 'bg-indigo-600 text-white shadow-md shadow-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> Cloud ({cloudDrafts.length})
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
              activeTab === 'local'
                ? 'bg-indigo-600 text-white shadow-md shadow-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Local ({localDrafts.length})
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'save'
                ? 'bg-indigo-600 text-white shadow-md shadow-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Save Draft
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-1.5 rounded-lg transition ${
              activeTab === 'json'
                ? 'bg-indigo-600 text-white shadow-md shadow-black/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            JSON Backup
          </button>
        </div>

        {/* Tab 1: Cloud Firestore Drafts */}
        {activeTab === 'cloud' && (
          <div className="space-y-3">
            {!user ? (
              <div className="text-center py-6 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <Cloud className="w-10 h-10 mx-auto text-indigo-500 opacity-60" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Save & Access Your Resumes from Anywhere</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1">
                    Sign in with your Google account to automatically store drafts securely in Firebase Firestore.
                  </p>
                </div>
                <button
                  onClick={signIn}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-2 mx-auto shadow-md"
                >
                  <UserIcon className="w-4 h-4" /> Sign in with Google
                </button>
              </div>
            ) : isLoadingCloud ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 mx-auto animate-spin text-indigo-600" />
                <p className="text-xs">Fetching cloud drafts from Firestore...</p>
              </div>
            ) : cloudDrafts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <Cloud className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No cloud drafts saved yet.</p>
                <button
                  onClick={() => setActiveTab('save')}
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  Click here to save your current resume to Cloud!
                </button>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {cloudDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition group shadow-sm"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-indigo-500" /> {draft.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {draft.docData.docType} &bull; {draft.updatedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadDraft(draft);
                          onClose();
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Load
                      </button>
                      <button
                        onClick={() => deleteCloudDraft(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Cloud Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Local Storage Drafts */}
        {activeTab === 'local' && (
          <div className="space-y-3">
            {localDrafts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <HardDrive className="w-8 h-8 mx-auto opacity-40 text-slate-400" />
                <p className="text-xs font-medium">No saved drafts found in local browser storage.</p>
                <button
                  onClick={() => setActiveTab('save')}
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  Click here to save your current work!
                </button>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {localDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition group shadow-sm"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                        {draft.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {draft.docData.docType} &bull; {draft.updatedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onLoadDraft(draft);
                          onClose();
                        }}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <FolderOpen className="w-3.5 h-3.5" /> Load
                      </button>
                      <button
                        onClick={() => deleteLocalDraft(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Save Current State */}
        {activeTab === 'save' && (
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                Give this Saved Version a Name:
              </label>
              <input
                type="text"
                value={newDraftTitle}
                onChange={(e) => setNewDraftTitle(e.target.value)}
                placeholder={`E.g., ${currentData.fullName || 'Johnathan'} - ${currentData.docType}`}
                className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 text-xs py-2 px-3 rounded-none text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-2xs transition-all font-medium placeholder:text-slate-400"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && saveCurrentDraft(Boolean(user))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => saveCurrentDraft(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-300"
              >
                <HardDrive className="w-4 h-4 text-slate-600" /> Save to Device (Local)
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    signIn();
                  } else {
                    saveCurrentDraft(true);
                  }
                }}
                disabled={isSavingCloud}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
              >
                {isSavingCloud ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving to Cloud...
                  </>
                ) : user ? (
                  <>
                    <CloudUpload className="w-4 h-4" /> Save to Firebase Cloud
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" /> Sign In & Cloud Save
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: JSON Import/Export */}
        {activeTab === 'json' && (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-indigo-600" /> Export Full Document Config JSON
              </h4>
              <p className="text-[11px] text-slate-500">
                Download a `.json` backup of your full layout, colors, font settings, and profile photo config.
              </p>
              <button
                onClick={exportFullStateJson}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-300 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON Backup
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" /> Import Document Config JSON
              </h4>
              <p className="text-[11px] text-slate-500">
                Restore a previously exported `.json` file to load all settings immediately.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonFileUpload}
                className="w-full text-xs text-slate-500 rounded-none file:mr-2 file:py-1.5 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

