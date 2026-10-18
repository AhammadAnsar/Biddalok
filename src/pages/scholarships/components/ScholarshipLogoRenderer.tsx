import React from 'react';
import { ScholarshipLogoType } from '../types/scholarshipSettings';
import { Institution } from '../../../types';

interface ScholarshipLogoRendererProps {
  type: ScholarshipLogoType;
  customUrl?: string;
  institution?: Institution;
  height?: number; // e.g. 54
  onClick?: () => void;
  isEditable?: boolean;
  tooltip?: string;
}

export const ScholarshipLogoRenderer: React.FC<ScholarshipLogoRendererProps> = ({
  type,
  customUrl,
  institution,
  height = 54,
  onClick,
  isEditable = false,
  tooltip,
}) => {
  if (type === 'none') {
    return null;
  }

  const wrapperClass = `relative inline-flex flex-col items-center justify-center select-none ${
    isEditable ? 'cursor-pointer group transition-transform hover:scale-105' : ''
  }`;

  const renderLogoGraphic = () => {
    switch (type) {
      case 'govt':
        return (
          <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
            <svg
              style={{ width: `${height}px`, height: `${height}px` }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" stroke="#000000" strokeWidth="2.5" fill="#f8fafc" />
              <circle cx="50" cy="50" r="41" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
              {/* Shapla / Water Lily petals */}
              <path d="M50 22 C48 34 38 42 34 56 C44 56 48 44 50 36 C52 44 56 56 66 56 C62 42 52 34 50 22 Z" fill="#000000" />
              <path d="M50 38 C42 46 28 54 22 66 C34 66 44 56 50 48 C56 56 66 66 78 66 C72 54 58 46 50 38 Z" fill="#000000" opacity="0.85" />
              {/* Rice Sheaves */}
              <path d="M26 73 C38 78 62 78 74 73 C66 82 34 82 26 73 Z" fill="#000000" />
              {/* 4 Stars */}
              <polygon points="25,48 27,53 32,53 28,56 30,61 25,58 20,61 22,56 18,53 23,53" fill="#000000" transform="scale(0.7) translate(8, 8)" />
              <polygon points="75,48 77,53 82,53 78,56 80,61 75,58 70,61 72,56 68,53 73,53" fill="#000000" transform="scale(0.7) translate(30, 8)" />
            </svg>
            <span className="text-[7.5px] font-bold leading-tight mt-0.5 text-black whitespace-nowrap">
              বাংলাদেশ সরকার
            </span>
          </div>
        );

      case 'pm_trust':
        return (
          <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
            <svg
              style={{ width: `${height}px`, height: `${height}px` }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" stroke="#000000" strokeWidth="2.5" fill="#f8fafc" />
              <circle cx="50" cy="50" r="41" stroke="#000000" strokeWidth="1" strokeDasharray="2 2" />
              <path d="M50 22 C48 34 38 42 34 56 C44 56 48 44 50 36 C52 44 56 56 66 56 C62 42 52 34 50 22 Z" fill="#000000" />
              <path d="M50 38 C42 46 28 54 22 66 C34 66 44 56 50 48 C56 56 66 66 78 66 C72 54 58 46 50 38 Z" fill="#000000" opacity="0.85" />
              <path d="M26 73 C38 78 62 78 74 73 C66 82 34 82 26 73 Z" fill="#000000" />
            </svg>
            <span className="text-[7.5px] font-bold leading-tight mt-0.5 text-black whitespace-nowrap">
              শিক্ষা সহায়তা ট্রাস্ট
            </span>
          </div>
        );

      case 'dshe':
        return (
          <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
            <svg
              style={{ width: `${height}px`, height: `${height}px` }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" stroke="#000000" strokeWidth="2.5" fill="#f8fafc" />
              <circle cx="50" cy="50" r="41" stroke="#000000" strokeWidth="1" strokeDasharray="3 2" />
              {/* Open Book */}
              <path d="M50 56 Q36 48 24 53 L24 74 Q36 69 50 75 Q64 69 76 74 L76 53 Q64 48 50 56 Z" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <line x1="50" y1="56" x2="50" y2="75" stroke="#000000" strokeWidth="2" />
              {/* Torch of Knowledge */}
              <path d="M47 30 L53 30 L52 46 L48 46 Z" fill="#000000" />
              <path d="M50 20 Q56 24 53 29 Q50 32 47 29 Q44 24 50 20 Z" fill="#000000" />
              <line x1="50" y1="14" x2="50" y2="18" stroke="#000000" strokeWidth="1.5" />
              <line x1="40" y1="18" x2="43" y2="21" stroke="#000000" strokeWidth="1.5" />
              <line x1="60" y1="18" x2="57" y2="21" stroke="#000000" strokeWidth="1.5" />
            </svg>
            <span className="text-[7.5px] font-bold leading-tight mt-0.5 text-black whitespace-nowrap">
              মাউশি (DSHE)
            </span>
          </div>
        );

      case 'board':
        return (
          <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
            <svg
              style={{ width: `${height}px`, height: `${height}px` }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="46" stroke="#000000" strokeWidth="2" fill="#ffffff" />
              <circle cx="50" cy="50" r="38" stroke="#000000" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="28" stroke="#000000" strokeWidth="1" fill="#f8fafc" />
              {/* Lamp & Rays */}
              <path d="M42 55 L58 55 L54 65 L46 65 Z" fill="#000000" />
              <path d="M50 36 Q54 42 50 48 Q46 42 50 36 Z" fill="#000000" />
            </svg>
            <span className="text-[7.5px] font-bold leading-tight mt-0.5 text-black whitespace-nowrap">
              শিক্ষা বোর্ড
            </span>
          </div>
        );

      case 'institution': {
        const instLogo = institution?.logoUrl || institution?.logo;
        if (instLogo) {
          return (
            <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
              <img
                src={instLogo}
                alt="Institution Logo"
                crossOrigin="anonymous"
                style={{ maxHeight: `${height}px`, maxWidth: `${height + 20}px`, objectFit: 'contain' }}
              />
            </div>
          );
        }
        if (!isEditable) return null;
        return (
          <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
            <div
              style={{ width: `${height - 10}px`, height: `${height - 10}px` }}
              className="rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] font-bold text-slate-500"
            >
              লোগো
            </div>
          </div>
        );
      }

      case 'custom': {
        const customImage = customUrl || institution?.logoUrl || institution?.logo;
        if (customImage) {
          return (
            <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
              <img
                src={customImage}
                alt="Custom Logo"
                crossOrigin="anonymous"
                style={{ maxHeight: `${height}px`, maxWidth: `${height + 20}px`, objectFit: 'contain' }}
              />
            </div>
          );
        }
        if (!isEditable) return null;
        return (
          <div className="flex flex-col items-center justify-center" style={{ height: `${height}px` }}>
            <div
              style={{ width: `${height - 10}px`, height: `${height - 10}px` }}
              className="rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] font-bold text-slate-500"
            >
              আপলোড
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={wrapperClass} onClick={onClick} title={tooltip || (isEditable ? 'লোগো পরিবর্তন করতে ক্লিক করুন' : undefined)}>
      {renderLogoGraphic()}
      {isEditable && (
        <span className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-600 text-white rounded-full p-0.5 text-[8px] shadow-sm print:hidden">
          ✏️
        </span>
      )}
    </div>
  );
};
