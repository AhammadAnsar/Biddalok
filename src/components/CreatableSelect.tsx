import React, { useState } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';

interface Props {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  onAddNew?: (newValue: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CreatableSelect: React.FC<Props> = ({
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

  // Combined options list without duplicates
  const allOptions = Array.from(new Set([...options, ...(value ? [value] : [])])).filter(Boolean);
  const filteredOptions = allOptions.filter(opt =>
    opt.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const handleSelect = (selectedVal: string) => {
    onChange(selectedVal);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customValue.trim()) return;
    const trimmed = customValue.trim();
    if (onAddNew) {
      onAddNew(trimmed);
    }
    onChange(trimmed);
    setCustomValue('');
    setIsAddingNew(false);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm cursor-pointer hover:border-slate-400 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
        }`}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
      >
        <span className={`block truncate ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 text-sm max-h-64 overflow-hidden flex flex-col animate-in fade-in-50 zoom-in-95">
          {/* Search input */}
          <div className="px-2.5 pb-1.5 pt-1 border-b border-slate-100">
            <input
              type="text"
              placeholder="খুঁজুন..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="w-full px-2.5 py-1 text-xs rounded-md border border-slate-200 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {/* Options list */}
          <div className="overflow-y-auto max-h-40 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt);
                  }}
                  className={`px-3 py-1.5 text-xs flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors ${
                    value === opt ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {value === opt && <Check size={14} className="text-indigo-600 flex-shrink-0" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">কোনো তথ্য পাওয়া যায়নি</div>
            )}
          </div>

          {/* Add custom value section */}
          <div className="border-t border-slate-100 p-1.5 bg-slate-50">
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
                  placeholder="নতুন তথ্য লিখুন..."
                  value={customValue}
                  onChange={e => setCustomValue(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-md border border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1 rounded-md transition-colors"
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
};
