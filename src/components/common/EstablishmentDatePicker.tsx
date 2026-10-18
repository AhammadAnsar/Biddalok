import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, ChevronDown, Check, X, RotateCcw, Sparkles } from 'lucide-react';
import { toBengaliNumber, toEnglishNumber } from '../../utils/bengaliUtils';

interface EstablishmentDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  language?: 'bn' | 'en';
}

const MONTHS = [
  { value: '01', nameEn: 'January', nameBn: 'জানুয়ারি' },
  { value: '02', nameEn: 'February', nameBn: 'ফেব্রুয়ারি' },
  { value: '03', nameEn: 'March', nameBn: 'মার্চ' },
  { value: '04', nameEn: 'April', nameBn: 'এপ্রিল' },
  { value: '05', nameEn: 'May', nameBn: 'মে' },
  { value: '06', nameEn: 'June', nameBn: 'জুন' },
  { value: '07', nameEn: 'July', nameBn: 'জুলাই' },
  { value: '08', nameEn: 'August', nameBn: 'আগস্ট' },
  { value: '09', nameEn: 'September', nameBn: 'সেপ্টেম্বর' },
  { value: '10', nameEn: 'October', nameBn: 'অক্টোবর' },
  { value: '11', nameEn: 'November', nameBn: 'নভেম্বর' },
  { value: '12', nameEn: 'December', nameBn: 'ডিসেম্বর' },
];

const DECADES = [
  { labelBn: '২০২০-বর্তমান', labelEn: '2020s', startYear: 2026, defaultYear: 2020 },
  { labelBn: '২০১০-২০১৯', labelEn: '2010s', startYear: 2019, defaultYear: 2015 },
  { labelBn: '২০০০-২০০৯', labelEn: '2000s', startYear: 2009, defaultYear: 2000 },
  { labelBn: '১৯৯০-১৯৯৯', labelEn: '1990s', startYear: 1999, defaultYear: 1995 },
  { labelBn: '১৯৮০-১৯৮৯', labelEn: '1980s', startYear: 1989, defaultYear: 1985 },
  { labelBn: '১৯৭০-১৯৭৯', labelEn: '1970s', startYear: 1979, defaultYear: 1971 },
  { labelBn: '১৯৬০-১৯৬৯', labelEn: '1960s', startYear: 1969, defaultYear: 1965 },
  { labelBn: '১৯৫০ বা পূর্বে', labelEn: '1950 & earlier', startYear: 1959, defaultYear: 1950 },
];

export const EstablishmentDatePicker: React.FC<EstablishmentDatePickerProps> = ({
  value,
  onChange,
  language = 'bn',
}) => {
  const isBn = language === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= 1800; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear]);

  // Determine initial selection based on incoming value
  const parsed = useMemo(() => {
    const clean = toEnglishNumber(value || '').trim();
    if (!clean) {
      return { mode: 'year' as 'year' | 'full', year: '1995', month: '01', day: '01' };
    }
    const parts = clean.split(/[-/]/);
    if (parts.length === 1 && parts[0].length === 4) {
      return { mode: 'year' as 'year' | 'full', year: parts[0], month: '01', day: '01' };
    }
    if (parts.length >= 3) {
      // Could be YYYY-MM-DD or DD-MM-YYYY
      if (parts[0].length === 4) {
        return {
          mode: 'full' as 'year' | 'full',
          year: parts[0],
          month: parts[1].padStart(2, '0'),
          day: parts[2].padStart(2, '0'),
        };
      } else if (parts[2].length === 4) {
        return {
          mode: 'full' as 'year' | 'full',
          year: parts[2],
          month: parts[1].padStart(2, '0'),
          day: parts[0].padStart(2, '0'),
        };
      }
    }
    return { mode: 'year' as 'year' | 'full', year: clean.slice(0, 4) || '1995', month: '01', day: '01' };
  }, [value]);

  const [mode, setMode] = useState<'year' | 'full'>(parsed.mode);
  const [selectedYear, setSelectedYear] = useState<string>(parsed.year);
  const [selectedMonth, setSelectedMonth] = useState<string>(parsed.month);
  const [selectedDay, setSelectedDay] = useState<string>(parsed.day);

  // Sync internal state when popover opens or parsed changes
  useEffect(() => {
    if (isOpen) {
      setMode(parsed.mode);
      setSelectedYear(parsed.year);
      setSelectedMonth(parsed.month);
      setSelectedDay(parsed.day);
    }
  }, [isOpen, parsed]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute days in the selected year/month
  const maxDays = useMemo(() => {
    const y = parseInt(selectedYear, 10) || 1995;
    const m = parseInt(selectedMonth, 10) || 1;
    return new Date(y, m, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const daysList = useMemo(() => {
    const list: string[] = [];
    for (let d = 1; d <= maxDays; d++) {
      list.push(String(d).padStart(2, '0'));
    }
    return list;
  }, [maxDays]);

  // Live formatted result in standard ISO / English format
  const standardResult = useMemo(() => {
    if (mode === 'year') {
      return selectedYear;
    }
    const cleanDay = Math.min(parseInt(selectedDay, 10) || 1, maxDays);
    return `${selectedYear}-${selectedMonth}-${String(cleanDay).padStart(2, '0')}`;
  }, [mode, selectedYear, selectedMonth, selectedDay, maxDays]);

  // Bengali display representation for reassurance
  const bengaliDisplayPreview = useMemo(() => {
    if (mode === 'year') {
      return `${toBengaliNumber(selectedYear)} সন`;
    }
    const monthObj = MONTHS.find(m => m.value === selectedMonth);
    const monthName = isBn ? (monthObj?.nameBn || '') : (monthObj?.nameEn || '');
    return `${toBengaliNumber(selectedDay)} ${monthName}, ${toBengaliNumber(selectedYear)}`;
  }, [mode, selectedYear, selectedMonth, selectedDay, isBn]);

  const handleApply = () => {
    onChange(standardResult);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Direct typing handler with automatic conversion from Bengali numerals to English digits
  const handleDirectInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Convert Bengali numerals to English numerals
    const converted = toEnglishNumber(raw);
    // Allow only digits and date separators
    const cleaned = converted.replace(/[^0-9\-/]/g, '').slice(0, 10);
    onChange(cleaned);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Input row */}
      <div className="relative rounded-xl shadow-sm flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>

        <input
          type="text"
          placeholder={isBn ? 'যেমন: 1995 অথবা 1995-01-01' : 'e.g. 1995 or 1995-01-01'}
          value={value}
          onChange={handleDirectInputChange}
          className="w-full pl-10 pr-24 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono"
        />

        {/* Quick Picker Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute right-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
            isOpen 
              ? 'bg-indigo-600 text-white' 
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
          }`}
          title={isBn ? 'ক্যালেন্ডার ও সাল সহজে নির্বাচন করুন' : 'Open Easy Date/Year Picker'}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isBn ? 'সহজে নির্বাচন' : 'Picker'}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Helper text & standard format badge */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px]">
        <p className="text-slate-500">
          {isBn 
            ? 'মানসম্মত ফরম্যাট: YYYY (যেমন: 1995) অথবা YYYY-MM-DD' 
            : 'Standard format: YYYY (e.g. 1995) or YYYY-MM-DD'}
        </p>
        {value.trim() && (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>{isBn ? `বাংলা ভিউ: ${toBengaliNumber(value)}` : `Bn: ${toBengaliNumber(value)}`}</span>
          </span>
        )}
      </div>

      {/* Popover / Modal Card */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold">
                {isBn ? 'প্রতিষ্ঠিত সন / তারিখ নির্বাচন' : 'Select Establishment Date / Year'}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('year')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'year' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'শুধু সাল / সন (Year Only)' : 'Year Only'}
            </button>
            <button
              type="button"
              onClick={() => setMode('full')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'full' 
                  ? 'bg-white text-indigo-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isBn ? 'পূর্ণ তারিখ (Full Date)' : 'Full Date'}
            </button>
          </div>

          {/* Decade Jump Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-600 block">
              {isBn ? 'দ্রুত দশক জাম্প (Quick Decades):' : 'Quick Decade Jumps:'}
            </label>
            <div className="flex flex-wrap gap-1">
              {DECADES.map(d => (
                <button
                  key={d.labelEn}
                  type="button"
                  onClick={() => setSelectedYear(String(d.defaultYear))}
                  className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all ${
                    parseInt(selectedYear, 10) >= d.defaultYear - 5 && parseInt(selectedYear, 10) <= d.startYear
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {isBn ? d.labelBn : d.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Selection Selects: Year, Month, Day */}
          <div className={`grid gap-2.5 ${mode === 'full' ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {/* Year Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                {isBn ? 'সাল / বছর' : 'Year'}
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {yearsList.map(y => (
                    <option key={y} value={String(y)}>
                      {y} ({toBengaliNumber(y)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month & Day (only in full mode) */}
            {mode === 'full' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {isBn ? 'মাস' : 'Month'}
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="w-full px-2 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.value} - {isBn ? m.nameBn : m.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    {isBn ? 'দিন' : 'Day'}
                  </label>
                  <select
                    value={selectedDay}
                    onChange={e => setSelectedDay(e.target.value)}
                    className="w-full px-2 py-2 text-xs font-bold border border-slate-300 rounded-xl bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {daysList.map(d => (
                      <option key={d} value={d}>
                        {d} ({toBengaliNumber(d)})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Formatted Preview Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {isBn ? 'ডাটাবেজ স্ট্যান্ডার্ড ফরম্যাট:' : 'Standard Storage Format:'}
              </span>
              <strong className="font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {standardResult}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {isBn ? 'বাংলায় ভিউ:' : 'Bengali View:'}
              </span>
              <span className="font-bold text-slate-800">
                {bengaliDisplayPreview}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isBn ? 'মুছে ফেলুন' : 'Clear'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="ml-auto px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isBn ? 'নির্ধারণ করুন' : 'Apply'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
