const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  appVersion: '2.0.0',
});

console.log('[LifeKeepVault] Desktop app preload initialized.');
console.log('[LifeKeepVault] Platform:', process.platform);
