const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  readData: () => ipcRenderer.invoke('read-data'),
  writeData: (obj) => ipcRenderer.invoke('write-data', obj),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  setDataPath: (folder) => ipcRenderer.invoke('set-data-path', folder),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  exportFile: (obj) => ipcRenderer.invoke('export-file', obj),
  importFile: () => ipcRenderer.invoke('import-file')
});
