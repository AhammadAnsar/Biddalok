import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer } from '../../hooks/useVirtualizer';
import { Layers, ArrowUp } from 'lucide-react';

export interface VirtualizedTableProps<T> {
 items: T[];
 renderRow: (item: T, index: number) => React.ReactNode;
 header: React.ReactNode;
 colSpan: number;
 estimatedRowHeight?: number;
 maxHeight?: string;
 emptyState?: React.ReactNode;
 containerClassName?: string;
 tableClassName?: string;
 overscan?: number;
 showScrollToTop?: boolean;
 virtualizationThreshold?: number; // Only activate virtualization if items.length exceeds this
}

export function VirtualizedTable<T>({
 items,
 renderRow,
 header,
 colSpan,
 estimatedRowHeight = 56,
 maxHeight = '620px',
 emptyState,
 containerClassName = '',
 tableClassName = '',
 overscan = 8,
 showScrollToTop = true,
 virtualizationThreshold = 20,
}: VirtualizedTableProps<T>) {
 const containerRef = useRef<HTMLDivElement>(null);
 const getScrollElement = useCallback(() => containerRef.current, []);

 const count = items.length;
 const isVirtual = count > virtualizationThreshold;

 const virtualizer = useVirtualizer({
 count: isVirtual ? count : 0,
 estimateSize: estimatedRowHeight,
 overscan,
 getScrollElement,
 });

 const [showTopBtn, setShowTopBtn] = useState(false);

 useEffect(() => {
 const el = containerRef.current;
 if (!el) return;
 const checkScroll = () => {
 setShowTopBtn(el.scrollTop > 300);
 };
 el.addEventListener('scroll', checkScroll, { passive: true });
 return () => el.removeEventListener('scroll', checkScroll);
 }, []);

 const scrollToTop = () => {
 if (containerRef.current) {
 containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
 }
 };

 if (count === 0 && emptyState) {
 return <>{emptyState}</>;
 }

 return (
 <div className="relative w-full">
 <div
 ref={containerRef}
 style={{
 maxHeight: maxHeight === 'none' ? undefined : maxHeight,
 overflowY: maxHeight === 'none' ? 'visible' : 'auto'
 }}
 className={`w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent ${containerClassName}`}
 >
 <table className={`w-full text-left border-collapse min-w-[850px] ${tableClassName}`}>
 <thead className="sticky top-0 z-20 shadow-xs bg-slate-50/95 backdrop-blur-xs">
 {header}
 </thead>
 <tbody className="divide-y divide-slate-100">
 {count === 0 ? (
 <tr>
 <td colSpan={colSpan} className="py-12 text-center text-slate-400">
 {emptyState || 'কোনো তথ্য পাওয়া যায়নি'}
 </td>
 </tr>
 ) : isVirtual ? (
 <>
 {virtualizer.paddingTop > 0 && (
 <tr aria-hidden="true" style={{ height: `${virtualizer.paddingTop}px` }}>
 <td
 colSpan={colSpan}
 style={{ height: `${virtualizer.paddingTop}px`, padding: 0, border: 0 }}
 />
 </tr>
 )}
 {virtualizer.virtualItems.map((virtualRow) => {
 const item = items[virtualRow.index];
 return (
 <React.Fragment key={virtualRow.index}>
 {renderRow(item, virtualRow.index)}
 </React.Fragment>
 );
 })}
 {virtualizer.paddingBottom > 0 && (
 <tr aria-hidden="true" style={{ height: `${virtualizer.paddingBottom}px` }}>
 <td
 colSpan={colSpan}
 style={{ height: `${virtualizer.paddingBottom}px`, padding: 0, border: 0 }}
 />
 </tr>
 )}
 </>
 ) : (
 items.map((item, index) => (
 <React.Fragment key={index}>{renderRow(item, index)}</React.Fragment>
 ))
 )}
 </tbody>
 </table>
 </div>

 {/* Floating Scroll to Top button when scrolled deep */}
 {showScrollToTop && showTopBtn && (
 <button
 onClick={scrollToTop}
 className="absolute bottom-4 right-4 z-30 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
 title="উপরে ফিরে যান"
 aria-label="Scroll to top"
 >
 <ArrowUp className="w-4 h-4" />
 </button>
 )}
 </div>
 );
}
