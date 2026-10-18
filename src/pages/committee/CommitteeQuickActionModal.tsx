import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, FileText, CheckCircle2, 
  Users, Printer, Send, Sparkles 
} from 'lucide-react';
import { CommitteeMeeting, CommitteeDecision, Institution, ManagingCommitteeInfo } from '../../types';

interface CommitteeQuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'notice' | 'session' | 'register' | 'resolution' | null;
  onSaveMeeting: (meeting: CommitteeMeeting) => void;
  onSaveDecision?: (decision: CommitteeDecision) => void;
  institution?: Institution | null;
  committee?: ManagingCommitteeInfo;
}

export const CommitteeQuickActionModal: React.FC<CommitteeQuickActionModalProps> = ({
  isOpen,
  onClose,
  actionType,
  onSaveMeeting,
  institution,
  committee
}) => {
  const [meetingNo, setMeetingNo] = useState('৯ম নিয়মিত সভা');
  const [meetingType, setMeetingType] = useState<'regular' | 'special' | 'urgent'>('regular');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('১১:০০');
  const [place, setPlace] = useState('বিদ্যালয়ের সভাকক্ষ');
  const [title, setTitle] = useState('বার্ষিক বাজেট পর্যালোচনা ও অবকাঠামো উন্নয়ন সংক্রান্ত');
  const [agendaText, setAgendaText] = useState('১. বিগত সভার কার্যবিবরণী পাঠ ও অনুমোদন\n২. ২০২৬ সালের অর্ধবার্ষিক বাজেট বরাদ্দ পর্যালোচনা\n৩. বিজ্ঞান গবেষণাগারের নতুন যন্ত্রপাতি সংস্থাপন\n৪. বিবিধ আলোচনা');
  const [attendeesCount, setAttendeesCount] = useState<number>(11);
  const [resolutionText, setResolutionText] = useState('উপস্থিত সকল সদস্যের সর্বসম্মত সিদ্ধান্তে আলোচ্যসূচির ২ ও ৩ নং প্রস্তাব অনুমোদন করা হলো এবং সদস্য সচিবকে পরবর্তী ১৫ কার্যদিবসের মধ্যে তা বাস্তবায়নের দায়িত্ব দেওয়া হলো।');

  if (!isOpen || !actionType) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const agendaArray = agendaText
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    const newMeeting: CommitteeMeeting = {
      id: `meet_${Date.now()}`,
      meetingNo,
      date,
      time,
      place,
      type: meetingType,
      title,
      agenda: agendaArray,
      attendeesCount: Number(attendeesCount) || 10,
      presidedBy: 'সভাপতি',
      recordedBy: 'প্রধান শিক্ষক ও সদস্য সচিব',
      resolutionNo: `বিউবি/রেজু/${new Date().getFullYear()}/${Math.floor(Math.random() * 90 + 10)}`,
      resolutionText: actionType === 'session' || actionType === 'resolution' ? resolutionText : undefined,
      status: actionType === 'notice' ? 'scheduled' : 'completed'
    };

    onSaveMeeting(newMeeting);
    onClose();
  };

  const getModalTitle = () => {
    switch (actionType) {
      case 'notice': return 'সভার নোটিশ তৈরি ও জারি';
      case 'session': return 'সভার অধিবেশন এন্ট্রি ও কার্যবিবরণী';
      case 'register': return 'নোটিশ ও রেজুলেশন রেজিস্টার রেকর্ড';
      case 'resolution': return 'অনুমোদিত রেজুলেশন তৈরি ও প্রিন্ট';
      default: return 'কুইক অ্যাকশন';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              কমিটি সভা ও সিদ্ধান্ত অ্যাকশন
            </span>
            <h3 className="text-base font-black text-slate-900 mt-0.5">
              {getModalTitle()}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সভার ক্রম / ধরন
              </label>
              <select
                value={meetingNo}
                onChange={e => setMeetingNo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none bg-white font-semibold"
              >
                <option value="৯ম নিয়মিত সভা">৯ম নিয়মিত সভা</option>
                <option value="১০ম নিয়মিত সভা">১০ম নিয়মিত সভা</option>
                <option value="১ম বিশেষ সভা">১ম বিশেষ সভা</option>
                <option value="জরুরি সভা">জরুরি সভা</option>
                <option value="বাজেট অধিবেশন সভা">বাজেট অধিবেশন সভা</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সভার তারিখ
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সভার সময়
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সভার স্থান
              </label>
              <input
                type="text"
                required
                value={place}
                onChange={e => setPlace(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              মূল বিষয় / শিরোনাম
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="যেমন: বিদ্যালয়ের বিজ্ঞানাগার আধুনিকীকরণ সংক্রান্ত"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              আলোচ্যসূচি / এজেন্ডা (প্রতি লাইনে একটি করে এজেন্ডা লিখুন)
            </label>
            <textarea
              rows={3}
              value={agendaText}
              onChange={e => setAgendaText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
            />
          </div>

          {(actionType === 'session' || actionType === 'resolution') && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপস্থিত সদস্য সংখ্যা (কোরাম যাচাই)
                </label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={attendeesCount}
                  onChange={e => setAttendeesCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গৃহীত সিদ্ধান্ত ও রেজুলেশন সারসংক্ষেপ
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={e => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </>
          )}

          {/* NOTIFICATION NOTE */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-[11px] text-emerald-800 leading-relaxed">
            শিক্ষা বোর্ডের বিধি মোতাবেক সভার নোটিশ জারি করার অন্তত ৭ দিন পূর্বে সকল সদস্যকে নোটিশ প্রেরণ করতে হবে। এটি স্বয়ংক্রিয়ভাবে কমিটির সভায় লিপিবদ্ধ হবে।
          </div>

          {/* FOOTER */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>সংরক্ষণ ও রেজিস্টার হালনাগাদ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
