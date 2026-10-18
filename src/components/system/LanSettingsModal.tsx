import React, { useState, useEffect } from 'react';
import { Shield, Wifi, AlertTriangle, CheckCircle2, RefreshCw, X, Server, Lock } from 'lucide-react';
import { checkApiHealth, ApiHealthResponse } from '../../utils/apiClient';

interface LanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanSettingsModal: React.FC<LanSettingsModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lanEnabled, setLanEnabled] = useState(false);
  const [availableIps, setAvailableIps] = useState<{ name: string; ip: string }[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [toggleWarningVisible, setToggleWarningVisible] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const isDesk = Boolean((window as any).desktopApi?.isDesktop);
      setIsDesktop(isDesk);

      if (isDesk && (window as any).desktopApi?.server?.getLanStatus) {
        const lanStatus = await (window as any).desktopApi.server.getLanStatus();
        setLanEnabled(lanStatus.enabled);
        setAvailableIps(lanStatus.availableIps || []);
      }

      const h = await checkApiHealth();
      setHealth(h);
      if (!isDesk && h.lanEnabled !== undefined) {
        setLanEnabled(h.lanEnabled);
      }
    } catch (err) {
      setHealth({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleToggleLan = async () => {
    if (!lanEnabled && !toggleWarningVisible) {
      setToggleWarningVisible(true);
      return;
    }

    setLoading(true);
    try {
      const nextState = !lanEnabled;
      if (isDesktop && (window as any).desktopApi?.server?.toggleLan) {
        await (window as any).desktopApi.server.toggleLan(nextState);
      }
      setLanEnabled(nextState);
      setToggleWarningVisible(false);
      await fetchStatus();
    } catch (e) {
      console.error('Failed to toggle LAN:', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">নেটওয়ার্ক ও LAN সিকিউরিটি সেটিংস</h3>
              <p className="text-xs text-slate-500">Local Service &amp; Network Exposure Controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Real Service Health Status */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {health?.status === 'ok' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              )}
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {health?.status === 'ok' ? 'সার্ভিস সক্রিয় ও নিরাপদ' : 'সার্ভিস সংযোগ বিচ্ছিন্ন বা পোর্ট কনফ্লিক্ট'}
                </p>
                <p className="text-xs text-slate-500">
                  হোস্ট: <code className="text-blue-600 dark:text-blue-400">{health?.host || '127.0.0.1'}</code> : পোর্ট: 3000
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Loopback vs LAN status */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-indigo-500" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">LAN এক্সেস নিয়ন্ত্রণ</h4>
                  <p className="text-xs text-slate-500">
                    ডিফল্ট মোড: শুধু এই কম্পিউটারে সীমাবদ্ধ (127.0.0.1)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleLan}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  lanEnabled
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
                }`}
              >
                {lanEnabled ? 'LAN সক্রিয় (0.0.0.0)' : 'লুপব্যাক মোড (127.0.0.1)'}
              </button>
            </div>

            {/* Warning if LAN requested */}
            {toggleWarningVisible && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
                <div className="flex items-start gap-2 text-amber-800 dark:text-amber-200 text-xs">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">সতর্কতা: লোকাল নেটওয়ার্কে সার্ভিস উন্মুক্ত করার পূর্বে নিশ্চিত হোন:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>আপনার এডমিন অ্যাকাউন্টে নিরাপদ পাসওয়ার্ড সেট করা আছে।</li>
                      <li>উইন্ডোজ ফায়ারওয়ালে শুধুমাত্র অনুমোদিত আইপি এক্সেস পাচ্ছে।</li>
                      <li>পাবলিক বা অনিরাপদ ওয়াইফাই নেটওয়ার্কে এটি চালু করবেন না।</li>
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setToggleWarningVisible(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={handleToggleLan}
                    className="px-2.5 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium rounded"
                  >
                    আমি ঝুঁকি বুঝে নিশ্চিত করছি
                  </button>
                </div>
              </div>
            )}

            {/* Available network interfaces */}
            {lanEnabled && availableIps.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  অন্যান্য ডিভাইস থেকে এক্সেস ইউআরএল:
                </p>
                <div className="space-y-1">
                  {availableIps.map((iface, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded text-slate-700 dark:text-slate-300 flex justify-between"
                    >
                      <span>{iface.name}:</span>
                      <span className="text-blue-600 dark:text-blue-400 select-all">http://{iface.ip}:3000</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Security Guarantee */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl flex items-start gap-2.5">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">এপিআই সিকিউরিটি গার্ড কার্যকর রয়েছে</p>
              <p>
                যেকোনো ফাইল আপলোড বা তথ্য পরিবর্তনের জন্য সেশন টোকেন ও সিএসআরএফ (CSRF) প্রটেকশন স্বয়ংক্রিয়ভাবে কাজ করছে।
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
