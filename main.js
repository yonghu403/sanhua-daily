const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let dataPath = path.join(app.getPath('userData'), 'sanhua-data.json');
const configPath = path.join(app.getPath('userData'), 'sanhua-config.json');

// 记住用户选过的云盘同步文件夹位置，重启后仍生效（破除数据孤岛的关键）
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8') || '{}');
      if (cfg.dataPath && typeof cfg.dataPath === 'string') dataPath = cfg.dataPath;
    }
  } catch (e) {}
}
function saveConfig() {
  try { fs.writeFileSync(configPath, JSON.stringify({ dataPath }, null, 2), 'utf8'); } catch (e) {}
}

function ensureDataDir() {
  try { fs.mkdirSync(path.dirname(dataPath), { recursive: true }); } catch (e) {}
}
function readData() {
  try {
    ensureDataDir();
    if (!fs.existsSync(dataPath)) return {};
    return JSON.parse(fs.readFileSync(dataPath, 'utf8') || '{}');
  } catch (e) { return {}; }
}
function writeData(obj) {
  try {
    ensureDataDir();
    fs.writeFileSync(dataPath, JSON.stringify(obj || {}, null, 2), 'utf8');
    return true;
  } catch (e) { return false; }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 760, minWidth: 820, minHeight: 600,
    backgroundColor: '#FDF7EC',
    icon: path.join(__dirname, 'icon-512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  // 读取 index.html 并去掉 ?v= 版本戳后加载（file:// 下更稳）
  const idx = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(idx, 'utf8').replace(/\?v=\d+/g, '');
  const tmp = path.join(__dirname, '__electron_index.html');
  fs.writeFileSync(tmp, html, 'utf8');
  mainWindow.loadFile(tmp);

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ===== 数据文件读写 / 云盘同步 / 导入导出 =====
ipcMain.handle('read-data', () => readData());
ipcMain.handle('write-data', (e, obj) => writeData(obj));
ipcMain.handle('get-data-path', () => dataPath);
ipcMain.handle('set-data-path', (e, folder) => {
  try {
    const newPath = path.join(folder, 'sanhua-data.json');
    if (fs.existsSync(dataPath)) {
      const oldData = readData();
      let newData = {};
      if (fs.existsSync(newPath)) {
        try { newData = JSON.parse(fs.readFileSync(newPath, 'utf8') || '{}'); } catch (e) {}
      }
      newData = Object.assign({}, newData, oldData);
      fs.writeFileSync(newPath, JSON.stringify(newData, null, 2), 'utf8');
    }
    dataPath = newPath;
    saveConfig();
    return newPath;
  } catch (e) { return dataPath; }
});
ipcMain.handle('pick-folder', async () => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  return res.canceled ? null : (res.filePaths[0] || null);
});
ipcMain.handle('export-file', async (e, obj) => {
  if (!mainWindow) return false;
  const res = await dialog.showSaveDialog(mainWindow, {
    defaultPath: '三花日常备份.json',
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (res.canceled) return false;
  try { fs.writeFileSync(res.filePath, JSON.stringify(obj || {}, null, 2), 'utf8'); return true; }
  catch (e) { return false; }
});
ipcMain.handle('import-file', async () => {
  if (!mainWindow) return null;
  const res = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  });
  if (res.canceled) return null;
  try { return JSON.parse(fs.readFileSync(res.filePaths[0], 'utf8')); }
  catch (e) { return null; }
});

app.whenReady().then(() => { loadConfig(); createWindow(); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('before-quit', () => {
  try { fs.unlinkSync(path.join(__dirname, '__electron_index.html')); } catch (e) {}
});
