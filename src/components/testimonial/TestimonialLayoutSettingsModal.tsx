import React, { useState, useEffect } from 'react';
import { 
  X, 
  RotateCcw, 
  Sliders, 
  Type, 
  Image as ImageIcon, 
  UserCheck, 
  Layout, 
  Save 
} from 'lucide-react';
import { TestimonialSettings, StaffMember, Institution } from '../../types';
import { DEFAULT_BOARD_TESTIMONIAL_SETTINGS } from '../../types/testimonial';

interface TestimonialLayoutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TestimonialSettings;
  onUpdateSettings: (newSettings: Partial<TestimonialSettings>) => void;
  staffList?: StaffMember[];
  institution?: Institution | null;
}

export const TestimonialLayoutSettingsModal: React.FC<TestimonialLayoutSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  staffList = [],
  institution,
}) => {
  const [localSettings, setLocalSettings] = useState<TestimonialSettings>({
    ...DEFAULT_BOARD_TESTIMONIAL_SETTINGS,
    ...settings,
  });

  useEffect(() => {
    if (isOpen && settings) {
      setLocalSettings({
        ...DEFAULT_BOARD_TESTIMONIAL_SETTINGS,
        ...settings,
      });
    }
  }, [isOpen, settings]);

  const [activeTab, setActiveTab] = useState<'margins' | 'typography' | 'signatory' | 'frame'>('margins');

  if (!isOpen) return null;

  const handleChange = <K extends keyof TestimonialSettings>(key: K, value: TestimonialSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleResetToDefault = () => {
    setLocalSettings({ ...DEFAULT_BOARD_TESTIMONIAL_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg leading-tight">প্রশংসাপত্র ফরম্যাট ও মার্জিন সেটিংস</h3>
              <p className="text-emerald-100 text-xs mt-0.5">লেআউট, টাইপোগ্রাফি, ফ্রেম মার্জিন ও স্বাক্ষর কনফিগারেশন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('margins')}
            className={`px-4 py-2 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'margins'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            মার্জিন ও জ্যামিতি
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`px-4 py-2 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'typography'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            টাইপোগ্রাফি ও রং
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signatory')}
            className={`px-4 py-2 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'signatory'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            স্বাক্ষর ও চেকিং ব্লক
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('frame')}
            className={`px-4 py-2 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'frame'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            লোগো, ফ্রেম ও ওয়াটারমার্ক
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: MARGINS */}
          {activeTab === 'margins' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 leading-relaxed">
                <strong>ডায়নামিক ফ্রেম মার্জিন নীতি:</strong> আপনি পেজের চারপাশের মার্জিন কমালে বা বাড়ালে ফ্রেম ও ভেতরের বিষয়বস্তু নিখুঁতভাবে রি-স্কেল হবে। ব্রাউজার প্রিভিউ ও প্রিন্ট উভয়েই সমভাবে প্রদর্শিত হবে।
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">পেজের বাইরের মার্জিন (কাগজের কিনারা থেকে ফ্রেমের দূরত্ব)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      উপরের মার্জিন: {localSettings.pageMarginTop ?? 0.35} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.8"
                      step="0.05"
                      value={localSettings.pageMarginTop ?? 0.35}
                      onChange={(e) => handleChange('pageMarginTop', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      নিচের মার্জিন: {localSettings.pageMarginBottom ?? 0.35} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.8"
                      step="0.05"
                      value={localSettings.pageMarginBottom ?? 0.35}
                      onChange={(e) => handleChange('pageMarginBottom', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      বাম মার্জিন: {localSettings.pageMarginLeft ?? 0.35} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.8"
                      step="0.05"
                      value={localSettings.pageMarginLeft ?? 0.35}
                      onChange={(e) => handleChange('pageMarginLeft', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ডান মার্জিন: {localSettings.pageMarginRight ?? 0.35} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.8"
                      step="0.05"
                      value={localSettings.pageMarginRight ?? 0.35}
                      onChange={(e) => handleChange('pageMarginRight', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2">ফ্রেমের ভেতরের প্যাডিং (বর্ডার থেকে লেখার দূরত্ব)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ভেতরের উপর প্যাডিং: {localSettings.frameInnerPaddingTop ?? 0.28} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.10"
                      max="0.60"
                      step="0.02"
                      value={localSettings.frameInnerPaddingTop ?? 0.28}
                      onChange={(e) => handleChange('frameInnerPaddingTop', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ভেতরের নিচ প্যাডিং: {localSettings.frameInnerPaddingBottom ?? 0.28} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.10"
                      max="0.60"
                      step="0.02"
                      value={localSettings.frameInnerPaddingBottom ?? 0.28}
                      onChange={(e) => handleChange('frameInnerPaddingBottom', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ভেতরের বাম প্যাডিং: {localSettings.frameInnerPaddingLeft ?? 0.35} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.60"
                      step="0.02"
                      value={localSettings.frameInnerPaddingLeft ?? 0.35}
                      onChange={(e) => handleChange('frameInnerPaddingLeft', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ভেতরের ডান প্যাডিং: {localSettings.frameInnerPaddingRight ?? 0.35} ইঞ্চি
                    </label>
                    <input
                      type="range"
                      min="0.15"
                      max="0.60"
                      step="0.02"
                      value={localSettings.frameInnerPaddingRight ?? 0.35}
                      onChange={(e) => handleChange('frameInnerPaddingRight', parseFloat(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    প্রতিষ্ঠানের নাম ফন্ট সাইজ: {localSettings.instNameFontSize ?? 28} পিক্সেল
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="36"
                    step="1"
                    value={localSettings.instNameFontSize ?? 28}
                    onChange={(e) => handleChange('instNameFontSize', parseInt(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    প্রতিষ্ঠানের নাম রং
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.instNameColor || '#15803d'}
                      onChange={(e) => handleChange('instNameColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <span className="font-mono font-semibold text-slate-700">
                      {localSettings.instNameColor || '#15803d'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    প্রশংসাপত্র টাইটেল সাইজ: {localSettings.titleFontSize ?? 26} পিক্সেল
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="34"
                    step="1"
                    value={localSettings.titleFontSize ?? 26}
                    onChange={(e) => handleChange('titleFontSize', parseInt(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    প্রশংসাপত্র টাইটেল রং
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={localSettings.titleColor || '#dc2626'}
                      onChange={(e) => handleChange('titleColor', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <span className="font-mono font-semibold text-slate-700">
                      {localSettings.titleColor || '#dc2626'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    মূল বডি লেখার সাইজ: {localSettings.bodyFontSize ?? 15.5} পিক্সেল
                  </label>
                  <input
                    type="range"
                    min="13"
                    max="19"
                    step="0.5"
                    value={localSettings.bodyFontSize ?? 15.5}
                    onChange={(e) => handleChange('bodyFontSize', parseFloat(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    লাইন হাইট (ডটেড আন্ডারলাইনের ব্যবধান): {localSettings.bodyLineHeight ?? 2.3}
                  </label>
                  <input
                    type="range"
                    min="1.8"
                    max="2.8"
                    step="0.1"
                    value={localSettings.bodyLineHeight ?? 2.3}
                    onChange={(e) => handleChange('bodyLineHeight', parseFloat(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIGNATORY */}
          {activeTab === 'signatory' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  স্বাক্ষরকারী শিক্ষক বা প্রধান শিক্ষক নির্বাচন (ডাটাবেজ থেকে)
                </label>
                <select
                  value={localSettings.signatoryStaffId || ''}
                  onChange={(e) => {
                    const staffId = e.target.value;
                    const staff = staffList.find(s => s.id === staffId);
                    handleChange('signatoryStaffId', staffId);
                    if (staff) {
                      handleChange('signatoryName', staff.name || '');
                      handleChange('signatoryNameBn', staff.nameBn || staff.name || '');
                      handleChange('signatoryTitle', staff.designation || institution?.headmasterTitle || 'Head Teacher');
                      handleChange('signatoryTitleBn', staff.designationBn || institution?.headmasterTitleBn || 'প্রধান শিক্ষক');
                    } else if (institution) {
                      handleChange('signatoryName', institution.headmasterName || '');
                      handleChange('signatoryNameBn', institution.headmasterNameBn || '');
                      handleChange('signatoryTitle', institution.headmasterTitle || 'Head Teacher');
                      handleChange('signatoryTitleBn', institution.headmasterTitleBn || 'প্রধান শিক্ষক');
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="">স্বয়ংক্রিয় (প্রতিষ্ঠান প্রধান / প্রধান শিক্ষক ডাটাবেজ)</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.nameBn ? `(${s.nameBn})` : ''} — {s.designation} {s.designationBn ? `[${s.designationBn}]` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  প্রতিষ্ঠান সেটিংস বা শিক্ষক ডাটাবেজ থেকে স্বয়ংক্রিয়ভাবে ইংরেজি ও বাংলা পদবি ম্যাপিং হবে।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    স্বাক্ষরকারীর নাম (English)
                  </label>
                  <input
                    type="text"
                    value={localSettings.signatoryName || ''}
                    onChange={(e) => handleChange('signatoryName', e.target.value)}
                    placeholder={institution?.headmasterName || "e.g. Md. Jahangir Alam Bhuiyan"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    স্বাক্ষরকারীর নাম (বাংলা)
                  </label>
                  <input
                    type="text"
                    value={localSettings.signatoryNameBn || ''}
                    onChange={(e) => handleChange('signatoryNameBn', e.target.value)}
                    placeholder={institution?.headmasterNameBn || "যেমন: মোঃ জাহাঙ্গীর আলম ভূঁইয়া"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    স্বাক্ষরকারীর পদবি (English - ইংরেজি প্রশংসাপত্রের জন্য)
                  </label>
                  <input
                    type="text"
                    value={localSettings.signatoryTitle || ''}
                    onChange={(e) => handleChange('signatoryTitle', e.target.value)}
                    placeholder={institution?.headmasterTitle || "Head Teacher"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    স্বাক্ষরকারীর পদবি (বাংলা - বাংলা প্রশংসাপত্রের জন্য)
                  </label>
                  <input
                    type="text"
                    value={localSettings.signatoryTitleBn || ''}
                    onChange={(e) => handleChange('signatoryTitleBn', e.target.value)}
                    placeholder={institution?.headmasterTitleBn || "প্রধান শিক্ষক"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.includeSignature ?? true}
                    onChange={(e) => handleChange('includeSignature', e.target.checked)}
                    className="rounded-sm border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">
                    ডিজিটাল প্রধান শিক্ষক স্বাক্ষর প্রদর্শন করুন
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showCheckingBlock ?? true}
                    onChange={(e) => handleChange('showCheckingBlock', e.target.checked)}
                    className="rounded-sm border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">
                    চেকিং ও ভেরিফিকেশন ব্লক প্রদর্শন করুন
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showQrCode ?? true}
                    onChange={(e) => handleChange('showQrCode', e.target.checked)}
                    className="rounded-sm border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">
                    ডিজিটাল ভেরিফিকেশন কিউআর কোড প্রদর্শন করুন
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: FRAME & WATERMARK */}
          {activeTab === 'frame' && (
            <div className="space-y-4">
              {/* Institution Database Logo Status */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {institution?.logoUrl || institution?.logo ? (
                      <img
                        src={institution.logoUrl || institution.logo}
                        alt="Institution Logo"
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-emerald-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-lg">
                        🏫
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-800 text-xs flex items-center gap-2">
                        <span>প্রতিষ্ঠানের লোগো (ডাটাবেজ ম্যাপিং)</span>
                        {institution?.logoUrl || institution?.logo ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full border border-emerald-200">
                            ডাটাবেজে যুক্ত আছে
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full border border-amber-200">
                            আপলোড করা নেই
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {institution?.logoUrl || institution?.logo
                          ? 'প্রতিষ্ঠান সেটিংস থেকে সংরক্ষিত লোগো স্বয়ংক্রিয়ভাবে প্রশংসাপত্রে প্রদর্শিত হচ্ছে।'
                          : 'প্রতিষ্ঠান সেটিংস মেনু থেকে লোগো আপলোড করলে এখানে স্বয়ংক্রিয়ভাবে কার্যকর হবে।'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logo Visibility & Size Controls */}
                <div className="pt-2.5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.showLogo ?? true}
                      onChange={(e) => handleChange('showLogo', e.target.checked)}
                      className="rounded-sm border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800">
                      শীর্ষে লোগো প্রদর্শন করুন
                    </span>
                  </label>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 text-[11px]">
                      লোগোর আকার: {localSettings.logoSize ?? 64} px
                    </label>
                    <input
                      type="range"
                      min="40"
                      max="96"
                      step="4"
                      value={localSettings.logoSize ?? 64}
                      onChange={(e) => handleChange('logoSize', parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Central Watermark Logo Toggle */}
              <label className="flex items-center gap-2 cursor-pointer p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={localSettings.showWatermarkLogo ?? true}
                  onChange={(e) => handleChange('showWatermarkLogo', e.target.checked)}
                  className="rounded-sm border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    প্রশংসাপত্রের মাঝে হালকা জলছাপ (Watermark Logo) প্রদর্শন
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    অফিসিয়াল বোর্ডের প্রশংসাপত্রের মতো সনদের মাঝখানে ৪% অস্বচ্ছতায় লোগো প্রদর্শিত হবে
                  </span>
                </div>
              </label>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  কাস্টম ফ্রেম ছবি লিংক (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={localSettings.customFrameUrl || ''}
                  onChange={(e) => handleChange('customFrameUrl', e.target.value)}
                  placeholder="https://... বা ফাঁকা রেখে স্বয়ংক্রিয় মেডেলিয়ন বর্ডার ব্যবহার করুন"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  ফাঁকা রাখলে স্বয়ংক্রিয়ভাবে ভেক্টর মেডেলিয়ন ফ্রেম কার্যকর হবে।
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ফুটার ক্রেডিট বা ওয়াটারমার্ক টেক্সট
                </label>
                <input
                  type="text"
                  value={localSettings.creditText || ''}
                  onChange={(e) => handleChange('creditText', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-slate-200">
                <input
                  type="checkbox"
                  checked={localSettings.showWatermarkCredit ?? true}
                  onChange={(e) => handleChange('showWatermarkCredit', e.target.checked)}
                  className="rounded-sm border-slate-300 text-emerald-700 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800">
                  নিচের ক্রেডিট ওয়াটারমার্ক প্রদর্শন করুন
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>সেভ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
