import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Check, Search, X, Edit2 } from 'lucide-react';
import { LocationItem } from '../constants/bdLocations';

interface LocationSelectProps {
  options: LocationItem[];
  value: string;
  currentTextValue?: string;
  onChange: (value: string, nameBnOrEn?: string) => void;
  onAdd: (name: string, nameBn: string) => void;
  placeholder: string;
  disabled?: boolean;
  language: 'en' | 'bn';
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  options = [],
  value,
  currentTextValue,
  onChange,
  onAdd,
  placeholder,
  disabled = false,
  language
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isCustomTyping, setIsCustomTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customText, setCustomText] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameBn, setNewNameBn] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    if (!value) return null;
    return options.find(o => o.id === value || o.name === value || o.nameBn === value);
  }, [options, value]);

  const displayValue = selectedOption 
    ? (language === 'bn' && selectedOption.nameBn ? selectedOption.nameBn : selectedOption.name)
    : currentTextValue || (value && !value.includes('_') ? value : '');

  // Filter options quickly
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(o => 
      (o.name && o.name.toLowerCase().includes(term)) || 
      (o.nameBn && o.nameBn.includes(term))
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsAdding(false);
        setIsCustomTyping(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = () => {
    const enName = newNameEn.trim();
    const bnName = newNameBn.trim() || enName;
    if (enName || bnName) {
      onAdd(enName || bnName, bnName || enName);
      setNewNameEn('');
      setNewNameBn('');
      setIsAdding(false);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleApplyCustomText = () => {
    if (customText.trim()) {
      onChange('', customText.trim());
      setIsCustomTyping(false);
      setIsOpen(false);
      setCustomText('');
    }
  };

  if (isCustomTyping) {
    return (
      <div className="relative flex items-center gap-1.5" ref={wrapperRef}>
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-indigo-400 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-slate-800"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApplyCustomText();
            } else if (e.key === 'Escape') {
              setIsCustomTyping(false);
            }
          }}
        />
        <button
          type="button"
          onClick={handleApplyCustomText}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors shadow-xs"
        >
          {language === 'bn' ? 'ঠিক' : 'OK'}
        </button>
        <button
          type="button"
          onClick={() => setIsCustomTyping(false)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className={`w-full px-3 py-2 border rounded-lg flex justify-between items-center bg-white select-none transition-all ${
          disabled 
            ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-75' 
            : 'border-slate-300 cursor-pointer hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500 shadow-xs'
        }`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchTerm('');
            setIsAdding(false);
          }
        }}
      >
        <span className={`truncate text-sm ${displayValue ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-hidden flex flex-col min-w-[220px]">
          {/* Quick search */}
          {!isAdding && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/90 sticky top-0 z-10 flex gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'খুঁজুন বা ফিল্টার করুন...' : 'Search or filter...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-50 max-h-44">
            {filteredOptions.map(option => {
              const isSelected = value === option.id || displayValue === option.name || displayValue === option.nameBn;
              return (
                <div
                  key={option.id}
                  className={`px-3.5 py-2 cursor-pointer hover:bg-slate-50 flex justify-between items-center text-sm transition-colors ${
                    isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                  }`}
                  onClick={() => {
                    onChange(option.id, option.nameBn || option.name);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <span className="truncate">{language === 'bn' && option.nameBn ? option.nameBn : option.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                </div>
              );
            })}
            
            {filteredOptions.length === 0 && !isAdding && (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">
                {language === 'bn' ? 'কোন অপশন পাওয়া যায়নি' : 'No matching options found'}
              </div>
            )}
          </div>

          {/* Add custom option or Direct Type footer */}
          {!isAdding ? (
            <div className="p-1.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-1 text-xs">
              <button
                type="button"
                className="flex-1 py-1.5 px-2 hover:bg-indigo-50 text-indigo-600 rounded font-semibold flex items-center justify-center gap-1 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAdding(true);
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'নতুন যোগ করুন' : 'Add New'}</span>
              </button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <button
                type="button"
                className="flex-1 py-1.5 px-2 hover:bg-slate-100 text-slate-600 rounded font-medium flex items-center justify-center gap-1 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomText(displayValue);
                  setIsCustomTyping(true);
                  setIsOpen(false);
                }}
              >
                <Edit2 className="w-3 h-3" />
                <span>{language === 'bn' ? 'সরাসরি লিখুন' : 'Type Directly'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2 text-xs" onClick={e => e.stopPropagation()}>
              <div>
                <label className="font-semibold text-slate-700 mb-0.5 block">
                  {language === 'bn' ? 'নাম (বাংলা বা ইংরেজি) *' : 'Name (Bangla or English) *'}
                </label>
                <input 
                  type="text" 
                  value={newNameBn}
                  onChange={e => setNewNameBn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  placeholder="যেমন: নাঙ্গলকোট / Nangalkot"
                  autoFocus
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 mb-0.5 block">
                  {language === 'bn' ? 'ইংরেজি নাম (ঐচ্ছিক)' : 'English Name (Optional)'}
                </label>
                <input 
                  type="text" 
                  value={newNameEn}
                  onChange={e => setNewNameEn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                  placeholder="e.g. Nangalkot"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button 
                  type="button" 
                  onClick={handleAdd}
                  disabled={!newNameBn.trim() && !newNameEn.trim()}
                  className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {language === 'bn' ? 'সংরক্ষণ' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
