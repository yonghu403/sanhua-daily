/* ===== 本地持久化：IndexedDB 主存 + localStorage 兜底，刷新绝不丢数据 ===== */
(function (global) {
  const DB_NAME = 'sanhua_daily';
  const STORE = 'kv';
  const LS_PREFIX = 'sanhua:';

  let idb = null;
  let idbOK = false;
  const cache = Object.create(null);
  const dirty = new Set();
  let flushTimer = null;
  const IS_ELECTRON = !!(global.electronAPI && global.electronAPI.isElectron);

  function openIDB() {
    return new Promise((resolve) => {
      if (!global.indexedDB) return resolve(null);
      let req;
      try { req = indexedDB.open(DB_NAME, 1); } catch (e) { return resolve(null); }
      req.onupgradeneeded = () => {
        const d = req.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
      setTimeout(() => resolve(req.result || null), 2500);
    });
  }

  function idbAll() {
    return new Promise((resolve) => {
      if (!idb) return resolve({});
      const out = {};
      try {
        const tx = idb.transaction(STORE, 'readonly');
        const st = tx.objectStore(STORE);
        const cur = st.openCursor();
        cur.onsuccess = (e) => {
          const c = e.target.result;
          if (c) { out[c.key] = c.value; c.continue(); }
          else resolve(out);
        };
        cur.onerror = () => resolve(out);
      } catch (e) { resolve(out); }
    });
  }

  function idbPut(k, v) {
    return new Promise((resolve) => {
      if (!idb) return resolve(false);
      try {
        const tx = idb.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(v, k);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  }

  function idbDel(k) {
    return new Promise((resolve) => {
      if (!idb) return resolve(false);
      try {
        const tx = idb.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(k);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  }

  function lsRead() {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) {
          try { out[k.slice(LS_PREFIX.length)] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
        }
      }
    } catch (e) {}
    return out;
  }

  function lsWrite(k, v) {
    try { localStorage.setItem(LS_PREFIX + k, JSON.stringify(v)); return true; }
    catch (e) { return false; }
  }

  function deepClone(v) {
    if (v === undefined || v === null) return v;
    try { return JSON.parse(JSON.stringify(v)); } catch (e) { return v; }
  }

  async function flush() {
    if (IS_ELECTRON) {
      try { await global.electronAPI.writeData(deepClone(cache)); } catch (e) {}
      if (typeof DB.onflush === 'function') DB.onflush();
      return;
    }
    if (!dirty.size) return;
    const keys = Array.from(dirty);
    dirty.clear();
    for (const k of keys) {
      const v = cache[k];
      if (v === undefined) {
        await idbDel(k);
        try { localStorage.removeItem(LS_PREFIX + k); } catch (e) {}
      } else {
        const ok = idbOK ? await idbPut(k, v) : false;
        // localStorage 作为镜像备份（大数据自动跳过，避免超配额）
        let str = '';
        try { str = JSON.stringify(v); } catch (e) { str = ''; }
        if (!ok || str.length < 400000) lsWrite(k, v);
      }
    }
    if (typeof DB.onflush === 'function') DB.onflush();
  }

  function schedule() {
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, 260);
  }

  const DB = {
    ready: false,
    engine: 'localStorage',

    async init() {
      if (IS_ELECTRON) {
        try {
          const data = await global.electronAPI.readData();
          Object.assign(cache, (data && typeof data === 'object') ? data : {});
          this.engine = 'ElectronFile';
          this.ready = true;
          return this;
        } catch (e) { /* 落到下方兜底 */ }
      }
      idb = await openIDB();
      idbOK = !!idb;
      const fromLS = lsRead();
      const fromIDB = idbOK ? await idbAll() : {};
      Object.assign(cache, fromLS, fromIDB); // IndexedDB 优先
      this.engine = idbOK ? 'IndexedDB' : 'localStorage';
      this.ready = true;
      // 首次启动把 LS 数据同步进 IDB
      if (idbOK) {
        for (const k of Object.keys(fromLS)) {
          if (!(k in fromIDB)) { dirty.add(k); }
        }
        schedule();
      }
      return this;
    },

    get(key, def) {
      const v = cache[key];
      if (v === undefined || v === null) return deepClone(def);
      return v;
    },

    set(key, val) {
      cache[key] = val;
      dirty.add(key);
      schedule();
      return val;
    },

    /* 立即落盘（用于关键操作） */
    async setNow(key, val) {
      cache[key] = val;
      dirty.add(key);
      if (flushTimer) clearTimeout(flushTimer);
      await flush();
    },

    del(key) {
      delete cache[key];
      dirty.add(key);
      schedule();
    },

    keys() { return Object.keys(cache); },

    all() { return deepClone(cache); },

    async importAll(obj, mode) {
      if (!obj || typeof obj !== 'object') return 0;
      let n = 0;
      if (mode === 'replace') {
        for (const k of Object.keys(cache)) { delete cache[k]; dirty.add(k); }
      }
      for (const k of Object.keys(obj)) { cache[k] = obj[k]; dirty.add(k); n++; }
      if (flushTimer) clearTimeout(flushTimer);
      await flush();
      return n;
    },

    /* 估算占用体积（字节） */
    usage() {
      let total = 0; const detail = [];
      for (const k of Object.keys(cache)) {
        let s = 0;
        try { s = JSON.stringify(cache[k]).length; } catch (e) { s = 0; }
        total += s; detail.push({ key: k, size: s });
      }
      detail.sort((a, b) => b.size - a.size);
      return { total, detail };
    },

    flushNow: flush
  };

  global.DB = DB;

  // 页面隐藏 / 关闭前强制落盘
  document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
})(window);
