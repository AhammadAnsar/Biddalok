const { contextBridge } = require('electron');

// Expose safe desktop environment info to renderer if needed
contextBridge.exposeInMainWorld('desktopApi', {
  isDesktop: true,
  platform: process.platform,
  version: process.versions.electron,
});
