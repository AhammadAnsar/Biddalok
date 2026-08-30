const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Single Instance Lock (Crucial for database integrity and performance)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Focus existing window if another instance tries to open
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Optimize performance and memory usage
  app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
  app.commandLine.appendSwitch('enable-gpu-rasterization');
  app.commandLine.appendSwitch('enable-zero-copy');

  // Set Windows AppUserModelId for taskbar, start menu and pin grouping
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.softdows.biddalok');
  }
  
  app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

function createWindow() {
  // Resolve high-resolution brand icon safely (ICO preferred on Windows, PNG on cross-platform)
  let iconPath = path.join(__dirname, '../build/icon.ico');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '../public/icon.ico');
  }
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '../public/icon.png');
  }
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, 'icon.png');
  }
  
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 860,
    minWidth: 1024,
    minHeight: 680,
    title: 'Biddalok by SoftDows',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false, // Don't show until ready (prevents white flash)
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true, // Enforce Same-Origin Policy & Chromium Security Model
      backgroundThrottling: false,
      sandbox: false
    },
    autoHideMenuBar: false,
  });

  // Show window gracefully when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // Ensure window title remains Biddalok by SoftDows
  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
    mainWindow.setTitle('Biddalok by SoftDows');
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else if (isDev && !app.isPackaged) {
    // If run locally in dev without start url, try local Vite port 3000
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    // Production packaged build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch((err) => {
      console.error('Failed to load local index.html:', err);
    });
  }

  // Build standard menu with Bangla/English support and zoom controls for easy printing preview
  const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Print (প্রিন্ট করুন)',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) mainWindow.webContents.print();
          }
        },
        {
          label: 'Reload (রিলোড)',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          }
        },
        { type: 'separator' },
        {
          label: 'Exit (বন্ধ করুন)',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { 
          label: 'Developer Tools (ডেভেলপার টুলস)',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Biddalok by SoftDows',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Biddalok by SoftDows',
              message: 'Biddalok - School & Institution Management System',
              detail: 'Developed by:\nAnsar Ahammad\nFounder, SoftDows\n\nMobile: 01737011052\nEmail: ahammadansar75@gmail.com\nWebsite: https://softdows.com/biddalok\n\nVersion: 1.0.5 (Offline-First Edition)'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

