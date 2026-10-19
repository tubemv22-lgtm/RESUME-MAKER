import React, { useState } from 'react';
import { SectionOrder, CustomSection, CustomSectionItem } from '../types';
import { Layers, Eye, EyeOff, ArrowUp, ArrowDown, Plus, Trash2, Edit2, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { AutoResizeTextarea } from './AutoResizeTextarea';

interface SectionManagerProps {
  sectionsOrder: SectionOrder[];
  customSections: CustomSection[];
  onUpdateSectionsOrder: (updated: SectionOrder[]) => void;
  onUpdateCustomSections: (updated: CustomSection[]) => void;
}

export const SectionManager: React.FC<SectionManagerProps> = ({
  sectionsOrder,
  customSections,
  onUpdateSectionsOrder,
  onUpdateCustomSections,
}) => {
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [expandedCustomKey, setExpandedCustomKey] = useState<string | null>(null);

  // New Custom Section form
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const toggleVisibility = (index: number) => {
    const updated = [...sectionsOrder];
    updated[index].visible = !updated[index].visible;
    onUpdateSectionsOrder(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sectionsOrder];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateSectionsOrder(updated);
  };

  const moveDown = (index: number) => {
    if (index === sectionsOrder.length - 1) return;
    const updated = [...sectionsOrder];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateSectionsOrder(updated);
  };

  const startRename = (sec: SectionOrder) => {
    setEditingSectionKey(sec.key);
    setEditingTitle(sec.label);
  };

  const saveRename = (index: number) => {
    if (editingTitle.trim()) {
      const updated = [...sectionsOrder];
      const trimmed = editingTitle.trim();
      updated[index].label = trimmed;
      onUpdateSectionsOrder(updated);

      // If it's a custom section, also keep customSections title in sync
      if (updated[index].key.startsWith('custom_')) {
        const cleanId = updated[index].key.replace('custom_', '');
        onUpdateCustomSections(
          customSections.map(cs => cs.id === cleanId ? { ...cs, title: trimmed } : cs)
        );
      }
    }
    setEditingSectionKey(null);
  };

  const createCustomSection = () => {
    if (!newSectionTitle.trim()) return;
    const title = newSectionTitle.trim();
    const newId = `cs-${Date.now()}`;
    
    // 1. Add to customSections list
    const newCustomSec: CustomSection = {
      id: newId,
      title: title,
      items: [
        {
          id: `csi-${Date.now()}`,
          title: 'Sample Item Title',
          subtitle: 'Organization / Subtitle (Optional)',
          dateOrYear: '2026',
          description: 'Detailed description or key achievements for this section.'
        }
      ]
    };
    onUpdateCustomSections([...customSections, newCustomSec]);

    // 2. Add entry to sectionsOrder
    const newOrderEntry: SectionOrder = {
      id: `sec-${newId}`,
      key: `custom_${newId}`,
      label: title,
      visible: true
    };
    onUpdateSectionsOrder([...sectionsOrder, newOrderEntry]);

    setNewSectionTitle('');
    setIsAddingSection(false);
    setExpandedCustomKey(`custom_${newId}`);
  };

  const deleteCustomSection = (id: string) => {
    const cleanId = id.replace('custom_', '');
    onUpdateCustomSections(customSections.filter(cs => cs.id !== cleanId));
    onUpdateSectionsOrder(sectionsOrder.filter(sec => sec.key !== id && sec.key !== `custom_${cleanId}`));
    if (expandedCustomKey === id) {
      setExpandedCustomKey(null);
    }
  };

  const handleUpdateCustomSectionItems = (sectionId: string, updatedItems: CustomSectionItem[]) => {
    onUpdateCustomSections(
      customSections.map(cs => cs.id === sectionId ? { ...cs, items: updatedItems } : cs)
    );
  };

  const handleAddCustomSectionItem = (sectionId: string) => {
    const target = customSections.find(cs => cs.id === sectionId);
    if (!target) return;
    const newItem: CustomSectionItem = {
      id: `csi-${Date.now()}`,
      title: 'New Item Title',
      subtitle: '',
      dateOrYear: '',
      description: ''
    };
    handleUpdateCustomSectionItems(sectionId, [...target.items, newItem]);
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200 shadow-md shadow-black/5 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-indigo-600" /> Section Order & Custom Headings
        </h3>
        <button
          onClick={() => setIsAddingSection(!isAddingSection)}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg transition shadow-sm shadow-black/5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Custom Section
        </button>
      </div>

      {/* Add Custom Section Box */}
      {isAddingSection && (
        <div className="bg-indigo-50/70 border border-indigo-200 p-3 rounded-xl space-y-2 shadow-sm shadow-black/5">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
            Create Custom Heading (e.g. Publications, Awards, Languages, Hobbies, Co-curricular)
          </span>
          <div className="flex gap-2 items-start">
            <AutoResizeTextarea
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              placeholder="Enter Custom Section Name..."
              allowNewlines={false}
              minRows={1}
              className="bg-white border border-slate-300 text-xs py-1.5 px-3 rounded-none text-slate-900 outline-none flex-1 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs font-bold transition-all"
              autoFocus
            />
            <button
              onClick={createCustomSection}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow-xs cursor-pointer shrink-0 transition"
            >
              Add Section
            </button>
          </div>
        </div>
      )}

      {/* Re-orderable List */}
      <div className="space-y-2.5">
        {sectionsOrder.map((sec, index) => {
          // Determine color theme based on section key
          const getSectionTheme = (key: string) => {
            if (key.includes('personal')) return { badge: 'bg-blue-600 text-white', border: 'border-blue-200 hover:border-blue-400 bg-blue-50/40', text: 'text-blue-950' };
            if (key.includes('objective')) return { badge: 'bg-emerald-600 text-white', border: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40', text: 'text-emerald-950' };
            if (key.includes('education')) return { badge: 'bg-violet-600 text-white', border: 'border-violet-200 hover:border-violet-400 bg-violet-50/40', text: 'text-violet-950' };
            if (key.includes('experience')) return { badge: 'bg-sky-600 text-white', border: 'border-sky-200 hover:border-sky-400 bg-sky-50/40', text: 'text-sky-950' };
            if (key.includes('project')) return { badge: 'bg-indigo-600 text-white', border: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/40', text: 'text-indigo-950' };
            if (key.includes('skill')) return { badge: 'bg-amber-600 text-white', border: 'border-amber-200 hover:border-amber-400 bg-amber-50/40', text: 'text-amber-950' };
            if (key.includes('family')) return { badge: 'bg-rose-600 text-white', border: 'border-rose-200 hover:border-rose-400 bg-rose-50/40', text: 'text-rose-950' };
            if (key.includes('cert')) return { badge: 'bg-pink-600 text-white', border: 'border-pink-200 hover:border-pink-400 bg-pink-50/40', text: 'text-pink-950' };
            return { badge: 'bg-purple-600 text-white', border: 'border-purple-200 hover:border-purple-400 bg-purple-50/40', text: 'text-purple-950' };
          };
          const theme = getSectionTheme(sec.key);
          const isCustom = sec.key.startsWith('custom_');
          const cleanCustomId = isCustom ? sec.key.replace('custom_', '') : null;
          const matchingCustomSec = cleanCustomId ? customSections.find(cs => cs.id === cleanCustomId) : null;
          const isExpanded = expandedCustomKey === sec.key;

          return (
            <div
              key={sec.id || sec.key}
              className={`rounded-xl border-2 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 hover:border-emerald-400 ${
                sec.visible
                  ? `${theme.border} shadow-xs`
                  : 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between p-3 gap-2">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
                  <button
                    onClick={() => toggleVisibility(index)}
                    className={`p-1.5 rounded-lg hover:bg-white transition cursor-pointer shrink-0 ${sec.visible ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-400'}`}
                    title={sec.visible ? 'Hide Section' : 'Show Section'}
                  >
                    {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${theme.badge}`}>
                    {index + 1}
                  </span>

                  {editingSectionKey === sec.key ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <AutoResizeTextarea
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveRename(index);
                          } else if (e.key === 'Escape') {
                            setEditingSectionKey(null);
                          }
                        }}
                        allowNewlines={false}
                        minRows={1}
                        className="bg-white border border-slate-300 text-xs font-bold px-2.5 py-1 rounded-none text-slate-900 flex-1 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(index)}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-xs cursor-pointer shrink-0"
                        title="Save Title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                      <span className={`text-xs font-extrabold leading-snug break-words ${sec.visible ? theme.text : 'text-slate-400'}`}>
                        {sec.label}
                      </span>
                      {isCustom && (
                        <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-2 py-0.5 rounded-md border border-purple-300 shrink-0">
                          Custom
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  {isCustom && matchingCustomSec && (
                    <button
                      onClick={() => setExpandedCustomKey(isExpanded ? null : sec.key)}
                      className="px-2 py-1 text-[11px] font-bold text-purple-700 hover:bg-purple-100/80 rounded-lg transition flex items-center gap-1 cursor-pointer border border-purple-200 bg-purple-50"
                      title="Edit items in this section"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Items ({matchingCustomSec.items.length})</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}

                  {editingSectionKey !== sec.key && (
                    <button
                      onClick={() => startRename(sec)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition cursor-pointer"
                      title="Rename Section Title"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-500 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === sectionsOrder.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-500 hover:bg-white rounded-lg transition cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {isCustom && (
                    <button
                      onClick={() => deleteCustomSection(sec.key)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition ml-1 cursor-pointer"
                      title="Delete Custom Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded items editor for custom sections */}
              {isCustom && matchingCustomSec && isExpanded && (
                <div className="p-3.5 border-t border-purple-200/80 bg-purple-50/50 rounded-b-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide">
                      Items in &quot;{matchingCustomSec.title}&quot;
                    </span>
                    <button
                      onClick={() => handleAddCustomSectionItem(matchingCustomSec.id)}
                      className="text-[11px] font-bold text-purple-700 bg-white hover:bg-purple-100/70 border border-purple-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {matchingCustomSec.items.length === 0 ? (
                    <p className="text-xs text-purple-600 italic py-2">
                      No items yet. Click &quot;Add Item&quot; above to add content to this section.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {matchingCustomSec.items.map((item, itemIdx) => (
                        <div
                          key={item.id || itemIdx}
                          className="bg-white p-3 rounded-xl border border-purple-200 shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-purple-100">
                            <span className="text-[10px] font-extrabold text-purple-800 uppercase">
                              Item #{itemIdx + 1}
                            </span>
                            <button
                              onClick={() => {
                                const updatedItems = matchingCustomSec.items.filter((_, i) => i !== itemIdx);
                                handleUpdateCustomSectionItems(matchingCustomSec.id, updatedItems);
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                Title / Headline
                              </label>
                              <AutoResizeTextarea
                                value={item.title}
                                onChange={(e) => {
                                  const updatedItems = [...matchingCustomSec.items];
                                  updatedItems[itemIdx].title = e.target.value;
                                  handleUpdateCustomSectionItems(matchingCustomSec.id, updatedItems);
                                }}
                                placeholder="e.g. Research Publication / Award / Language"
                                allowNewlines={false}
                                minRows={1}
                                className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-2 text-xs text-slate-900 font-bold outline-none transition shadow-2xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                                Date / Year / Level (Optional)
                              </label>
                              <AutoResizeTextarea
                                value={item.dateOrYear || ''}
                                onChange={(e) => {
                                  const updatedItems = [...matchingCustomSec.items];
                                  updatedItems[itemIdx].dateOrYear = e.target.value;
                                  handleUpdateCustomSectionItems(matchingCustomSec.id, updatedItems);
                                }}
                                placeholder="e.g. 2026 or Fluent"
                                allowNewlines={false}
                                minRows={1}
                                className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-2 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                              Subtitle / Organization (Optional)
                            </label>
                            <AutoResizeTextarea
                              value={item.subtitle || ''}
                              onChange={(e) => {
                                const updatedItems = [...matchingCustomSec.items];
                                updatedItems[itemIdx].subtitle = e.target.value;
                                handleUpdateCustomSectionItems(matchingCustomSec.id, updatedItems);
                              }}
                              placeholder="e.g. IEEE Conference / Harvard University"
                              allowNewlines={false}
                              minRows={1}
                              className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-2 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                              Description / Details (Auto-expanding)
                            </label>
                            <AutoResizeTextarea
                              value={item.description}
                              onChange={(e) => {
                                const updatedItems = [...matchingCustomSec.items];
                                updatedItems[itemIdx].description = e.target.value;
                                handleUpdateCustomSectionItems(matchingCustomSec.id, updatedItems);
                              }}
                              placeholder="Enter description, achievements, or notes..."
                              allowNewlines={true}
                              minRows={2}
                              className="w-full bg-white hover:bg-slate-50/40 focus:bg-emerald-50/20 border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-none p-2 text-xs text-slate-900 font-medium outline-none transition shadow-2xs"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

