/* ===== 模块 7：深度地球 online ===== */
(function () {
  const { $, $$, esc, uid, today, toast, modal, confirmBox, promptBox, pickImage } = UI;

  const NOTE_COLORS = ['#FFF3C4', '#FFE0DC', '#E1EFD9', '#E0EDF6', '#EEE6F6', '#FFE9C8'];
  let view = 'list';
  let deepView = 'list';
  let curId = null;

  const getPages = () => DB.get('deep.pages', []);
  const setPages = (v) => DB.set('deep.pages', v);

  function render(root) {
    if (view === 'page' && curId && getPages().find(p => p.id === curId)) renderPage(root);
    else if (deepView === 'timeline') renderTimeline(root);
    else { view = 'list'; renderList(root); }
  }

  /* ---- 列表 ---- */
  function renderList(root) {
    const pages = getPages().slice().sort((a, b) => (b.updated || b.ts) - (a.updated || a.ts));
    root.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#EAF3F8,#F7F1E4);border-color:#CFE0EA;">
        <div class="card-title"><span class="ci">${Icons.globe()}</span>深度地球 online</div>
        <div class="hint" style="line-height:1.75;">在这里记录你对某件事物的深度体验：一本书、一次旅行、一个爱好、一段关系、一门手艺。
        每个页面都可以自由组合<b>文字段落 / 图片 / 表格 / 彩色便签</b>，像做一份自己的研究报告。</div>
        <div class="row" style="margin-top:9px;gap:6px;">
          <button class="chip sm ${deepView === 'list' ? 'on' : ''}" id="vwList">📋 列表</button>
          <button class="chip sm ${deepView === 'timeline' ? 'on' : ''}" id="vwTl">🗓 时间轴</button>
        </div>
        <button class="btn block" id="newPage" style="margin-top:9px;">${Icons.plus()}新建一个页面</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>我的页面 <small>${pages.length} 篇</small></div>
        <div id="pgList"></div>
      </div>`;
    $('#vwList').onclick = () => { deepView = 'list'; renderList($('#pageRoot')); };
    $('#vwTl').onclick = () => { deepView = 'timeline'; render($('#pageRoot')); };
    $('#newPage').onclick = async () => {
      const t = await promptBox('新页面标题', '', '比如：第一次做陶艺');
      if (!t) return;
      const arr = getPages();
      const id = uid();
      arr.push({ id, title: t, cover: '', blocks: [{ id: uid(), type: 'text', text: '' }], ts: Date.now(), updated: Date.now() });
      setPages(arr); curId = id; view = 'page'; render($('#pageRoot'));
    };
    const box = $('#pgList');
    if (!pages.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.panda()}</div>还没有页面～<br>点上面新建，开始你的深度探索</div>`;
      return;
    }
    box.innerHTML = pages.map(p => {
      const txt = (p.blocks || []).filter(b => b.type === 'text').map(b => b.text).join(' ').slice(0, 50);
      const cnt = { text: 0, image: 0, table: 0, note: 0 };
      (p.blocks || []).forEach(b => cnt[b.type] = (cnt[b.type] || 0) + 1);
      return `<div class="rec-item" data-id="${p.id}">
        <div class="rec-ico" style="width:44px;height:44px;flex:0 0 44px;">${p.cover ? `<img src="${p.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:11px;">` : '🌍'}</div>
        <div class="rec-main"><div class="t">${esc(p.title)}</div>
        <div class="s">${esc(txt || '（还没写内容）')}</div>
        <div class="hint" style="margin-top:2px;">${new Date(p.updated || p.ts).toLocaleDateString('zh-CN')} · ${cnt.image ? cnt.image + '图 ' : ''}${cnt.table ? cnt.table + '表 ' : ''}${cnt.note ? cnt.note + '便签' : ''}</div></div>
        <span class="chip sm" data-act="del">×</span>
      </div>`;
    }).join('');
    box.onclick = async (e) => {
      const it = e.target.closest('[data-id]'); if (!it) return;
      if (e.target.dataset.act === 'del') {
        if (await confirmBox('删除这个页面？里面的内容都会消失。')) {
          setPages(getPages().filter(x => x.id !== it.dataset.id)); renderList($('#pageRoot')); toast('已删除');
        }
        return;
      }
      curId = it.dataset.id; view = 'page'; render($('#pageRoot'));
    };
  }

  /* ---- 时间轴 ---- */
  function renderTimeline(root) {
    const pages = getPages().slice().sort((a, b) => (b.updated || b.ts) - (a.updated || a.ts));
    const byYear = {};
    pages.forEach((p) => {
      const d = new Date(p.updated || p.ts);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      byYear[y] = byYear[y] || {};
      byYear[y][m] = byYear[y][m] || [];
      byYear[y][m].push(p);
    });
    const years = Object.keys(byYear).sort((a, b) => b - a);
    root.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#EAF3F8,#F7F1E4);border-color:#CFE0EA;">
        <div class="card-title"><span class="ci">${Icons.globe()}</span>深度体验时间轴</div>
        <div class="hint" style="line-height:1.7;">按年份回溯你的深度体验，几年前的也能翻到。点任意条目即可打开那一页。</div>
        <button class="btn ghost block sm" id="tlBack" style="margin-top:9px;">📋 返回列表视图</button>
      </div>
      <div id="tl"></div>`;
    $('#tlBack').onclick = () => { deepView = 'list'; renderList($('#pageRoot')); };
    if (!pages.length) {
      $('#tl').innerHTML = `<div class="empty"><div class="e-ico">${Icons.panda()}</div>还没有深度页面～<br>去列表里新建一个吧</div>`;
      return;
    }
    $('#tl').innerHTML = years.map((y) => `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>${y} 年 <small>${pages.filter(p => new Date(p.updated || p.ts).getFullYear() == y).length} 篇</small></div>
        ${Object.keys(byYear[y]).sort((a, b) => b - a).map((m) => `
          <div style="margin:7px 0 3px;font-weight:800;font-size:12.5px;color:var(--brown2);">${m} 月</div>
          ${byYear[y][m].map((p) => `
            <div class="rec-item" data-id="${p.id}">
              <div class="rec-ico" style="width:38px;height:38px;flex:0 0 38px;">${p.cover ? `<img src="${p.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:11px;">` : '🌍'}</div>
              <div class="rec-main">
                <div class="t">${esc(p.title)}</div>
                <div class="s">${new Date(p.updated || p.ts).toLocaleDateString('zh-CN')}</div>
              </div>
              <span class="chip sm">打开</span>
            </div>`).join('')}
        `).join('')}
      </div>`).join('');
    $('#tl').onclick = (e) => {
      const it = e.target.closest('[data-id]'); if (!it) return;
      curId = it.dataset.id; view = 'page'; render($('#pageRoot'));
    };
  }

  /* ---- 页面详情 ---- */
  function renderPage(root) {
    const pages = getPages();
    const p = pages.find(x => x.id === curId);
    if (!p) { view = 'list'; return renderList(root); }
    root.innerHTML = `
      <div class="card">
        <div class="row" style="margin-bottom:9px;">
          <button class="btn ghost sm" id="back">‹ 返回</button>
          <div class="grow"></div>
          <button class="btn ghost sm" id="setCover">封面</button>
          <button class="btn sm" id="savePage">保存</button>
        </div>
        ${p.cover ? `<img src="${p.cover}" style="width:100%;max-height:170px;object-fit:cover;border-radius:14px;margin-bottom:9px;">` : ''}
        <input class="field" id="pgTitle" value="${esc(p.title)}" style="font-size:16px;font-weight:800;">
        <div class="hint" style="margin-top:5px;">创建于 ${new Date(p.ts).toLocaleDateString('zh-CN')} · 最后编辑 ${new Date(p.updated || p.ts).toLocaleString('zh-CN')}</div>
      </div>

      <div id="blocks"></div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.plus()}</span>添加内容块</div>
        <div class="row wrap">
          <button class="btn ghost sm" data-add="text">📝 文字段落</button>
          <button class="btn ghost sm" data-add="image">🖼 图片</button>
          <button class="btn ghost sm" data-add="table">📊 表格</button>
          <button class="btn ghost sm" data-add="note">🗒 彩色便签</button>
        </div>
      </div>`;

    $('#back').onclick = () => { savePage(true); view = 'list'; renderList(root); };
    $('#savePage').onclick = () => { savePage(); toast('已保存 🌍'); };
    $('#setCover').onclick = async () => {
      const im = await pickImage(1000); if (!im) return;
      const arr = getPages(); const q = arr.find(x => x.id === curId);
      q.cover = im; q.updated = Date.now(); setPages(arr); renderPage(root);
    };
    $$('[data-add]').forEach(b => b.onclick = () => addBlock(b.dataset.add, root));
    drawBlocks(root);
  }

  function savePage(silent) {
    const arr = getPages(); const p = arr.find(x => x.id === curId); if (!p) return;
    const t = $('#pgTitle'); if (t) p.title = t.value.trim() || p.title;
    $$('#blocks [data-bid]').forEach(el => {
      const b = p.blocks.find(x => x.id === el.dataset.bid); if (!b) return;
      if (b.type === 'text') { const ta = el.querySelector('textarea'); if (ta) b.text = ta.value; }
      if (b.type === 'note') { const ta = el.querySelector('textarea'); if (ta) b.text = ta.value; }
      if (b.type === 'table') {
        const rows = Array.from(el.querySelectorAll('tr')).map(tr => Array.from(tr.children).map(td => td.textContent.trim()));
        if (rows.length) b.rows = rows;
      }
      if (b.type === 'image') { const cap = el.querySelector('input'); if (cap) b.cap = cap.value; }
    });
    p.updated = Date.now();
    setPages(arr);
    if (!silent) DB.flushNow();
  }

  function addBlock(type, root) {
    savePage(true);
    const arr = getPages(); const p = arr.find(x => x.id === curId);
    const b = { id: uid(), type };
    if (type === 'text') b.text = '';
    if (type === 'note') { b.text = ''; b.color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]; }
    if (type === 'table') b.rows = [['项目', '说明', '评分'], ['', '', ''], ['', '', '']];
    if (type === 'image') b.src = '';
    p.blocks.push(b); p.updated = Date.now(); setPages(arr);
    if (type === 'image') {
      pickImage(1000).then(im => {
        const a2 = getPages(); const p2 = a2.find(x => x.id === curId);
        const b2 = p2.blocks.find(x => x.id === b.id);
        if (im) { b2.src = im; } else { p2.blocks = p2.blocks.filter(x => x.id !== b.id); }
        setPages(a2); renderPage(root);
      });
    } else renderPage(root);
  }

  function drawBlocks(root) {
    const p = getPages().find(x => x.id === curId);
    const box = $('#blocks');
    box.innerHTML = (p.blocks || []).map((b, i) => {
      const head = `<div class="row" style="margin-bottom:6px;">
        <span class="hint grow">${{ text: '📝 段落', image: '🖼 图片', table: '📊 表格', note: '🗒 便签' }[b.type]} #${i + 1}</span>
        <button class="chip sm" data-act="up">↑</button>
        <button class="chip sm" data-act="down">↓</button>
        <button class="chip sm" data-act="del">×</button>
      </div>`;
      let body = '';
      if (b.type === 'text') body = `<textarea class="field" style="min-height:110px;" placeholder="写下你的观察、感受、思考…">${esc(b.text || '')}</textarea>`;
      if (b.type === 'note') body = `
        <div style="background:${b.color || '#FFF3C4'};border-radius:12px;padding:9px;box-shadow:2px 3px 8px rgba(140,102,71,.16);transform:rotate(-.6deg);">
          <textarea class="field" style="min-height:78px;background:transparent;border:none;padding:2px;" placeholder="随手一记…">${esc(b.text || '')}</textarea>
          <div class="row wrap" style="margin-top:4px;">${NOTE_COLORS.map(c => `<span data-color="${c}" style="width:18px;height:18px;border-radius:50%;background:${c};border:1.5px solid rgba(107,70,48,.3);"></span>`).join('')}</div>
        </div>`;
      if (b.type === 'image') body = `
        <img src="${b.src}" style="width:100%;border-radius:12px;display:block;">
        <input class="field" value="${esc(b.cap || '')}" placeholder="图注（可选）" style="margin-top:7px;font-size:12px;">`;
      if (b.type === 'table') body = `
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12.5px;">
            ${(b.rows || []).map((r, ri) => `<tr>${r.map(c => `<td contenteditable="true" style="border:1.5px solid var(--line);padding:6px 7px;min-width:66px;${ri === 0 ? 'background:var(--cream);font-weight:800;' : ''}">${esc(c)}</td>`).join('')}</tr>`).join('')}
          </table>
        </div>
        <div class="row" style="margin-top:7px;">
          <button class="chip sm" data-act="addrow">+ 行</button>
          <button class="chip sm" data-act="addcol">+ 列</button>
          <button class="chip sm" data-act="delrow">− 行</button>
          <button class="chip sm" data-act="delcol">− 列</button>
        </div>`;
      return `<div class="card" data-bid="${b.id}">${head}${body}</div>`;
    }).join('');

    box.onclick = (e) => {
      const card = e.target.closest('[data-bid]'); if (!card) return;
      const act = e.target.dataset.act;
      const color = e.target.dataset.color;
      const arr = getPages(); const pg = arr.find(x => x.id === curId);
      const i = pg.blocks.findIndex(x => x.id === card.dataset.bid);
      if (i < 0) return;
      if (color) { savePage(true); getPages(); const a2 = getPages(); const p2 = a2.find(x => x.id === curId); p2.blocks[i].color = color; setPages(a2); renderPage(root); return; }
      if (!act) return;
      savePage(true);
      const a3 = getPages(); const p3 = a3.find(x => x.id === curId);
      const b = p3.blocks[i];
      if (act === 'up' && i > 0) { [p3.blocks[i - 1], p3.blocks[i]] = [p3.blocks[i], p3.blocks[i - 1]]; }
      else if (act === 'down' && i < p3.blocks.length - 1) { [p3.blocks[i + 1], p3.blocks[i]] = [p3.blocks[i], p3.blocks[i + 1]]; }
      else if (act === 'del') { p3.blocks.splice(i, 1); }
      else if (act === 'addrow') { b.rows.push(new Array(b.rows[0].length).fill('')); }
      else if (act === 'addcol') { b.rows.forEach((r, ri) => r.push(ri === 0 ? '新列' : '')); }
      else if (act === 'delrow') { if (b.rows.length > 1) b.rows.pop(); }
      else if (act === 'delcol') { if (b.rows[0].length > 1) b.rows.forEach(r => r.pop()); }
      p3.updated = Date.now();
      setPages(a3); renderPage(root);
    };

    // 自动保存
    box.addEventListener('input', () => {
      clearTimeout(box._t);
      box._t = setTimeout(() => savePage(true), 800);
    });
  }

  window.Modules = window.Modules || {};
  window.Modules.deep = {
    id: 'deep', name: '深度地球', desc: '熊猫的深度体验档案', icon: 'panda',
    render, onLeave() { if (view === 'page') savePage(true); }
  };
})();
