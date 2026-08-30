import React, { useState } from 'react';
import { X, Search, FileText, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useAppStore } from '../store/useAppStore';
import { translations, TranslationKey } from '../locales';
import { Student } from '../types';

interface SmartImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (data: Partial<Student>) => void;
  onImportSuccess?: (data: Partial<Student>) => void;
}

const parseResultText = (text: string) => {
  const data: Partial<Student> = {};
  
  // Use regex to extract data from various formats
  const extract = (patterns: RegExp[]) => {
    for (const p of patterns) {
      const match = text.match(p);
      if (match && match[1]) return match[1].trim();
    }
    return '';
  };

  data.roll = extract([/(?:Roll|রোল)(?:\s*No\.?|\s*নং)?\s*[:\-]?\s*(\d+)/i]);
  data.registrationNo = extract([/(?:Registration|রেজিস্ট্রেশন)(?:\s*No\.?|\s*নং)?\s*[:\-]?\s*(\d+)/i, /Reg(?:\.|\s*No\.?)\s*[:\-]?\s*(\d+)/i]);
  data.name = extract([/(?:Name of Student|Student Name|Name|নাম|নিবন্ধিত ব্যক্তির নাম)\s*[:\-]?\s*([^\n]+)/i]);
  data.fatherName = extract([/(?:Father's Name|Father Name|পিতার নাম)\s*[:\-]?\s*([^\n]+)/i]);
  data.motherName = extract([/(?:Mother's Name|Mother Name|মাতার নাম)\s*[:\-]?\s*([^\n]+)/i]);
  data.board = extract([/(?:Board|বোর্ড)\s*[:\-]?\s*([^\n]+)/i]);
  data.group = extract([/(?:Group|বিভাগ)\s*[:\-]?\s*([^\n]+)/i]);
  data.session = extract([/(?:Session|শিক্ষাবর্ষ)\s*[:\-]?\s*(\d{4}-\d{4}|\d{4})/i]);
  
  const gpaStr = extract([/(?:Result|GPA|ফলাফল)\s*[:\-]?\s*GPA[\s=]*([\d.]+)/i, /(?:Result|GPA|ফলাফল)\s*[:\-]?\s*([\d.]+)/i]);
  if (gpaStr && gpaStr.match(/^\d\.\d+$/)) data.gpa = gpaStr;

  const dobStr = extract([/(?:Date of Birth|DOB|জন্ম তারিখ)\s*[:\-]?\s*([^\n]+)/i]);
  if (dobStr) {
    const dateMatch = dobStr.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
    if (dateMatch) {
      data.dateOfBirth = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
    } else {
      data.dateOfBirth = dobStr;
    }
  }
  
  const genderStr = extract([/(?:Gender|Sex|লিঙ্গ)\s*[:\-]?\s*([^\n]+)/i]);
  if (genderStr) {
    if (genderStr.match(/Male|পুরুষ/i)) data.gender = 'Male';
    else if (genderStr.match(/Female|নারী/i)) data.gender = 'Female';
    else data.gender = 'Other';
  }

  // Fallback line-by-line parsing if regex fails
  const normalized = text.replace(/[:\t]/g, '\n');
  const lines = normalized.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';
    
    if (!data.roll && (line === 'রোল নং' || line.toLowerCase() === 'roll no' || line.toLowerCase() === 'roll')) data.roll = nextLine;
    else if (!data.registrationNo && (line === 'রেজিস্ট্রেশন নং' || line.toLowerCase() === 'registration no' || line.toLowerCase() === 'reg no')) data.registrationNo = nextLine;
    else if (!data.name && (line === 'নাম' || line.toLowerCase() === 'name')) data.name = nextLine;
    else if (!data.fatherName && (line === 'পিতার নাম' || line.toLowerCase() === "father's name" || line.toLowerCase() === 'father name')) data.fatherName = nextLine;
    else if (!data.motherName && (line === 'মাতার নাম' || line.toLowerCase() === "mother's name" || line.toLowerCase() === 'mother name')) data.motherName = nextLine;
    else if (!data.board && (line === 'বোর্ড' || line.toLowerCase() === 'board')) data.board = nextLine;
    else if (!data.group && (line === 'বিভাগ' || line.toLowerCase() === 'group')) data.group = nextLine;
  }
  
  return data;
};

export const SmartImportModal: React.FC<SmartImportModalProps> = ({ isOpen, onClose, onImport, onImportSuccess }) => {
  const { language } = useAppStore();
  const isBn = language === 'bn';
  const t = (key: TranslationKey) => translations[language][key];
  
  const [pasteText, setPasteText] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [iframeUrl, setIframeUrl] = useState('https://eduboardresults.gov.bd/');
  const [addressInput, setAddressInput] = useState('https://eduboardresults.gov.bd/');

  const processImage = async (file: File) => {
    setIsOcrProcessing(true);
    setOcrProgress(0);
    try {
      const result = await Tesseract.recognize(
        file,
        'eng+ben', // requires both
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      setPasteText(prev => prev + (prev ? '\n' : '') + result.data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      alert(isBn ? "ছবি থেকে টেক্সট পড়া সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" : "Could not process image. Please try again.");
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handlePasteEvent = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImage(file);
        }
      }
    }
  };

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    let url = addressInput;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      setAddressInput(url);
    }
    setIframeUrl(url);
  };

  if (!isOpen) return null;

  const handleImport = () => {
    if (!pasteText.trim()) return;
    const parsedData = parseResultText(pasteText);
    const callback = onImport || onImportSuccess;
    if (callback) {
      callback(parsedData);
    }
    setPasteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" />
            {t('smartImport')}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Left Side: Browser iframe */}
          <div className="lg:w-7/12 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50">
            <div className="p-3 bg-slate-100 border-b border-slate-200 text-sm text-slate-600 flex justify-between items-center shadow-inner z-10">
              <form onSubmit={handleNavigate} className="flex-1 flex mr-3 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  placeholder={isBn ? "ওয়েবসাইট লিংক দিন (যেমন: https://everify.bdris.gov.bd/)" : "Enter URL (e.g., https://everify.bdris.gov.bd/)"}
                />
                <button type="submit" className="hidden">Go</button>
              </form>
              <a 
                href={iframeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded whitespace-nowrap"
              >
                {isBn ? 'নতুন ট্যাবে খুলুন' : 'Open in New Tab'}
              </a>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <iframe 
                src={iframeUrl} 
                className="w-full h-full absolute inset-0 border-none bg-white"
                title="Result Board"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>
          
          {/* Right Side: Paste & Extract */}
          <div className="lg:w-5/12 flex flex-col p-6 bg-slate-50 overflow-y-auto">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-indigo-800 mb-2 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> 
                {isBn ? 'অটো-ফিলের নিয়ম (যদি টেক্সট সিলেক্ট না হয়):' : 'Auto-Fill Instructions (OCR / Paste):'}
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-indigo-900 text-xs leading-relaxed">
                {isBn ? (
                  <>
                    <li>বামপাশের উইন্ডো থেকে রেজাল্টের স্ক্রিনশট নিন (<strong>Win+Shift+S</strong>)।</li>
                    <li>নিচের বক্সে মাউস রেখে <strong>Ctrl + V</strong> (পেস্ট) করুন।</li>
                    <li>সিস্টেম স্বয়ংক্রিয়ভাবে স্ক্রিনশট পড়ে তথ্য সংগ্রহ করবে (OCR)।</li>
                  </>
                ) : (
                  <>
                    <li>Take a screenshot of the results from the left window (<strong>Win+Shift+S</strong>).</li>
                    <li>Click inside the text area below and press <strong>Ctrl + V</strong> to paste.</li>
                    <li>The system will automatically recognize the image and extract student data (OCR).</li>
                  </>
                )}
              </ol>
            </div>
            
            <div className="flex gap-2 mb-3">
               <input type="file" accept="image/*" id="ocr-upload" className="hidden" onChange={handleImageUpload} />
               <label htmlFor="ocr-upload" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer w-full justify-center">
                 <Upload className="w-4 h-4 text-slate-500" />
                 {isBn ? 'ইমেজ আপলোড করুন (OCR)' : 'Upload Image (OCR)'}
               </label>
            </div>
            
            <div className="relative flex-1 flex flex-col">
              {isOcrProcessing && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg border border-indigo-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-sm font-medium text-indigo-900">
                    {isBn ? 'ইমেজ থেকে ডাটা সংগ্রহ করা হচ্ছে...' : 'Extracting data from image...'}
                  </p>
                  <div className="w-48 h-2 bg-indigo-100 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${ocrProgress}%` }}></div>
                  </div>
                </div>
              )}
              <textarea
                className="w-full flex-1 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm bg-white shadow-inner"
                placeholder={isBn ? "এখানে টেক্সট বা স্ক্রিনশট ইমেজ পেস্ট (Ctrl+V) করুন..." : "Paste copied text or screenshot image here (Ctrl+V)..."}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                onPaste={handlePasteEvent}
              />
            </div>
            
            <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors text-sm"
              >
                {t('close')}
              </button>
              <button 
                onClick={handleImport}
                disabled={!pasteText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
              >
                {t('extractData')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
