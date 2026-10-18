import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2, Sparkles, Check, Image as ImageIcon } from 'lucide-react';
import { ManagingCommitteeMember, Institution } from '../../types';

interface CommitteeMemberSocialCardModalProps {
 isOpen: boolean;
 onClose: () => void;
 member: ManagingCommitteeMember | null;
 institution: Institution | null;
 committeeTerm?: string;
}

export const CommitteeMemberSocialCardModal: React.FC<CommitteeMemberSocialCardModalProps> = ({
 isOpen,
 onClose,
 member,
 institution,
 committeeTerm = ''
}) => {
 const canvasRef = useRef<HTMLCanvasElement | null>(null);
 const [downloading, setDownloading] = useState(false);
 const [copied, setCopied] = useState(false);

 useEffect(() => {
 if (!isOpen || !member || !canvasRef.current) return;

 const canvas = canvasRef.current;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;

 // Helper rounded rect
 const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
 ctx.beginPath();
 ctx.roundRect(x, y, w, h, r);
 };

 // Clear Canvas
 ctx.clearRect(0, 0, 1080, 1080);

 // 1. Dark Emerald Rich Background
 ctx.fillStyle = '#073f35';
 ctx.fillRect(0, 0, 1080, 1080);

 // Decorative Circular Glow / Vector Shape
 ctx.fillStyle = '#0b6653';
 ctx.beginPath();
 ctx.arc(1010, 70, 330, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#053129';
 ctx.beginPath();
 ctx.arc(80, 1000, 240, 0, Math.PI * 2);
 ctx.fill();

 // 2. White Card Container
 ctx.fillStyle = '#ffffff';
 roundRect(70, 70, 940, 940, 38);
 ctx.fill();

 // 3. Top Emerald Header Bar
 ctx.fillStyle = '#087b61';
 roundRect(70, 70, 940, 195, 38);
 ctx.fill();
 // Flat bottom for the header bar
 ctx.fillRect(70, 220, 940, 45);

 // Institution Name & EIIN in Header
 ctx.textAlign = 'center';
 ctx.fillStyle = '#ffffff';
 ctx.font = '700 46px "Hind Siliguri", Arial, sans-serif';
 const instName = institution?.nameBn || institution?.name || 'বিদ্যালোক উচ্চ বিদ্যালয়';
 ctx.fillText(instName.toUpperCase(), 540, 145);

 ctx.font = '500 24px "Hind Siliguri", Arial, sans-serif';
 ctx.fillStyle = '#d1f2e8';
 const subTitle = `ব্যবস্থাপনা কমিটি • মেয়াদকাল ${committeeTerm} • EIIN: ${institution?.eiin || '১০৫৪৬৭'}`;
 ctx.fillText(subTitle, 540, 190);

 // Function to draw member details after photo loading (or fallback)
 const drawDetailsAndDecorations = (imgElem?: HTMLImageElement) => {
 // Photo Outer Circle Frame
 ctx.save();
 ctx.fillStyle = '#eaf6f2';
 ctx.beginPath();
 ctx.arc(540, 410, 120, 0, Math.PI * 2);
 ctx.fill();

 if (imgElem) {
 ctx.beginPath();
 ctx.arc(540, 410, 112, 0, Math.PI * 2);
 ctx.clip();
 ctx.drawImage(imgElem, 428, 298, 224, 224);
 } else {
 // Initials or Icon fallback
 ctx.fillStyle = '#087b61';
 ctx.font = '700 68px "Hind Siliguri", Arial, sans-serif';
 const initials = (member.nameBn || member.name || 'সদস্য').slice(0, 2);
 ctx.fillText(initials, 540, 435);
 }
 ctx.restore();

 // Border ring around photo
 ctx.strokeStyle = '#087b61';
 ctx.lineWidth = 8;
 ctx.beginPath();
 ctx.arc(540, 410, 120, 0, Math.PI * 2);
 ctx.stroke();

 // Gold Accent Badge for Leadership
 if (member.role === 'president' || member.role === 'member_secretary') {
 ctx.strokeStyle = '#d97706';
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.arc(540, 410, 126, 0, Math.PI * 2);
 ctx.stroke();
 }

 // 4. Member Names
 ctx.textAlign = 'center';
 ctx.fillStyle = '#172522';
 ctx.font = '700 42px "Hind Siliguri", Arial, sans-serif';
 ctx.fillText(member.nameBn || member.name, 540, 595);

 if (member.name && member.nameBn && member.name !== member.nameBn) {
 ctx.fillStyle = '#64748b';
 ctx.font = '600 22px Arial, sans-serif';
 ctx.fillText(member.name.toUpperCase(), 540, 630);
 }

 // 5. Role & Designation
 ctx.fillStyle = '#087b61';
 ctx.font = '700 28px "Hind Siliguri", Arial, sans-serif';
 const roleText = member.roleTitleBn || member.roleBn || 'সদস্য, পরিচালনা পরিষদ';
 ctx.fillText(roleText, 540, 680);

 ctx.fillStyle = '#64748b';
 ctx.font = '500 22px "Hind Siliguri", Arial, sans-serif';
 const profText = member.profession ? `পেশা: ${member.profession}` : (member.designation || 'সম্মানিত সদস্য');
 ctx.fillText(profText, 540, 720);

 // Divider Line
 ctx.strokeStyle = '#e2e8f0';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(180, 770);
 ctx.lineTo(900, 770);
 ctx.stroke();

 // 6. Meta details row (Joining date, Contact, Education)
 ctx.fillStyle = '#334155';
 ctx.font = '600 22px "Hind Siliguri", Arial, sans-serif';
 const mobileClean = member.mobile ? `মোবাইল: ${member.mobile}` : '';
 const eduClean = member.educationalQualification ? `যোগ্যতা: ${member.educationalQualification}` : '';
 const lineDetails = [mobileClean, eduClean].filter(Boolean).join(' • ');
 ctx.fillText(lineDetails || 'শিক্ষা বোর্ড অনুমোদিত পরিচালনা পরিষদ', 540, 825);

 ctx.fillStyle = '#64748b';
 ctx.font = '500 19px "Hind Siliguri", Arial, sans-serif';
 ctx.fillText('মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড কর্তৃক অনুমোদিত বৈধ সদস্য', 540, 868);

 // 7. Bottom Branding Pill
 ctx.fillStyle = '#087b61';
 roundRect(360, 920, 360, 52, 26);
 ctx.fill();

 ctx.fillStyle = '#ffffff';
 ctx.font = '700 20px "Hind Siliguri", Arial, sans-serif';
 ctx.fillText('বিদ্যালোক শিক্ষা ব্যবস্থাপনা', 540, 953);
 };

 if (member.photo) {
 const img = new Image();
 img.crossOrigin = 'anonymous';
 img.onload = () => drawDetailsAndDecorations(img);
 img.onerror = () => drawDetailsAndDecorations();
 img.src = member.photo;
 } else {
 drawDetailsAndDecorations();
 }
 }, [isOpen, member, institution, committeeTerm]);

 if (!isOpen || !member) return null;

 const handleDownload = () => {
 if (!canvasRef.current) return;
 setDownloading(true);
 const canvas = canvasRef.current;
 const link = document.createElement('a');
 link.download = `committee-card-${(member.nameBn || member.name || 'member').replace(/\s+/g, '-')}.png`;
 link.href = canvas.toDataURL('image/png');
 link.click();
 setTimeout(() => setDownloading(false), 800);
 };

 const handleCopy = async () => {
 if (!canvasRef.current) return;
 try {
 canvasRef.current.toBlob(async (blob) => {
 if (blob && navigator.clipboard && window.ClipboardItem) {
 await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 });
 } catch {
 handleDownload();
 }
 };

 return (
 <div 
 className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 "
 onClick={onClose}
 >
 <div 
 className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col "
 onClick={e => e.stopPropagation()}
 >
 {/* HEADER */}
 <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/70">
 <div>
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
 সোশ্যাল মিডিয়া শেয়ারযোগ্য প্রোফাইল কার্ড
 </span>
 <h3 className="text-base font-black text-slate-900 mt-0.5">
 স্মার্ট প্রোফাইল কার্ড (১০৮০ × ১০৮০ HD)
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

 {/* CANVAS PREVIEW CONTAINER */}
 <div className="p-6 flex flex-col items-center bg-slate-100/70">
 <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
 <canvas
 ref={canvasRef}
 width={1080}
 height={1080}
 className="w-full h-full object-contain block"
 />
 </div>
 <p className="text-[11px] text-slate-500 mt-3 text-center">
 ফেসবুক, হোয়াটসঅ্যাপ বা প্রিন্টের জন্য উপযোগী পারফেক্ট ১:১ বর্গাকার ছবি
 </p>
 </div>

 {/* FOOTER ACTIONS */}
 <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
 <button
 type="button"
 onClick={handleCopy}
 className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
 >
 {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
 <span>{copied ? 'ক্লিপবোর্ডে কপি হয়েছে' : 'কার্ড কপি করুন'}</span>
 </button>

 <button
 type="button"
 onClick={handleDownload}
 disabled={downloading}
 className="px-5 py-2 text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-1.5"
 >
 <Download className="w-4 h-4" />
 <span>{downloading ? 'ডাউনলোড হচ্ছে...' : 'PNG ডাউনলোড করুন'}</span>
 </button>
 </div>
 </div>
 </div>
 );
};
