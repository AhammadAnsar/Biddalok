import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, CloudUpload, RefreshCw } from 'lucide-react';
import { SyncService } from '../../services/SyncService';

export const SyncIndicator: React.FC = () => {
  const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'failed' | 'offline'>('synced');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Mock sync state checking mechanism (Phase 21 UI requirement)
    const checkSync = async () => {
      if (!navigator.onLine) {
        setSyncState('offline');
        return;
      }
      try {
        if ((window as any).desktopApi?.db?.invoke) {
          const outboxCount = await (window as any).desktopApi.db.invoke('getPendingSyncCount');
          if (outboxCount && outboxCount.data.count > 0) {
             setSyncState('syncing');
             try {
                await SyncService.triggerSync();
                setSyncState('synced');
             } catch (e) {
                setSyncState('failed');
             }
          } else {
             setSyncState('synced');
          }
        }
      } catch (err) {
        setSyncState('failed');
      }
    };

    const interval = setInterval(checkSync, 10000); // Check every 10s
    checkSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center text-gray-500 text-sm px-3 py-1 bg-gray-100 rounded-full dark:bg-gray-800" title="Offline">
        <CloudOff className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    );
  }

  if (syncState === 'syncing') {
    return (
      <div className="flex items-center text-blue-600 text-sm px-3 py-1 bg-blue-50 rounded-full" title="Syncing pending changes...">
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        <span className="hidden sm:inline">Syncing</span>
      </div>
    );
  }

  if (syncState === 'failed') {
    return (
      <div className="flex items-center text-red-600 text-sm px-3 py-1 bg-red-50 rounded-full" title="Sync failed. Will retry automatically.">
        <CloudUpload className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Sync Failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-green-600 text-sm px-3 py-1 bg-green-50 rounded-full dark:bg-green-900/20" title="All changes saved and synced">
      <Cloud className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Synced</span>
    </div>
  );
};
