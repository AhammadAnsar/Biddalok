import React, { useState, useRef } from 'react';
import { X, RotateCcw, Check, Sliders, Image as ImageIcon, School, Eye, Type, Sparkles, CheckCircle2, FileText, Files } from 'lucide-react';
import {
  ScholarshipFormSettings,
  ScholarshipLogoType,
  ScholarshipFontFamily,
  ScholarshipFontSizePreset,
  ScholarshipPageLayoutMode,
  DEFAULT_SCHOLARSHIP_SETTINGS,
  saveScholarshipSettings,
} from '../types/scholarshipSettings';
import { Institution } from '../../../types';
import { ScholarshipLogoRenderer } from './ScholarshipLogoRenderer';
import { toast } from 'react-hot-toast';

interface ScholarshipLogoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ScholarshipFormSettings;
  institution: Institution;
  onSave: (updated: ScholarshipFormSettings) => void;
}

const BENGALI_FONT_OPTIONS: { id: ScholarshipFontFamily; name: string; nameBn: string; badge: string; desc: string }[] = [
  {
    id: 'Kalpurush',
    name: 'Kalpurush',
    nameBn: 'কালপুরুষ',
    badge: 'সরকারি আদর্শ',
    desc: 'বাংলাদেশ সরকারি সার্কুলার ও অফিসিয়াল নথিপত্রের জন্য সর্বাধিক নির্ভরযোগ্য আদর্শ ফন্ট।'
  },
  {
    id: 'SolaimanLipi',
    name: 'SolaimanLipi',
    nameBn: 'সোলাইমান লিপি',
    badge: 'মুদ্রণ ও প্রেস',
    desc: 'জাতীয় প্রকাশনা ও অফসেট প্রিন্টে অত্যন্ত স্বচ্ছ, নিখুঁত ও নান্দনিক বাংলা ফন্ট।'
  },
  {
    id: 'Hind Siliguri',
    name: 'Hind Siliguri',
    nameBn: 'হিন্দ শিলিগুড়ি',
    badge: 'আধুনিক স্ক্রিন',
    desc: 'কম্পিউটার ডিসপ্লে ও ডিজিটাল নথিপত্রে অত্যন্ত সুস্পষ্ট ও আধুনিক জ্যামিতিক ফন্ট।'
  },
  {
    id: 'Noto Sans Bengali',
    name: 'Noto Sans Bengali',
    nameBn: 'নোটো সান্স বাংলা',
    badge: 'গুগল স্ট্যান্ডার্ড',
    desc: 'আন্তর্জাতিক গুগল স্ট্যান্ডার্ড এবং সব অপারেটিং সিস্টেমে নির্ভুল রেন্ডারিং ফন্ট।'
  },
  {
    id: 'Noto Serif Bengali',
    name: 'Noto Serif Bengali',
    nameBn: 'নোটো সেরিফ বাংলা',
    badge: 'ক্লাসিক্যাল সেরিফ',
    desc: 'ঐতিহ্যবাহী প্রাতিষ্ঠানিক সনদ ও দলিলের জন্য মার্জিত ধ্রুপদী সেরিফ ফন্ট।'
  },
  {
    id: 'Siyam Rupali',
    name: 'Siyam Rupali',
    nameBn: 'সিয়াম রূপালী',
    badge: 'ট্রেডিশনাল',
    desc: 'প্রাতিষ্ঠানিক ও দীর্ঘদিনের প্রচলিত জনপ্রিয় অফিসিয়াল বাংলা ফন্ট।'
  },
];

export const ScholarshipLogoSettingsModal: React.FC<ScholarshipLogoSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  institution,
  onSave,
}) => {
  const [settings, setSettings] = useState<ScholarshipFormSettings>({ ...currentSettings });
  const [activeTab, setActiveTab] = useState<'typography' | 'logos' | 'header' | 'layout'>('typography');

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: 'left' | 'right'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (PNG, JPG, SVG, WebP) নির্বাচন করুন');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('ছবির সাইজ ৩ মেগাবাইট (3MB) এর কম হতে হবে');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (side === 'left') {
        setSettings((prev) => ({
          ...prev,
          leftLogoType: 'custom',
          leftCustomLogo: dataUrl,
        }));
      } else {
        setSettings((prev) => ({
          ...prev,
          rightLogoType: 'custom',
          rightCustomLogo: dataUrl,
        }));
      }
      toast.success(side === 'left' ? 'বাম পাশের লোগো আপলোড হয়েছে' : 'ডান পাশের লোগো আপলোড হয়েছে');
    };
    reader.readAsDataURL(file);
  };

  const applyPreset = (preset: ScholarshipFontSizePreset) => {
    if (preset === 'compact') {
      setSettings((prev) => ({
        ...prev,
        fontSizePreset: 'compact',
        tableFontSize: 10.0,
        rowPaddingY: 3.5,
        noticeFontSize: 10.0,
      }));
      toast.success('কমপ্যাক্ট লেআউট প্রিসেট প্রয়োগ করা হয়েছে');
    } else if (preset === 'standard') {
      setSettings((prev) => ({
        ...prev,
        fontSizePreset: 'standard',
        tableFontSize: 10.5,
        rowPaddingY: 4.5,
        noticeFontSize: 10.5,
      }));
      toast.success('স্ট্যান্ডার্ড সুষম লেআউট প্রয়োগ করা হয়েছে (A4 এর জন্য প্রস্তাবিত)');
    } else if (preset === 'large') {
      setSettings((prev) => ({
        ...prev,
        fontSizePreset: 'large',
        tableFontSize: 11.5,
        rowPaddingY: 5.5,
        noticeFontSize: 11.0,
      }));
      toast.success('স্পষ্ট ও বড় ফন্ট প্রিসেট প্রয়োগ করা হয়েছে');
    }
  };

  const handleSave = () => {
    saveScholarshipSettings(settings);
    onSave(settings);
    toast.success('ফরমের ফন্ট, লেআউট ও লোগো সেটিংস সংরক্ষিত হয়েছে');
    onClose();
  };

  const handleReset = () => {
    setSettings({ ...DEFAULT_SCHOLARSHIP_SETTINGS });
    toast.success('পূর্বনির্ধারিত স্ট্যান্ডার্ড সেটিংসে ফিরিয়ে নেওয়া হয়েছে');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">
                রাজস্ব বৃত্তি ফরম — ফন্ট, লেআউট ও লোগো সেটিংস
              </h3>
              <p className="text-[11px] text-slate-300">
                বাংলা ফন্ট নির্বাচন, টেবিল রো-হাইট, লেখার সাইজ ও প্রিন্ট অপটিমাইজেশন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 shrink-0 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('typography')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'typography'
                ? 'border-amber-600 text-amber-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>ফন্ট ও টেবিল রো সাইজ</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logos')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'logos'
                ? 'border-amber-600 text-amber-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>লোগো নির্বাচন ও আপলোড</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'header'
                ? 'border-amber-600 text-amber-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>শিরোনাম ও প্রতিষ্ঠান টেক্সট</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === 'layout'
                ? 'border-amber-600 text-amber-600 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>লেআউট ও সংযুক্তিসমূহ</span>
          </button>
        </div>

        {/* Live Mini Preview with Font & Table Display */}
        <div className="px-6 py-2.5 bg-amber-50/50 border-b border-amber-100 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Eye className="w-4 h-4 text-amber-600" />
              <span>লাইভ প্রিভিউ (ফন্ট: <span className="font-extrabold text-amber-800">{settings.fontFamily}</span> | সাইজ: <span className="font-mono">{settings.tableFontSize}px</span> | রো প্যাডিং: <span className="font-mono">{settings.rowPaddingY}px</span>):</span>
            </div>
          </div>
          
          <div className="bg-white border border-slate-300 rounded-lg p-2 shadow-xs">
            <table
              className="w-full border-collapse border border-black leading-tight text-center"
              style={{
                fontFamily: `'${settings.fontFamily}', 'SolaimanLipi', sans-serif`,
                fontSize: `${settings.tableFontSize}px`,
              }}
            >
              <tbody>
                <tr>
                  <td
                    className="border border-black px-3 font-semibold bg-slate-50 text-slate-800 align-middle w-1/4"
                    style={{ paddingTop: `${settings.rowPaddingY}px`, paddingBottom: `${settings.rowPaddingY}px` }}
                  >
                    বৃত্তির পরীক্ষা ও ধরণ*
                  </td>
                  <td
                    className="border border-black px-3 font-bold text-black align-middle w-1/4"
                    style={{ paddingTop: `${settings.rowPaddingY}px`, paddingBottom: `${settings.rowPaddingY}px` }}
                  >
                    এসএসসি (SSC) • মেধাবৃত্তি
                  </td>
                  <td
                    className="border border-black px-3 font-semibold bg-slate-50 text-slate-800 align-middle w-1/4"
                    style={{ paddingTop: `${settings.rowPaddingY}px`, paddingBottom: `${settings.rowPaddingY}px` }}
                  >
                    শিক্ষার্থীর নাম (বাংলা)*
                  </td>
                  <td
                    className="border border-black px-3 font-bold text-black align-middle w-1/4"
                    style={{ paddingTop: `${settings.rowPaddingY}px`, paddingBottom: `${settings.rowPaddingY}px` }}
                  >
                    হাবিবুর রহমান (HABIBUR RAHMAN)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/40 custom-scrollbar">
          
          {/* ----------------- 1. TYPOGRAPHY TAB ----------------- */}
          {activeTab === 'typography' && (
            <div className="space-y-6">
              
              {/* Presets Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">
                    এক-ক্লিকে দ্রুত সাইজ ও রো-হাইট প্রিসেট (A4 অপটিমাইজেশন):
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('compact')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.tableFontSize <= 9.8 && settings.rowPaddingY <= 4
                        ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>কমপ্যাক্ট (Compact)</span>
                      {settings.tableFontSize <= 9.8 && settings.rowPaddingY <= 4 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ফন্ট: ৯.৫px • প্যাডিং: ৩.৫px
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('standard')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.tableFontSize > 9.8 && settings.tableFontSize <= 11 && settings.rowPaddingY > 4 && settings.rowPaddingY <= 6
                        ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>স্ট্যান্ডার্ড (Standard)</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">প্রস্তাবিত</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ফন্ট: ১০.৫px • প্যাডিং: ৫.৫px (সুষম A4)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('large')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      settings.tableFontSize > 11 || settings.rowPaddingY > 6
                        ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 text-amber-950 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span>লার্জ ও স্পষ্ট (Large)</span>
                      {settings.tableFontSize > 11 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ফন্ট: ১১.৫px • প্যাডিং: ৬.৫px (উচ্চ পঠনযোগ্য)
                    </div>
                  </button>
                </div>
              </div>

              {/* Font Family Selection */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    বাংলা ফন্ট নির্বাচন (Bengali Typography)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    নির্বাচিত ফন্ট প্রিন্ট ও পিডিএফ ফাইলে প্রয়োগ হবে
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {BENGALI_FONT_OPTIONS.map((f) => {
                    const isSelected = settings.fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            fontFamily: f.id,
                          }))
                        }
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/20 text-amber-950 shadow-xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className="text-base font-bold text-slate-900"
                              style={{ fontFamily: `'${f.id}', sans-serif` }}
                            >
                              {f.nameBn}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {f.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mb-2">
                            {f.name}
                          </div>
                        </div>

                        <div
                          className="p-2 rounded-lg bg-slate-50/80 border border-slate-100 text-xs text-slate-800 line-clamp-2"
                          style={{ fontFamily: `'${f.id}', sans-serif` }}
                        >
                          গণপ্রজাতন্ত্রী বাংলাদেশ সরকার অনুমোদিত বিদ্যালয়।
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders for Precision Control */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
                  ফন্ট সাইজ ও টেবিল রো-হাইট সূক্ষ্ম নিয়ন্ত্রণ
                </h4>

                {/* Font Size Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      টেবিল লেখার ফন্ট সাইজ (Font Size):
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {settings.tableFontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="9.0"
                    max="12.5"
                    step="0.5"
                    value={settings.tableFontSize}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        tableFontSize: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>ছোট (9.0px)</span>
                    <span>স্ট্যান্ডার্ড (10.5px)</span>
                    <span>বড় ও স্পষ্ট (12.5px)</span>
                  </div>
                </div>

                {/* Row Padding / Height Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block">
                        টেবিল রো উচ্চতা / ভার্টিক্যাল প্যাডিং (Row Height / Padding):
                      </label>
                      <span className="text-[10px] text-slate-500">
                        রো-হাইট বাড়ালে লেখার অবস্থান সবসময় নিখুঁতভাবে সেন্টারে থাকবে
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {settings.rowPaddingY}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2.5"
                    max="7.0"
                    step="0.5"
                    value={settings.rowPaddingY}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        rowPaddingY: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>কমপ্যাক্ট (2.5px)</span>
                    <span>আদর্শ সুষম ফিল (4.5px)</span>
                    <span>প্রশস্ত (7.0px)</span>
                  </div>
                </div>

                {/* Notice & Declaration Font Size Slider */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block">
                        অঙ্গীকারনামা ও প্রমাণকের ফন্ট সাইজ (Declaration & Checklist Font Size):
                      </label>
                      <span className="text-[10px] text-emerald-700 font-medium">
                        প্রিন্ট কপিতে যুক্তবর্ণ স্পষ্ট ও সহজে পড়ার জন্য নূন্যতম ১০ পিটি (10 pt) নির্ধারিত
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                      {settings.noticeFontSize || 10.0} pt
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10.0"
                    max="12.5"
                    step="0.5"
                    value={settings.noticeFontSize || 10.0}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        noticeFontSize: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>স্ট্যান্ডার্ড স্পষ্ট (10.0 pt)</span>
                    <span>মাঝারি (11.0 pt)</span>
                    <span>বড় ও স্পষ্ট (12.5 pt)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- 2. LOGOS TAB ----------------- */}
          {activeTab === 'logos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Logo Configuration */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="font-bold text-sm text-slate-900">
                    বাম পাশের লোগো (Left Logo)
                  </div>
                  <ScholarshipLogoRenderer
                    type={settings.leftLogoType}
                    customUrl={settings.leftCustomLogo}
                    institution={institution}
                    height={38}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">
                    লোগোর উৎস নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'govt', label: 'বাংলাদেশ সরকার' },
                      { id: 'pm_trust', label: 'শিক্ষা সহায়তা ট্রাস্ট' },
                      { id: 'institution', label: 'প্রতিষ্ঠানের লোগো' },
                      { id: 'custom', label: 'কাস্টম ছবি' },
                      { id: 'none', label: 'লোগো ছাড়া (বন্ধ)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            leftLogoType: opt.id as ScholarshipLogoType,
                          }))
                        }
                        className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                          settings.leftLogoType === opt.id
                            ? 'bg-amber-50 border-amber-600 text-amber-800 ring-2 ring-amber-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {settings.leftLogoType === 'custom' && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-xs font-bold text-amber-900 block">
                      ডিভাইস থেকে কাস্টম ছবি আপলোড:
                    </span>
                    <input
                      type="file"
                      ref={leftFileInputRef}
                      onChange={(e) => handleFileUpload(e, 'left')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => leftFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      ছবি আপলোড করুন
                    </button>
                  </div>
                )}
              </div>

              {/* Right Logo Configuration */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="font-bold text-sm text-slate-900">
                    ডান পাশের লোগো (Right Logo)
                  </div>
                  <ScholarshipLogoRenderer
                    type={settings.rightLogoType}
                    customUrl={settings.rightCustomLogo}
                    institution={institution}
                    height={38}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 block">
                    লোগোর উৎস নির্বাচন করুন:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dshe', label: 'মাউশি (DSHE)' },
                      { id: 'board', label: 'শিক্ষা বোর্ড' },
                      { id: 'institution', label: 'প্রতিষ্ঠানের লোগো' },
                      { id: 'custom', label: 'কাস্টম ছবি' },
                      { id: 'none', label: 'লোগো ছাড়া (বন্ধ)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            rightLogoType: opt.id as ScholarshipLogoType,
                          }))
                        }
                        className={`px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                          settings.rightLogoType === opt.id
                            ? 'bg-amber-50 border-amber-600 text-amber-800 ring-2 ring-amber-500/20'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {settings.rightLogoType === 'custom' && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                    <span className="text-xs font-bold text-amber-900 block">
                      ডিভাইস থেকে কাস্টম ছবি আপলোড:
                    </span>
                    <input
                      type="file"
                      ref={rightFileInputRef}
                      onChange={(e) => handleFileUpload(e, 'right')}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => rightFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      ছবি আপলোড করুন
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------- 3. HEADER TAB ----------------- */}
          {activeTab === 'header' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                হেডার টাইটেল ও টেক্সট কাস্টমাইজেশন
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ১. শীর্ষ সরকার / মন্ত্রণালয় লাইন:
                  </label>
                  <input
                    type="text"
                    value={settings.headerGovtTitle}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headerGovtTitle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ২. অধিদপ্তর / কর্তৃপক্ষ লাইন:
                  </label>
                  <input
                    type="text"
                    value={settings.headerDirectorateTitle}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headerDirectorateTitle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, বাংলাদেশ, ঢাকা"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ৩. ফরমের নাম / ব্যাজ শিরোনাম:
                  </label>
                  <input
                    type="text"
                    value={settings.headerFormTitle}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headerFormTitle: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীর তথ্য বিবরণী ও যাচাই ফরম"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      হেডারে প্রতিষ্ঠানের নাম প্রদর্শন
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ফর্মের শীর্ষ ব্যানারে বিদ্যালয়ের নাম ও ঠিকানা দৃশ্যমান রাখবেন কিনা
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showInstitutionInHeader}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showInstitutionInHeader: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ----------------- 4. LAYOUT TAB ----------------- */}
          {activeTab === 'layout' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-800">
                লেআউট, পৃষ্ঠা বিন্যাস ও ছবির ঘর সেটিংস
              </h4>

              {/* Page Layout Mode Selector */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>ফরমের পৃষ্ঠা বিন্যাস:</span>
                  </label>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    {settings.pageLayoutMode === 'single' ? 'এক পাতায় (১ পাতা)' : 'দুই পাতায় (২ পাতা)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        pageLayoutMode: 'single',
                      }))
                    }
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      settings.pageLayoutMode === 'single'
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      settings.pageLayoutMode === 'single' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">এক পাতায় (১ পাতা)</span>
                        {settings.pageLayoutMode === 'single' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        সকল সেকশন ও ৫টি স্বাক্ষর ১ পাতায় আঁটানো। অঙ্গীকারনামা ও প্রমাণক সংক্ষেপিত।
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        pageLayoutMode: 'two_page',
                      }))
                    }
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      settings.pageLayoutMode === 'two_page'
                        ? 'bg-amber-50/80 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      settings.pageLayoutMode === 'two_page' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Files className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">দুই পাতায় (২ পাতা)</span>
                        {settings.pageLayoutMode === 'two_page' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        ১ম পাতায় মৌলিক ও ব্যাংক তথ্য এবং শিক্ষার্থী/অভিভাবক স্বাক্ষর। ২য় পাতায় প্রাতিষ্ঠানিক যাচাই, প্রমাণক ও সিল-স্বাক্ষর।
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Logo Height Slider */}
              <div className="space-y-2 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    লোগোর সাইজ / উচ্চতা:
                  </label>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {settings.logoHeight}px
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="76"
                  value={settings.logoHeight}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      logoHeight: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                  <span>ছোট (40px)</span>
                  <span>স্বাভাবিক (52px)</span>
                  <span>বড় (76px)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      শিক্ষার্থীর ছবি ও ছবির ফ্রেম
                    </div>
                    <div className="text-[11px] text-slate-500">
                      ফরমে ডান কোণে পাসপোর্ট সাইজ ছবির বক্স প্রদর্শন করা হবে
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showStudentPhoto}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showStudentPhoto: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      শিক্ষার্থী ও অভিভাবকের অঙ্গীকারনামা
                    </div>
                    <div className="text-[11px] text-slate-500">
                      স্বাক্ষরের পূর্বে শিক্ষার্থীর সত্যতা স্বীকারোক্তি ও প্রত্যয়ন টেক্সট
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showDeclaration}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showDeclaration: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-800">
                      প্রমাণক নথিপত্রের নির্দেশিকা ও সংযুক্তি তালিকা
                    </div>
                    <div className="text-[11px] text-slate-500">
                      জন্মনিবন্ধন, এনআইডি, গেজেট ইত্যাদির রিকোয়ারমেন্ট বক্স
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showChecklistNotice}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showChecklistNotice: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>পূর্বাবস্থায় ফেরান</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-900/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>সংরক্ষণ করুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
