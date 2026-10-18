import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Check, ChevronDown, Hash } from 'lucide-react';

export type CreatableOption = string | { id: string; name: string; nameBn?: string };

interface Props {
 options: CreatableOption[];
 value?: string;
 onChange: (value: string, id?: string) => void;
 onAddNew?: (newValue: string, generatedId?: string) => void;
 placeholder?: string;
 className?: string;
 disabled?: boolean;
}

export const CreatableSelect: React.FC<Props> = React.memo(({
 options = [],
 value = '',
 onChange,
 onAddNew,
 placeholder = 'নির্বাচন করুন বা লিখুন',
 className = '',
 disabled = false
}) => {
 const [isOpen, setIsOpen] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [isAddingNew, setIsAddingNew] = useState(false);
 const [customValue, setCustomValue] = useState('');
 const [openUpward, setOpenUpward] = useState(false);
 const wrapperRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 setIsAddingNew(false);
 setSearchTerm('');
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 useEffect(() => {
 if (isOpen && wrapperRef.current) {
 const rect = wrapperRef.current.getBoundingClientRect();
 const spaceBelow = window.innerHeight - rect.bottom;
 const spaceAbove = rect.top;
 if (spaceBelow < 250 && spaceAbove > spaceBelow) {
 setOpenUpward(true);
 } else {
 setOpenUpward(false);
 }
 }
 }, [isOpen]);

 // Normalized items: { id: string, name: string, label: string }
 const normalizedOptions = useMemo(() => {
 const list: { id: string; name: string; label: string }[] = [];
 const seenNames = new Set<string>();

 options.forEach(opt => {
 if (typeof opt === 'string') {
 const trimmed = opt.trim();
 if (trimmed && !seenNames.has(trimmed.toLowerCase())) {
 seenNames.add(trimmed.toLowerCase());
 list.push({ id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_'), name: trimmed, label: trimmed });
 }
 } else if (opt && typeof opt === 'object') {
 const cleanName = (opt.name || '').trim();
 const cleanBn = (opt.nameBn || '').trim();
 const cleanId = (opt.id || '').trim();
 if (cleanName && !seenNames.has(cleanName.toLowerCase())) {
 seenNames.add(cleanName.toLowerCase());
 if (cleanBn) seenNames.add(cleanBn.toLowerCase());
 if (cleanId) seenNames.add(cleanId.toLowerCase());
 const displayLabel = cleanBn && cleanName !== cleanBn 
 ? `${cleanBn} (${cleanName})` 
 : (cleanBn || cleanName);
 list.push({ id: opt.id, name: opt.name, label: displayLabel });
 }
 }
 });

 if (value) {
 const cleanVal = value.trim();
 if (cleanVal && !seenNames.has(cleanVal.toLowerCase())) {
 list.unshift({ id: cleanVal.toLowerCase().replace(/[^a-z0-9]/g, '_'), name: cleanVal, label: cleanVal });
 }
 }

 return list;
 }, [options, value]);

 const selectedItem = useMemo(() => {
 if (!value) return undefined;
 const valLower = value.toLowerCase().trim();
 return normalizedOptions.find(o => 
 o.name.toLowerCase() === valLower || 
 o.label.toLowerCase() === valLower || 
 o.id.toLowerCase() === valLower
 );
 }, [normalizedOptions, value]);

 const filteredOptions = useMemo(() => {
 const term = (searchTerm || '').toLowerCase().trim();
 if (!term) return normalizedOptions.slice(0, 60);
 return normalizedOptions.filter(opt => 
 opt.name.toLowerCase().includes(term) || 
 opt.label.toLowerCase().includes(term) ||
 opt.id.toLowerCase().includes(term)
 ).slice(0, 60);
 }, [normalizedOptions, searchTerm]);

 const handleSelect = (item: { id: string; name: string; label: string }) => {
 onChange(item.name, item.id);
 setIsOpen(false);
 setSearchTerm('');
 };

 const handleSaveCustom = (e: React.FormEvent) => {
 e.preventDefault();
 if (!customValue.trim()) return;
 const trimmed = customValue.trim();
 const generatedId = `custom_${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_') || Date.now()}`;
 if (onAddNew) {
 onAddNew(trimmed, generatedId);
 }
 onChange(trimmed, generatedId);
 setCustomValue('');
 setIsAddingNew(false);
 setIsOpen(false);
 };

 return (
 <div className={`relative ${isOpen ? 'z-50' : 'z-0'} ${className}`} ref={wrapperRef}>
 <div
 className={`w-full flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs cursor-pointer hover:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${
 disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
 }`}
 onClick={() => !disabled && setIsOpen(prev => !prev)}
 >
 <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
 <span className={`block truncate ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
 {selectedItem?.label || value || placeholder}
 </span>
 </div>
 <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
 </div>

 {isOpen && !disabled && (
 <div className={`absolute z-50 ${openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} w-full min-w-[220px] rounded-xl bg-white shadow-2xl border border-slate-200 py-1.5 text-sm max-h-64 overflow-hidden flex flex-col -50 `}>
 {/* Search input */}
 <div className="px-2.5 pb-1.5 pt-1 border-b border-slate-100">
 <input
 type="text"
 placeholder="খুঁজুন..."
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 onClick={e => e.stopPropagation()}
 className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
 autoFocus
 />
 </div>

 {/* Options list */}
 <div className="overflow-y-auto max-h-40 py-1 divide-y divide-slate-50">
 {filteredOptions.length > 0 ? (
 filteredOptions.map(opt => {
 const isSelected = value === opt.name || value === opt.label || value === opt.id;
 return (
 <div
 key={opt.id + opt.name}
 onClick={(e) => {
 e.stopPropagation();
 handleSelect(opt);
 }}
 className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors ${
 isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
 }`}
 >
 <div className="flex items-center gap-2 truncate min-w-0">
 <span className="truncate">{opt.label}</span>
 </div>
 {isSelected && <Check size={14} className="text-indigo-600 shrink-0 ml-1.5" />}
 </div>
 );
 })
 ) : (
 <div className="px-3 py-2 text-xs text-slate-400 text-center">কোনো তথ্য পাওয়া যায়নি</div>
 )}
 </div>

 {/* Add custom value section */}
 <div className="border-t border-slate-100 p-2 bg-slate-50">
 {!isAddingNew ? (
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setIsAddingNew(true);
 if (searchTerm) setCustomValue(searchTerm);
 }}
 className="w-full flex items-center justify-center gap-1.5 py-1 px-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
 >
 <Plus size={13} />
 <span>নতুন যোগ করুন</span>
 </button>
 ) : (
 <div className="space-y-1.5" onClick={e => e.stopPropagation()}>
 <input
 type="text"
 placeholder="নতুন নাম / তথ্য লিখুন..."
 value={customValue}
 onChange={e => setCustomValue(e.target.value)}
 className="w-full px-2.5 py-1 text-xs rounded-md border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
 autoFocus
 onKeyDown={e => {
 if (e.key === 'Enter') {
 e.preventDefault();
 handleSaveCustom(e);
 }
 }}
 />
 <div className="flex gap-1.5">
 <button
 type="button"
 onClick={handleSaveCustom}
 className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1 rounded-md transition-colors shadow-2xs"
 >
 যোগ করুন
 </button>
 <button
 type="button"
 onClick={() => {
 setIsAddingNew(false);
 setCustomValue('');
 }}
 className="px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-1 rounded-md transition-colors"
 >
 বাতিল
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 );
});
