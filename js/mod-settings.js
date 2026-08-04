/* ===== 设置：数据 · 备份 · 清理 · 显示 ===== */
(function () {
  const { $, $$, esc, today, toast, modal, confirmBox, pickFile, download } = UI;

  function fmt(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function applyFont(fs) {
    const r = document.documentElement;
    r.classList.remove('fs-s', 'fs-m', 'fs-l');
    r.classList.add('fs-' + (fs || 'm'));
  }

  function applyTheme(t) {
    const r = document.documentElement;
    if (t) r.setAttribute('data-theme', t); else r.removeAttribute('data-theme');
  }

  function applyCompact(on) {
    document.documentElement.classList.toggle('compact', !!on);
  }

  function render(root) {
    const u = DB.usage();
    const top = u.detail.slice(0, 6);
    const fs = DB.get('pref.fontsize', 'm');
    const theme = DB.get('pref.theme', '');
    const compact = DB.get('pref.compact', false);

    root.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#EDE3F2,#F7F1E4);border-color:#D9CBE8;">
        <div class="card-title"><span class="ci">${Icons.gear()}</span>设置</div>
        <div class="hint" style="line-height:1.7;">所有数据都保存在你的本机（IndexedDB + 本地备份），刷新、关机都不会丢。删不删，全由你说了算。</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>存储情况</div>
        <div class="hint">共占用 <b>${fmt(u.total)}</b> 本机空间。</div>
        <div style="margin-top:8px;">${top.length ? top.map(d => `<div class="usage-row"><span class="k">${esc(d.key)}</span><span class="v">${fmt(d.size)}</span></div>`).join('') : '<div class="hint">还没有数据～</div>'}</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.coin()}</span>数据备份与恢复</div>
        <div class="row" style="gap:8px;">
          <button class="btn ghost grow" id="bk">${Icons.download ? Icons.download() : '⬇'}备份导出</button>
          <button class="btn ghost grow" id="im">${Icons.upload ? Icons.upload() : '⬆'}导入备份</button>
        </div>
        <div class="hint" style="margin-top:7px;">导出会下载一个 JSON 文件，换手机或重装前记得备份。</div>
      </div>

      <div class="card" id="cloudSyncCard" style="display:none;background:linear-gradient(135deg,#E3F2FD,#E8F5E9);border-color:#BBDEFB;">
        <div class="card-title"><span class="ci">☁️</span>云盘同步（桌面版）</div>
        <div class="hint" id="dataPathHint">仅桌面版可用。</div>
        <button class="btn ghost block sm" id="moveCloud">📂 移动到云盘同步文件夹（OneDrive / 百度网盘等）</button>
        <div class="hint" style="margin-top:6px;">把数据文件放进云盘同步文件夹，换电脑自动同步。位置会被本机记住，下次启动自动从该文件夹读取。也可直接把上面的文件拷到网盘。</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.tv()}</span>影视封面（联网取真实海报）</div>
        <div class="hint" style="margin-bottom:7px;">联网时会自动抓取真实剧集封面。英文名作品已默认支持；想要中文剧名也显示真实海报，可填入免费的 TMDB API Key（<a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">点此免费申请</a>，复制 v3 key）。不填也能正常使用。</div>
        <input class="field" id="tmdbKey" placeholder="粘贴 TMDB API Key（v3 key，可留空）" value="${esc(DB.get('pref.tmdbKey', ''))}" style="margin-bottom:8px;">
        <button class="btn ghost block sm" id="saveKey">保存密钥</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.trash()}</span>清理数据</div>
        <button class="btn ghost block sm" id="cleanDiary">🗓 清除 N 个月前的日记</button>
        <button class="btn ghost block sm" id="cleanDeep" style="margin-top:7px;">🌍 清除 N 个月前的深度页面</button>
        <button class="btn danger block sm" id="wipe" style="margin-top:10px;">${Icons.trash()}清空全部数据</button>
        <div class="hint" style="margin-top:6px;">清空后无法恢复，请先备份。</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.sun()}</span>外观皮肤</div>
        <div class="hint" style="margin-bottom:6px;">主题</div>
        <div class="chip-group" id="themeGroup">
          <span class="chip ${theme === '' ? 'on' : ''}" data-t="">🍊 三花米黄</span>
          <span class="chip ${theme === 'dark' ? 'on' : ''}" data-t="dark">🌙 深色</span>
          <span class="chip ${theme === 'matcha' ? 'on' : ''}" data-t="matcha">🍵 抹茶</span>
          <span class="chip ${theme === 'sakura' ? 'on' : ''}" data-t="sakura">🌸 樱花</span>
          <span class="chip ${theme === 'haze' ? 'on' : ''}" data-t="haze">🌫 雾霾蓝</span>
        </div>
        <div class="hint" style="margin:10px 0 6px;">布局</div>
        <div class="chip-group" id="layoutGroup">
          <span class="chip ${compact ? 'on' : ''}" data-c="0">标准</span>
          <span class="chip ${compact ? '' : 'on'}" data-c="1">紧凑</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.sun()}</span>显示</div>
        <div class="hint" style="margin-bottom:6px;">字号</div>
        <div class="chip-group" id="fontGroup">
          <span class="chip ${fs === 's' ? 'on' : ''}" data-fs="s">小</span>
          <span class="chip ${fs === 'm' ? 'on' : ''}" data-fs="m">标准</span>
          <span class="chip ${fs === 'l' ? 'on' : ''}" data-fs="l">大</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.cat()}</span>关于</div>
        <div class="about-line">
          <b>三花日常 · 毛茸茸生活手册</b><br>
          版本 v1.0 · 纯本地应用（PWA）<br>
          萌趣小动物风格的日常记录本：日程、记账、饮食睡眠、运动、穿搭、美妆、深度记录、影视文娱，一应俱全。<br>
          把你的一天，过成毛茸茸的样子 🐾
        </div>
      </div>`;

    $('#saveKey').onclick = () => {
      const k = $('#tmdbKey').value.trim();
      DB.set('pref.tmdbKey', k);
      toast(k ? '已保存，联网刷新即可显示真实海报' : '已清空密钥');
    };
    $('#bk').onclick = () => {
      if (window.electronAPI && window.electronAPI.exportFile) {
        window.electronAPI.exportFile(DB.all()).then(ok => { if (ok) toast('备份文件已导出'); });
      } else {
        download(`三花日常备份_${today()}.json`, JSON.stringify(DB.all()));
        toast('备份文件已导出');
      }
    };
    $('#im').onclick = () => {
      if (window.electronAPI && window.electronAPI.importFile) {
        window.electronAPI.importFile().then(async (obj) => {
          if (!obj) return;
          const ok = await confirmBox('导入将【合并】到现有数据（同名的键会被覆盖）。确定继续？', '合并导入');
          if (!ok) return;
          const n = await DB.importAll(obj, 'merge');
          toast(`已导入 ${n} 项数据`);
          render($('#pageRoot'));
        });
      } else { doImport(); }
    };
    if (window.electronAPI && window.electronAPI.isElectron) {
      const card = document.getElementById('cloudSyncCard');
      if (card) {
        card.style.display = '';
        window.electronAPI.getDataPath().then(p => {
          const h = document.getElementById('dataPathHint');
          if (h) h.innerHTML = '当前数据文件位置：<br><code style="word-break:break-all;">' + esc(p) + '</code>';
        });
        const btn = document.getElementById('moveCloud');
        if (btn) btn.onclick = async () => {
          const folder = await window.electronAPI.pickFolder();
          if (!folder) return;
          const np = await window.electronAPI.setDataPath(folder);
          toast('已移动到：' + np);
          render(root);
        };
      }
    }
    $('#cleanDiary').onclick = () => cleanOlder('diary');
    $('#cleanDeep').onclick = () => cleanOlder('deep');
    $('#wipe').onclick = doWipe;
    $$('#themeGroup .chip').forEach(c => c.onclick = () => {
      const t = c.dataset.t;
      DB.set('pref.theme', t);
      applyTheme(t);
      $$('#themeGroup .chip').forEach(x => x.classList.toggle('on', x === c));
      toast('主题已切换');
    });
    $$('#layoutGroup .chip').forEach(c => c.onclick = () => {
      const on = c.dataset.c === '1';
      DB.set('pref.compact', on);
      applyCompact(on);
      $$('#layoutGroup .chip').forEach(x => x.classList.toggle('on', x === c));
      toast('布局已调整');
    });
    $$('#fontGroup .chip').forEach(c => c.onclick = () => {
      const f = c.dataset.fs;
      DB.set('pref.fontsize', f);
      applyFont(f);
      $$('#fontGroup .chip').forEach(x => x.classList.toggle('on', x === c));
      toast('字号已调整');
    });
  }

  function doImport() {
    pickFile('application/json').then(async (res) => {
      if (!res) return;
      let obj;
      try { obj = JSON.parse(res.text); } catch (e) { toast('文件格式不对'); return; }
      if (!obj || typeof obj !== 'object') { toast('文件格式不对'); return; }
      const ok = await confirmBox('导入将【合并】到现有数据（同名的键会被覆盖）。确定继续？', '合并导入');
      if (!ok) return;
      const n = await DB.importAll(obj, 'merge');
      toast(`已导入 ${n} 项数据`);
      render($('#pageRoot'));
    });
  }

  function doWipe() {
    confirmBox('确定要清空全部数据吗？这一步无法恢复，建议先备份。', '确认清空').then(ok => {
      if (!ok) return;
      return confirmBox('最后再问一次：真的全部清空？', '全部清空');
    }).then(async ok => {
      if (!ok) return;
      await DB.importAll({}, 'replace');
      toast('已全部清空');
      render($('#pageRoot'));
    });
  }

  // kind: 'diary' 清 key 以 diary: 开头且日期早于此前的；'deep' 清 deep.pages 中 old 的页面
  function cleanOlder(kind) {
    UI.promptBox(kind === 'diary' ? '清除几个月前的日记？(填数字)' : '清除几个月前的深度页面？(填数字)', '6', '比如 6').then(async (v) => {
      const m = parseInt(v, 10);
      if (!m || m < 1) { toast('请输入大于 0 的数字'); return; }
      const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - m);
      const cut = cutoff.getFullYear() + '-' + String(cutoff.getMonth() + 1).padStart(2, '0') + '-' + String(cutoff.getDate()).padStart(2, '0');
      let count = 0;
      if (kind === 'diary') {
        const keys = DB.keys().filter(k => k.startsWith('diary:'));
        for (const k of keys) {
          const d = k.slice(6);
          if (d < cut) { DB.del(k); count++; }
        }
      } else {
        const pages = DB.get('deep.pages', []);
        const keep = pages.filter(p => (p.updated || p.ts) >= new Date(cutoff).getTime());
        count = pages.length - keep.length;
        DB.set('deep.pages', keep);
      }
      DB.flushNow();
      toast(`已清理 ${count} 项`);
    });
  }

  window.Modules = window.Modules || {};
  window.Modules.settings = {
    id: 'settings', name: '设置', desc: '数据 · 备份 · 关于', icon: 'gear',
    render
  };
})();
