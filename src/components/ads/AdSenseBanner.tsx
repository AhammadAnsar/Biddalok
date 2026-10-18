import React, { useEffect, useRef, useState } from 'react';

interface AdSenseBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  minHeight?: number;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

/**
 * AdSenseBanner: Safe, Compliant AdSense Wrapper.
 * - AdSense Policy Compliant: labeled with "বিজ্ঞাপন" / "Advertisement".
 * - CLS Guard: Pre-allocates min-height to prevent layout jumps.
 * - Error-safe: Gracefully catches ad push errors without impacting app features.
 */
export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  slot = '1234567890', // Default slot, can be replaced by actual slot id from AdSense console
  format = 'auto',
  responsive = true,
  className = '',
  minHeight = 90,
  label = 'বিজ্ঞাপন (Advertisement)',
}) => {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Only execute on browser client
    if (typeof window === 'undefined') return;

    try {
      if (adRef.current && !adLoaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (err) {
      console.warn('AdSense notice: ad block or pending render', err);
      setHasError(true);
    }
  }, [adLoaded]);

  return (
    <div
      className={`biddalok-ad-container my-4 mx-auto text-center overflow-hidden transition-all ${className}`}
      style={{ minHeight: `${minHeight}px` }}
    >
      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-1 select-none">
        {label}
      </div>
      
      <div className="flex items-center justify-center bg-slate-100/50 rounded-lg border border-dashed border-slate-200 p-1 min-h-[90px]">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: `${minHeight}px` }}
          data-ad-client="ca-pub-6673594317291335"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? 'true' : 'false'}
        />
        
        {/* Subtle fallback in dev/adblocker mode to prevent jarring empty space */}
        {hasError && (
          <div className="text-[11px] text-slate-400 py-3">
            সহযোগিতায়: SoftDows ও NiceTrix ডিজিটাল সল্যুশন্স
          </div>
        )}
      </div>
    </div>
  );
};
