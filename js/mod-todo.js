/* ===== 模块 1：日程待办（做点正事 / 找点乐子 / 今日心情） ===== */
(function () {
  const { $, $$, esc, safeHTML, uid, ymd, today, parseYMD, WD, monthMatrix, weekOf, niceDate, toast, modal, confirmBox, pickImage } = UI;

  const PRI = { fast: { n: '快', c: 't-fast' }, mid: { n: '中', c: 't-mid' }, slow: { n: '慢', c: 't-slow' } };
  const CAT = { body: { n: '身体', c: 't-body', tip: '做你觉得舒服的事' }, mind: { n: '心理', c: 't-mind', tip: '做你觉得正确的事' }, soul: { n: '灵魂', c: 't-soul', tip: '做你觉得想要的事' } };
  const MOODS = {
    happy: { n: '开心', ico: 'moodHappy' },
    calm: { n: '平淡', ico: 'moodCalm' },
    emo: { n: 'emo', ico: 'moodEmo' }
  };

  let tab = 'work';
  let calY, calM, selDate;
  let draft = { pri: 'mid', cat: 'body' };
  let multMode = false;   // 是否多选多日
  let multiDates = [];    // 多选日期列表
  let mY, mM;             // 多选月历的年/月

  /* ============ 数据 ============ */
  const getTodos = () => DB.get('todos', []);
  const setTodos = (v) => DB.set('todos', v);
  const getDiary = (d) => DB.get('diary:' + d, null);
  const setDiary = (d, v) => DB.set('diary:' + d, v);
  const diaryDates = () => DB.keys().filter(k => k.startsWith('diary:')).map(k => k.slice(6)).sort().reverse();

  /* ============ 入口 ============ */
  function render(root) {
    tab = DB.get('todo.tab', 'work');
    const d = new Date();
    if (calY == null) { calY = d.getFullYear(); calM = d.getMonth(); }
    if (!selDate) selDate = today();

    root.innerHTML = `
      <div class="tabs" id="todoTabs">
        <div class="tab ${tab === 'work' ? 'active' : ''}" data-t="work">${Icons.calendar()}做点正事</div>
        <div class="tab ${tab === 'fun' ? 'active' : ''}" data-t="fun">${Icons.dice()}找点乐子</div>
        <div class="tab ${tab === 'mood' ? 'active' : ''}" data-t="mood">${Icons.heart()}今日心情</div>
      </div>
      <div id="todoPane"></div>`;

    $$('#todoTabs .tab').forEach(el => el.onclick = () => {
      tab = el.dataset.t; DB.set('todo.tab', tab);
      $$('#todoTabs .tab').forEach(x => x.classList.toggle('active', x === el));
      paint();
    });
    paint();
  }

  function paint() {
    const p = $('#todoPane');
    if (tab === 'work') renderWork(p);
    else if (tab === 'fun') renderFun(p);
    else renderMood(p);
  }

  /* ============ 1. 做点正事 ============ */
  function renderWork(p) {
    multMode = false; multiDates = []; mY = null; mM = null;
    p.innerHTML = `
      <div class="card">
        <div class="cal-head">
          <button class="cal-nav" id="pm">‹</button>
          <div class="m" id="calTitle"></div>
          <button class="cal-nav" id="nm">›</button>
        </div>
        <div class="cal-scroll-x" id="calScrollX">
          <div class="cal-grid" id="calGrid"></div>
        </div>
        <div class="hint" style="margin-top:8px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <span><i style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--orange);vertical-align:middle;"></i> 待完成</span>
          <span><i style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--green);vertical-align:middle;"></i> 已完成</span>
          <span style="margin-left:4px;">|</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#E8F0E8;vertical-align:middle;border:1px solid #5F8F49;"></i> 身体</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#F0EBE0;vertical-align:middle;border:1px solid #E08A22;"></i> 心理</span>
          <span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#F5EEF0;vertical-align:middle;border:1px solid #B06A94;"></i> 灵魂</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.pen()}</span>添加待办 <small id="selLbl"></small></div>
        <input class="field" id="tdText" placeholder="今天想做点什么正事呀～" maxlength="120">
        <div style="margin-top:9px;">
          <span class="lbl">优先级（做起来的速度）</span>
          <div class="chip-group" id="priGrp">
            ${Object.keys(PRI).map(k => `<button class="chip ${draft.pri === k ? 'on' : ''}" data-p="${k}">${PRI[k].n}</button>`).join('')}
          </div>
        </div>
        <div style="margin-top:9px;">
          <span class="lbl">分类</span>
          <div class="chip-group" id="catGrp">
            ${Object.keys(CAT).map(k => `<button class="chip ${draft.cat === k ? 'on' : ''}" data-c="${k}">${CAT[k].n}</button>`).join('')}
          </div>
          <div class="hint" id="catTip" style="margin-top:5px;font-size:.72rem;color:#9A8874;line-height:1.6;min-height:1.2em;"></div>
        </div>
        <div style="margin-top:9px;">
          <span class="lbl">日期</span>
          <div class="row" style="gap:6px;flex-wrap:wrap;align-items:center;">
            <button class="chip sm ${!multMode ? 'on' : ''}" id="dtSingle">📌 仅此日</button>
            <button class="chip sm ${multMode ? 'on' : ''}" id="dtMulti">📅 多选多日</button>
            <span class="hint" id="dtSingleLbl" style="margin-left:auto;"></span>
          </div>
          <div id="multiDateBox" style="display:${multMode ? 'block' : 'none'};margin-top:8px;padding:8px 10px;background:#FFF9EF;border-radius:10px;border:1.5px dashed #E8D9BC;">
            <div class="cal-head" style="margin-bottom:6px;">
              <button class="cal-nav" id="mPm">‹</button>
              <div class="m" id="mTitle" style="font-size:.82rem;"></div>
              <button class="cal-nav" id="mNm">›</button>
            </div>
            <div class="cal-grid" id="mGrid" style="font-size:.78rem;"></div>
            <div class="hint" style="margin-top:6px;text-align:center;" id="mCount"></div>
          </div>
        </div>
        <button class="btn block" id="tdAdd" style="margin-top:11px;">${Icons.plus()}添加到 <span id="addDateLbl"></span></button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span><span id="listTitle">待办清单</span><small id="doneCnt"></small></div>
        <div id="todoList"></div>
      </div>`;

    $('#pm').onclick = () => { calM--; if (calM < 0) { calM = 11; calY--; } drawCal(); };
    $('#nm').onclick = () => { calM++; if (calM > 11) { calM = 0; calY++; } drawCal(); };
    $$('#priGrp .chip').forEach(c => c.onclick = () => { draft.pri = c.dataset.p; $$('#priGrp .chip').forEach(x => x.classList.toggle('on', x === c)); });
    $$('#catGrp .chip').forEach(c => c.onclick = () => { draft.cat = c.dataset.c; $$('#catGrp .chip').forEach(x => x.classList.toggle('on', x === c)); updateCatTip(); });
    $('#dtSingle').onclick = () => { multMode = false; $('#dtSingle').classList.add('on'); $('#dtMulti').classList.remove('on'); $('#multiDateBox').style.display = 'none'; updateAddBtn(); };
    $('#dtMulti').onclick = () => { multMode = true; $('#dtMulti').classList.add('on'); $('#dtSingle').classList.remove('on'); $('#multiDateBox').style.display = 'block'; if (mY == null) { const d = new Date(); mY = d.getFullYear(); mM = d.getMonth(); } drawMultiCal(); updateAddBtn(); };
    $('#mPm').onclick = () => { mM--; if (mM < 0) { mM = 11; mY--; } drawMultiCal(); };
    $('#mNm').onclick = () => { mM++; if (mM > 11) { mM = 0; mY++; } drawMultiCal(); };
    $('#tdAdd').onclick = addTodo;
    $('#tdText').addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

    drawCal(); updateCatTip(); drawList();
  }

  function drawCal() {
    $('#calTitle').textContent = `${calY} 年 ${calM + 1} 月`;
    const cells = monthMatrix(calY, calM);
    const todos = getTodos();
    const t = today();

    // 按日期分组待办
    const byDate = {};
    todos.forEach(td => {
      if (!byDate[td.date]) byDate[td.date] = [];
      byDate[td.date].push(td);
    });

    let html = WD.map(w => `<div class="cal-w">${w}</div>`).join('');
    cells.forEach(d => {
      if (!d) { html += `<div class="cal-d blank"></div>`; return; }
      const dayTodos = byDate[d] || [];
      const undone = dayTodos.filter(x => !x.done).length;
      const done = dayTodos.filter(x => x.done).length;

      // 日期下方显示任务标签（竖向排列，最多4条，超出显示+N）
      const show = dayTodos.slice(0, 4);
      const extra = dayTodos.length - 4;
      const tags = show.map(td => {
        const cc = CAT_COLORS[td.cat] || CAT_COLORS.body;
        const truncated = td.text.length > 5 ? td.text.slice(0, 5) + '..' : td.text;
        return `<span style="display:block;padding:0 4px;border-radius:5px;font-size:.58rem;line-height:1.6;background:${cc.bg};border:1px solid ${cc.border};color:${cc.text};margin-bottom:1px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;${td.done ? 'opacity:.45;text-decoration:line-through;' : ''}">${esc(truncated)}</span>`;
      }).join('');
      const extraTag = extra > 0 ? `<span style="font-size:.55rem;color:#bbb;display:block;text-align:center;">+${extra}</span>` : '';

      html += `<div class="cal-d ${d === t ? 'today' : ''} ${d === selDate ? 'sel' : ''}" data-d="${d}" style="min-height:${dayTodos.length ? '56px' : 'auto'};padding-bottom:4px;overflow:visible;">
        <div>${parseYMD(d).getDate()}${undone ? '<i class="dot"></i>' : ''}${done ? '<i class="dot done"></i>' : ''}</div>
        ${dayTodos.length ? `<div class="cal-tags">${tags}${extraTag}</div>` : ''}
      </div>`;
    });
    $('#calGrid').innerHTML = html;
    $$('#calGrid .cal-d[data-d]').forEach(c => c.onclick = () => { selDate = c.dataset.d; drawCal(); drawList(); });
    const lbl = selDate === t ? '今天' : niceDate(selDate);
    $('#selLbl').textContent = '记到：' + lbl;
    $('#listTitle').textContent = niceDate(selDate) + ' 的清单';
    updateAddBtn();
  }

  /* 分类注解：显示当前选中分类的提示语 */
  function updateCatTip() {
    const el = $('#catTip');
    if (!el) return;
    const c = CAT[draft.cat];
    el.innerHTML = `<b style="color:${c.c === 't-body' ? '#5F8F49' : c.c === 't-mind' ? '#E08A22' : '#B06A94'};">${c.n}</b> — ${c.tip}`;
  }

  /* 月度总览已内嵌到 drawCal() 每个日期格子中，以下常量供格子内标签使用 */
  const CAT_COLORS = {
    body: { bg: '#E8F0E8', border: '#5F8F49', text: '#3D6B2E' },
    mind: { bg: '#FDF6EC', border: '#E08A22', text: '#8B5E1E' },
    soul: { bg: '#F8EEF4', border: '#B06A94', text: '#7D3B6A' }
  };

  function addTodo() {
    const v = $('#tdText').value.trim();
    if (!v) { toast('先写点什么呀 🐾'); return; }
    const list = getTodos();
    if (multMode) {
      if (!multiDates.length) { toast('先选好日期呀 📅'); return; }
      const ds = multiDates.slice().sort();
      ds.forEach(d => list.push({ id: uid(), date: d, text: v, pri: draft.pri, cat: draft.cat, done: false, ts: Date.now(), startTime: '', progress: 0, note: '' }));
      setTodos(list);
      toast(`已同步到 ${ds.length} 天 🎉`);
      multiDates = [];
    } else {
      list.push({ id: uid(), date: selDate, text: v, pri: draft.pri, cat: draft.cat, done: false, ts: Date.now(), startTime: '', progress: 0, note: '' });
      setTodos(list);
      toast('已添加，冲鸭！');
    }
    $('#tdText').value = '';
    drawCal(); drawList();
    if (multMode) drawMultiCal();
    updateAddBtn();
  }

  /* 编辑任务备注（时间 / 进度 / 文字备注） */
  function editTodoDetail(id) {
    const all = getTodos();
    const t = all.find(x => x.id === id);
    if (!t) return;
    modal.open('任务详情', `
      <div style="margin-bottom:12px;">
        <div class="lbl" style="margin-bottom:6px;">📝 任务</div>
        <div style="font-size:15px;font-weight:700;color:var(--brown);">${esc(t.text)}</div>
      </div>
      <div style="margin-bottom:12px;">
        <div class="lbl" style="margin-bottom:6px;">🕐 开始时间</div>
        <input type="time" id="detailTime" class="field" value="${t.startTime || ''}" style="font-size:16px;padding:10px;" max="23:59">
        <div class="hint" style="margin-top:4px;">选择今天计划开始的时间（24 小时制）</div>
      </div>
      <div style="margin-bottom:12px;">
        <div class="lbl" style="margin-bottom:6px;">📊 完成进度 <span id="detailPctLbl" style="color:var(--orange);font-weight:700;">${t.progress || 0}%</span></div>
        <input type="range" id="detailProgress" min="0" max="100" value="${t.progress || 0}" style="width:100%;accent-color:var(--orange);">
        <div style="display:flex;justify-content:space-between;margin-top:2px;">
          <span class="hint">0%</span><span class="hint">50%</span><span class="hint">100%</span>
        </div>
      </div>
      <div style="margin-bottom:12px;">
        <div class="lbl" style="margin-bottom:6px;">💬 文字备注</div>
        <textarea id="detailNote" class="field" placeholder="写点补充说明…" maxlength="300" rows="3" style="resize:vertical;font-size:13px;">${esc(t.note || '')}</textarea>
      </div>
      <div class="row" style="margin-top:14px;">
        <button class="btn ghost grow" id="detailCancel">取消</button>
        <button class="btn grow" id="detailSave">保存备注</button>
      </div>`, (b) => {
      const timeInp = $('#detailTime', b);
      const progInp = $('#detailProgress', b);
      const noteInp = $('#detailNote', b);
      const pctLbl = $('#detailPctLbl', b);

      progInp.oninput = () => { pctLbl.textContent = progInp.value + '%'; };

      $('#detailCancel', b).onclick = () => modal.close();
      $('#detailSave', b).onclick = () => {
        const all2 = getTodos();
        const i = all2.findIndex(x => x.id === id);
        if (i < 0) return;
        all2[i].startTime = timeInp.value || '';
        all2[i].progress = Number(progInp.value) || 0;
        all2[i].note = noteInp.value.trim();
        setTodos(all2);
        modal.close(); drawList(); toast('备注已保存 🐾');
      };
    });
  }

  /* 多选月历 */
  function drawMultiCal() {
    const t = today();
    const mt = $('#mTitle'); if (mt) mt.textContent = `${mY} 年 ${mM + 1} 月`;
    const cells = monthMatrix(mY, mM);
    let html = WD.map(w => `<div class="cal-w" style="font-size:.7rem;">${w}</div>`).join('');
    cells.forEach(d => {
      if (!d) { html += `<div class="cal-d blank"></div>`; return; }
      const sel = multiDates.includes(d);
      const past = d < t;
      html += `<div class="cal-d ${d === t ? 'today' : ''} ${sel ? 'sel' : ''} ${past ? 'past' : ''}" data-md="${d}" style="cursor:pointer;">${parseYMD(d).getDate()}</div>`;
    });
    const grid = $('#mGrid');
    if (grid) {
      grid.innerHTML = html;
      $$('#mGrid .cal-d[data-md]').forEach(c => c.onclick = () => {
        const d = c.dataset.md;
        if (multiDates.includes(d)) multiDates = multiDates.filter(x => x !== d);
        else multiDates.push(d);
        drawMultiCal(); updateAddBtn();
      });
    }
    const mc = $('#mCount');
    if (mc) mc.textContent = multiDates.length ? `已选 ${multiDates.length} 天` : '点下方日期可多选（可跨月）';
  }

  /* 刷新「添加」按钮文案 */
  function updateAddBtn() {
    const btn = $('#tdAdd'); if (!btn) return;
    const t = today();
    if (multMode) {
      const n = multiDates.length;
      btn.innerHTML = `${Icons.plus()}添加到 <span>${n ? n + ' 天' : '（请选日期）'}</span>`;
    } else {
      const txt = selDate === t ? '今天' : niceDate(selDate);
      btn.innerHTML = `${Icons.plus()}添加到 <span>${txt}</span>`;
    }
    const addLbl = $('#addDateLbl');
    const singleLbl = $('#dtSingleLbl');
    if (multMode) {
      const n = multiDates.length;
      if (addLbl) addLbl.textContent = n ? `${n} 天` : '（请选日期）';
      if (singleLbl) singleLbl.textContent = '';
    } else {
      const txt = selDate === t ? '今天' : niceDate(selDate);
      if (addLbl) addLbl.textContent = txt;
      if (singleLbl) singleLbl.textContent = '记到：' + txt;
    }
  }

  function drawList() {
    const list = getTodos().filter(x => x.date === selDate).sort((a, b) => (a.done - b.done) || a.ts - b.ts);
    const box = $('#todoList');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.empty()}</div>这天还空空的，猫猫在打盹～</div>`;
      $('#doneCnt').textContent = '';
      return;
    }
    $('#doneCnt').textContent = `${list.filter(x => x.done).length}/${list.length} 完成`;
    box.innerHTML = list.map(t => {
      const timeStr = t.startTime || '';
      const prog = t.progress || 0;
      const noteStr = t.note || '';
      /* 进度条颜色 */
      let progColor = 'var(--orange)';
      if (prog >= 100) progColor = 'var(--green)';
      else if (prog >= 70) progColor = '#5F8F49';
      else if (prog >= 40) progColor = 'var(--orange)';
      return `<div class="todo-item ${t.done ? 'done' : ''}" data-id="${t.id}">
        <div class="circle" data-act="tg"></div>
        <div class="grow" data-act="detail">
          <div class="todo-txt">${esc(t.text)}</div>
          ${noteStr ? `<div class="todo-note">${esc(noteStr)}</div>` : ''}
          <div class="todo-meta">
            <span class="tag ${PRI[t.pri].c}">${PRI[t.pri].n}</span>
            <span class="tag ${CAT[t.cat].c}">${CAT[t.cat].n}</span>
          </div>
        </div>
        <div class="todo-detail-side">
          ${timeStr ? `<div class="todo-time">${timeStr}</div>` : '<div class="todo-time todo-time-empty"></div>'}
          <div class="todo-prog-wrap">
            <div class="todo-prog-bar" style="background:linear-gradient(90deg,${progColor},${progColor});width:${prog}%;"></div>
            <span class="todo-prog-txt">${prog}%</span>
          </div>
          <button class="todo-note-btn" data-act="detail">${t.note ? '✎ 已记' : '＋ 备注'}</button>
        </div>
        <div class="todo-del" data-act="del">×</div>
      </div>`;
    }).join('');
    box.onclick = (e) => {
      const it = e.target.closest('.todo-item'); if (!it) return;
      const act = e.target.dataset.act; if (!act) return;
      const all = getTodos(); const i = all.findIndex(x => x.id === it.dataset.id);
      if (i < 0) return;
      if (act === 'tg') { all[i].done = !all[i].done; setTodos(all); drawCal(); drawList(); }
      if (act === 'del') { all.splice(i, 1); setTodos(all); drawCal(); drawList(); toast('已删除'); }
      if (act === 'detail') { editTodoDetail(it.dataset.id); }
    };
  }

  /* ============ 2. 找点乐子 ============ */
  function renderFun(p) {
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.rabbit()}</span>想做的有趣事情 <small id="wishCnt"></small></div>
        <div class="row" style="margin-bottom:8px;">
          <button class="btn grow" id="wishAdd">${Icons.plus()}写一条</button>
          <button class="btn ghost" id="wishIdea">来点灵感</button>
          <button class="btn ghost" id="wishFilter">全部</button>
        </div>
        <div class="hint" style="margin-bottom:7px;">点小星星 ⭐ 把它标成「本周想完成的」，本周的会排在最前面</div>
        <div class="note-paper" id="wishPaper" style="--paw-bg:${Icons.pawPattern}"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.pen()}</span>未来信件箱 <small id="letterCnt"></small>
          <button class="chip sm" id="letterAdd" style="margin-left:auto;">${Icons.plus()}写一件</button></div>
        <div class="hint" style="margin-bottom:8px;">想解决的问题、想做的事，先存进这里。不限数量，慢慢推进就好 📩</div>
        <div id="letterList"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.dice()}</span>转个骰子交给天意 <small>点一下，3 秒揭晓</small></div>
        <div class="dice-area">
          <div class="dice" id="dice"></div>
          <div class="dice-slots" id="slots"></div>
        </div>
        <div class="row" style="margin-top:11px;justify-content:center;">
          <button class="btn ghost sm" id="diceClear">清空格子</button>
          <span class="hint" id="diceHint">数字会从左到右自动填进小方框</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.heart()}</span>给你的一张小便签
          <button class="chip sm" id="comfortNext" style="margin-left:auto;">换一句</button></div>
        <div class="note-paper" style="--paw-bg:${Icons.pawPattern}">
          <div class="comfort-note" id="comfortNote"></div>
        </div>
      </div>`;

    // 愿望
    drawWishes();
    $('#wishAdd').onclick = () => editWish(null);
    $('#wishIdea').onclick = addIdea;
    $('#wishFilter').onclick = (e) => {
      const cur = DB.get('wish.filter', 'all');
      const next = cur === 'all' ? 'week' : cur === 'week' ? 'todo' : cur === 'todo' ? 'done' : 'all';
      DB.set('wish.filter', next);
      e.target.textContent = WISH_LBL[next];
      drawWishes();
    };
    $('#wishFilter').textContent = WISH_LBL[DB.get('wish.filter', 'all')];

    // 未来信件箱
    drawLetters();
    $('#letterAdd').onclick = () => editLetter(null);

    // 骰子
    drawSlots();
    drawDice(DB.get('dice.last', 1));
    $('#dice').onclick = rollDice;
    $('#diceClear').onclick = () => { DB.set('dice.slots', []); drawSlots(); toast('格子清空啦'); };

    // 安慰小便签
    drawComfort();
    $('#comfortNext').onclick = () => {
      let i = Number(DB.get('comfort.idx', 0)) || 0;
      i = (i + 1) % COMFORT.length;
      DB.set('comfort.idx', i);
      drawComfort();
    };
  }

  /* --- 骰子 --- */
  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  function drawDice(n) {
    const set = new Set(PIPS[n] || [5]);
    $('#dice').innerHTML = Array.from({ length: 9 }, (_, i) =>
      set.has(i + 1) ? `<i class="pip"></i>` : `<i></i>`).join('');
  }
  function drawSlots() {
    const s = DB.get('dice.slots', []);
    $('#slots').innerHTML = Array.from({ length: 3 }, (_, i) =>
      `<div class="slot ${s[i] ? 'filled' : ''}">${s[i] || '?'}</div>`).join('');
  }
  let rolling = false;
  function rollDice() {
    if (rolling) return;
    rolling = true;
    const dice = $('#dice');
    dice.classList.add('rolling');
    $('#diceHint').textContent = '骰子转起来啦…';
    const iv = setInterval(() => drawDice(1 + Math.floor(Math.random() * 6)), 90);
    setTimeout(() => {
      clearInterval(iv);
      dice.classList.remove('rolling');
      const n = 1 + Math.floor(Math.random() * 6);
      drawDice(n); DB.set('dice.last', n);
      let s = DB.get('dice.slots', []);
      if (s.length >= 3) s = [];
      s.push(n); DB.set('dice.slots', s);
      drawSlots();
      $('#diceHint').textContent = `天意是：${n}！` + (s.length === 3 ? ' 三格满啦～' : '');
      rolling = false;
    }, 3000);
  }

  /* --- 愿望便签 --- */
  const IDEAS = ['去一次没去过的公园长椅上发呆一小时', '学会做一道拿手菜并拍照存档', '给三年后的自己写一封信', '整理一次衣柜，送走 10 件不穿的', '看一场早场电影，全场只有我', '去菜市场逛一圈，买一把最好看的花', '尝试一次陶艺或者手作', '连续七天早睡，看看皮肤变化', '把手机壁纸换成自己拍的照片', '学一首完整的歌并录下来', '去图书馆待一整个下午', '和三年没联系的朋友发条消息', '徒步 10 公里', '做一次城市 Citywalk 并写游记', '尝试一天不看社交软件', '学会一个魔术', '养一盆活得下去的植物', '写一篇 1000 字的胡思乱想', '去撸一次猫咖', '尝试冷水澡一周', '给爸妈做一顿饭', '看一次日出', '看一次日落并拍下来', '学会打一副麻将/桌游', '尝试写手账并坚持一个月', '一个人吃一次火锅', '去爬一座山', '学会游泳/自由泳换气', '试一次剧本杀', '把喜欢的诗抄在便签上贴起来', '尝试断舍离一个抽屉', '换一个从没试过的发型', '学一个新语言的 50 个单词', '做一次全身按摩', '去博物馆看一次特展', '尝试素食一周', '骑车沿着江边走一段', '给自己买一束花', '学会煮一杯手冲咖啡', '把童年最爱的动画重看一遍', '尝试早起五点看看世界', '写下 20 件让自己开心的小事', '去听一场 live', '学会一个乐器的一首曲子', '做一次公益或志愿活动', '和朋友来一次两日短途旅行', '在阳台上吃一顿早餐', '尝试自己剪辑一个 vlog', '把书架按颜色重新排列', '一天不说抱怨的话', '尝试冥想 10 分钟 ×7 天', '给房间换一个香薰味道', '学会缝扣子和简单改衣服', '去海边捡一颗石头带回家', '尝试盲盒式点餐', '写下自己的十大人生规则', '去一次动物园/水族馆', '学会拍好看的人像照片', '尝试一次露营', '把喜欢的电影台词做成手机壁纸', '连续记账 30 天', '尝试一个月不网购', '读完一本一直没读完的书', '学会做一份漂亮的早餐拼盘', '去参加一次读书会', '尝试写一首打油诗', '把旧照片洗出来做成相册', '学会一个简单的舞蹈片段', '去看一场话剧', '尝试一次夜跑', '学做一款甜品', '去古镇待两天', '给自己拍一组证件照', '尝试用左手写一天字', '整理手机相册删掉 500 张废图', '学会打领带/丝巾的三种系法', '去一次跳蚤市场', '尝试和陌生人搭话一次', '写一份自己的年度总结', '学会基础的急救知识', '尝试一天只用现金', '去一个只有一个字的地名玩', '尝试给植物写观察日记', '学会做手工皂或蜡烛', '看一次流星雨', '尝试一次 24 小时不开灯的夜晚', '把最爱的歌单刻录成一张 CD', '去大学校园里坐一下午', '尝试写小说的第一章', '学会用相机手动模式', '给自己设计一个 logo', '尝试一次桑拿或汗蒸', '把家里所有灯换成暖光', '学会做拉花', '尝试参加一次马拉松（哪怕是 5km）', '去寺庙抄一次经', '尝试养一只小宠物或云养', '学会修一件小家电', '写一封感谢信给帮过你的人', '尝试一天不坐电梯', '去看一次画展并临摹一张'];

  const WISH_LBL = { all: '全部', week: '本周', todo: '未完成', done: '已完成' };

  function drawWishes() {
    const all = DB.get('wishes', []).slice();
    const f = DB.get('wish.filter', 'all');
    const weekN = all.filter(x => x.week && !x.done).length;
    let list = f === 'all' ? all : f === 'week' ? all.filter(x => x.week) : f === 'todo' ? all.filter(x => !x.done) : all.filter(x => x.done);
    // 本周优先 → 未完成优先 → 早的在前
    list = list.slice().sort((a, b) =>
      ((b.week ? 1 : 0) - (a.week ? 1 : 0)) || ((a.done ? 1 : 0) - (b.done ? 1 : 0)) || ((a.ts || 0) - (b.ts || 0)));
    $('#wishCnt').textContent = all.length
      ? (weekN ? `本周 ${weekN} 条 · ` : '') + `共 ${all.length} 条，已实现 ${all.filter(x => x.done).length}`
      : '';
    const paper = $('#wishPaper');
    if (!list.length) {
      paper.innerHTML = `<div class="empty" style="position:relative;z-index:2;"><div class="e-ico">${Icons.empty()}</div>${
        f === 'week' ? '本周还没标记想做的事～<br>点小星星 ⭐ 就能把它放进本周清单'
          : '还没有想做的事～<br>点上面「写一条」或「来点灵感」开始吧'}</div>`;
      return;
    }
    paper.innerHTML = list.map((w, i) => `
      <div class="wish-item ${w.done ? 'done' : ''}" data-id="${w.id}">
        <span class="wish-no">${i + 1}.</span>
        <span class="wish-chk" data-act="tg"></span>
        <span class="wish-week ${w.week ? '' : 'off'}" data-act="week">${w.week ? '⭐ 本周' : '☆ 本周'}</span>
        <span class="wish-txt" data-act="edit">${safeHTML(w.html)}</span>
        <span class="todo-del" data-act="del">×</span>
      </div>`).join('');
    paper.onclick = (e) => {
      const it = e.target.closest('.wish-item'); if (!it) return;
      const a2 = e.target.closest('[data-act]');
      const act = e.target.dataset.act || (a2 ? a2.dataset.act : '');
      const arr = DB.get('wishes', []); const i = arr.findIndex(x => x.id === it.dataset.id);
      if (i < 0) return;
      if (act === 'tg') { arr[i].done = !arr[i].done; DB.set('wishes', arr); drawWishes(); }
      else if (act === 'week') { arr[i].week = !arr[i].week; DB.set('wishes', arr); drawWishes(); toast(arr[i].week ? '放进本周清单啦 ⭐' : '移出本周清单'); }
      else if (act === 'del') { arr.splice(i, 1); DB.set('wishes', arr); drawWishes(); toast('已删除'); }
      else if (act === 'edit') editWish(arr[i].id);
    };
  }

  /* --- 未来信件箱 --- */
  const getLetters = () => DB.get('future.letters', []);
  const setLetters = (v) => DB.set('future.letters', v);

  function drawLetters() {
    const box = $('#letterList'); if (!box) return;
    const all = getLetters().slice().sort((a, b) =>
      ((a.done ? 1 : 0) - (b.done ? 1 : 0)) || ((b.ts || 0) - (a.ts || 0)));
    const cnt = $('#letterCnt');
    if (cnt) {
      const doneN = all.filter(x => x.done || Number(x.progress) >= 100).length;
      cnt.textContent = all.length ? `${all.length} 件 · 完成 ${doneN}` : '';
    }
    if (!all.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.pen()}</div>信件箱还是空的～<br>想到什么想解决的、想做的，就先投一封进来吧</div>`;
      return;
    }
    box.innerHTML = all.map(l => {
      const p = Math.max(0, Math.min(100, Number(l.progress) || 0));
      const stage = (l.stage || '').trim() || (p >= 100 ? '已经搞定啦 🎉' : p > 0 ? '正在推进中' : '还没开始');
      return `<div class="rec-item letter-item ${l.done ? 'done' : ''}" data-id="${l.id}">
        <div class="rec-ico">${p >= 100 ? '💌' : '📩'}</div>
        <div class="rec-main">
          <div class="t">${esc(l.title)}</div>
          <div class="lt-stage">📍 ${esc(stage)}</div>
          <div class="row" style="gap:6px;margin-top:4px;">
            <span class="lt-bar"><i style="width:${p}%"></i></span>
          </div>
        </div>
        <div class="lt-pct">${p}%</div>
      </div>`;
    }).join('');
    $$('#letterList .letter-item').forEach(it => it.onclick = () => editLetter(it.dataset.id));
  }

  function editLetter(id) {
    const arr = getLetters();
    const l = id ? arr.find(x => x.id === id) : null;
    const p0 = l ? (Number(l.progress) || 0) : 0;
    modal.open(l ? '这封信' : '写进未来信件箱', `
      <span class="lbl">想解决 / 想做的事</span>
      <input class="field" id="ltTitle" placeholder="比如：把阳台收拾出来" value="${esc(l ? l.title : '')}" maxlength="40">
      <span class="lbl" style="margin-top:10px;">现在到什么阶段了</span>
      <textarea class="field" id="ltStage" style="min-height:60px;" placeholder="比如：收纳箱已经买了，还差分类">${esc(l ? (l.stage || '') : '')}</textarea>
      <span class="lbl" style="margin-top:10px;">完成进度 <b id="ltPctTxt" style="color:var(--orange-d);">${p0}%</b></span>
      <input class="lt-slider" id="ltRange" type="range" min="0" max="100" step="5" value="${p0}">
      <div class="lt-quick">
        ${[[0, '刚记下'], [25, '想清楚了'], [50, '开始动了'], [75, '过半啦'], [100, '搞定啦']]
        .map(([v, n]) => `<button class="chip sm" data-v="${v}">${n}</button>`).join('')}
      </div>
      <div class="row" style="margin-top:13px;">
        ${l ? '<button class="btn danger" id="ltDel">删除</button>' : ''}
        <button class="btn grow" id="ltSave">${l ? '保存' : '投进信箱'}</button>
      </div>`, (b) => {
      const rg = $('#ltRange', b), tx = $('#ltPctTxt', b);
      rg.oninput = () => { tx.textContent = rg.value + '%'; };
      $$('.lt-quick .chip', b).forEach(c => c.onclick = () => { rg.value = c.dataset.v; tx.textContent = c.dataset.v + '%'; });
      $('#ltSave', b).onclick = () => {
        const t = $('#ltTitle', b).value.trim();
        if (!t) { toast('先写点什么呀'); return; }
        const p = Math.max(0, Math.min(100, Number(rg.value) || 0));
        const st = $('#ltStage', b).value.trim();
        const list = getLetters();
        if (l) {
          const i = list.findIndex(x => x.id === l.id);
          if (i >= 0) { list[i].title = t; list[i].stage = st; list[i].progress = p; list[i].done = p >= 100; list[i].updatedAt = Date.now(); }
        } else {
          list.unshift({ id: uid(), title: t, stage: st, progress: p, done: p >= 100, ts: Date.now(), updatedAt: Date.now() });
        }
        setLetters(list); modal.close(); drawLetters();
        toast(p >= 100 ? '搞定一件，厉害！🎉' : '记下啦，慢慢来～');
      };
      const del = $('#ltDel', b);
      if (del) del.onclick = async () => {
        if (await confirmBox('把这封信删掉？')) {
          setLetters(getLetters().filter(x => x.id !== l.id));
          modal.close(); drawLetters(); toast('已删除');
        }
      };
    });
  }

  /* --- 安慰小便签 --- */
  const COMFORT = [
    '待办很多也没关系呀。\n你不需要今天就全部做完，只要挑一件开始，现状就已经在变好了。剩下的，明天还有明天。',
    '列表长不代表你落后了。\n能想到这么多想做的事，说明你在认真生活。一件一件来，做一件少一件。',
    '不用怕。\n没做完的那部分，不是失败，只是还没轮到它。今天能做一个，就是一个的进步。',
    '如果今天只做了一件事，那也已经比昨天多了一件。\n慢慢来，比较快。我在这儿陪着你。',
    '你现在的样子就已经很好了。\n待办是为了服务生活，不是为了证明你不够努力。累了就先歇会儿。',
    '再长的清单，也是从第一行开始的。\n挑最小最容易的那条先做掉，剩下的会突然变得没那么可怕。',
    '别担心来不及。\n你走过的每一步都算数，哪怕只是把水喝了、把床铺了，今天也没有白过。',
    '给自己一点耐心吧。\n你已经在同时照顾很多事情了，能做一个是一个，每一个都会让现状更好一点点。'
  ];

  function drawComfort() {
    const box = $('#comfortNote'); if (!box) return;
    let i = DB.get('comfort.idx', -1);
    if (i === null || i === undefined || Number(i) < 0) {
      i = Math.floor(Math.random() * COMFORT.length);
      DB.set('comfort.idx', i);
    }
    box.textContent = COMFORT[Number(i) % COMFORT.length];
  }

  function addIdea() {
    const arr = DB.get('wishes', []);
    const used = new Set(arr.map(x => (x.html || '').replace(/<[^>]+>/g, '')));
    const pool = IDEAS.filter(x => !used.has(x));
    if (!pool.length) { toast('灵感库都用完啦，你太猛了'); return; }
    const n = Math.min(5, pool.length);
    const picked = [];
    const cp = pool.slice();
    for (let i = 0; i < n; i++) picked.push(cp.splice(Math.floor(Math.random() * cp.length), 1)[0]);
    picked.forEach(t => arr.push({ id: uid(), html: esc(t), done: false, ts: Date.now() }));
    DB.set('wishes', arr);
    drawWishes();
    toast(`喵~ 塞了 ${n} 条灵感进去`);
  }

  function editWish(id) {
    const arr = DB.get('wishes', []);
    const w = id ? arr.find(x => x.id === id) : null;
    modal.open(w ? '编辑这条' : '写一条想做的事', `
      <div class="rt-bar">
        <button class="rt-btn" data-cmd="bold" style="font-weight:900;">B 加粗</button>
        <button class="rt-btn" data-cmd="italic" style="font-style:italic;">I 斜体</button>
        <button class="rt-btn" data-cmd="fs-up">A+ 字号</button>
        <button class="rt-btn" data-cmd="fs-down">A- 字号</button>
        <button class="rt-btn" data-cmd="color">🖍 颜色</button>
        <button class="rt-btn" data-cmd="clear">清格式</button>
      </div>
      <div class="rt-edit" id="rtEdit" contenteditable="true">${w ? safeHTML(w.html) : ''}</div>
      <div class="hint" style="margin-top:6px;">小提示：先选中文字，再点加粗 / 字号哦</div>
      <div class="row" style="margin-top:12px;">
        <button class="btn ghost grow" id="rtCancel">取消</button>
        <button class="btn grow" id="rtSave">保存</button>
      </div>`, (b) => {
      const ed = $('#rtEdit', b);
      let fs = 3;
      ed.focus();
      $$('.rt-btn', b).forEach(btn => btn.onmousedown = (e) => {
        e.preventDefault();
        const c = btn.dataset.cmd;
        ed.focus();
        try {
          if (c === 'bold') document.execCommand('bold');
          else if (c === 'italic') document.execCommand('italic');
          else if (c === 'fs-up') { fs = Math.min(7, fs + 1); document.execCommand('fontSize', false, fs); }
          else if (c === 'fs-down') { fs = Math.max(1, fs - 1); document.execCommand('fontSize', false, fs); }
          else if (c === 'color') { const cs = ['#D2604E', '#E08A22', '#5F8F49', '#5789A9', '#8467A9', '#6B4630']; document.execCommand('foreColor', false, cs[Math.floor(Math.random() * cs.length)]); }
          else if (c === 'clear') document.execCommand('removeFormat');
        } catch (err) { }
      });
      $('#rtCancel', b).onclick = () => modal.close();
      $('#rtSave', b).onclick = () => {
        const html = safeHTML(ed.innerHTML).trim();
        if (!html || !ed.textContent.trim()) { toast('写点什么再保存呀'); return; }
        const list = DB.get('wishes', []);
        if (w) { const i = list.findIndex(x => x.id === w.id); if (i >= 0) list[i].html = html; }
        else list.push({ id: uid(), html, done: false, ts: Date.now() });
        DB.set('wishes', list);
        modal.close(); drawWishes(); toast('保存好啦');
      };
    });
  }

  /* ============ 3. 今日心情 ============ */
  let diaryMode = 'type';
  let viewDate = null;

  function renderMood(p) {
    viewDate = viewDate || today();
    const d = getDiary(viewDate) || { mood: '', html: '', hand: '' };
    diaryMode = d.hand && !d.html ? 'hand' : 'type';

    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.cat()}</span>${viewDate === today() ? '今天' : niceDate(viewDate)}的心情 <small>${viewDate}</small></div>
        <div class="mood-picker" id="moodPick">
          ${Object.keys(MOODS).map(k => `<div class="mood-opt ${d.mood === k ? 'on' : ''}" data-m="${k}">${Icons[MOODS[k].ico]()}<div class="mn">${MOODS[k].n}</div></div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>日记本
          <small><button class="chip sm" id="dateBack">◀</button> <button class="chip sm" id="dateToday">今天</button> <button class="chip sm" id="dateFwd">▶</button></small>
        </div>
        <div class="slide-switch ${diaryMode === 'hand' ? 'right' : ''}" id="modeSw">
          <div class="thumb"></div>
          <div class="sw ${diaryMode === 'type' ? 'on' : ''}" data-m="type">${Icons.pen()}打字模式</div>
          <div class="sw ${diaryMode === 'hand' ? 'on' : ''}" data-m="hand">${Icons.paw()}手写模式</div>
        </div>

        <div id="typePane" style="display:${diaryMode === 'type' ? 'block' : 'none'}">
          <div class="diary-toolbar">
            <button class="rt-btn" data-cmd="bold" style="font-weight:900;">B</button>
            <button class="rt-btn" data-cmd="fs-up">A+</button>
            <button class="rt-btn" data-cmd="fs-down">A-</button>
            <button class="rt-btn" data-cmd="color">🖍</button>
            <button class="rt-btn" id="addImg">🖼 图片</button>
          </div>
          <span class="lbl">贴纸（点一下贴上去）</span>
          <div class="sticker-bar" id="stickers"></div>
          <div class="diary-edit" id="diaryEdit" contenteditable="true" style="margin-top:8px;">${safeHTML(d.html || '')}</div>
        </div>

        <div id="handPane" style="display:${diaryMode === 'hand' ? 'block' : 'none'}">
          <div class="hand-wrap">
            <div class="pen-bar" id="penBar">
              <span class="pen-dot on" data-c="#6B4630" style="background:#6B4630"></span>
              <span class="pen-dot" data-c="#E08A22" style="background:#E08A22"></span>
              <span class="pen-dot" data-c="#D2604E" style="background:#D2604E"></span>
              <span class="pen-dot" data-c="#5F8F49" style="background:#5F8F49"></span>
              <span class="pen-dot" data-c="#5789A9" style="background:#5789A9"></span>
              <span style="width:1px;height:20px;background:var(--line2);"></span>
              <button class="chip sm" data-w="2">细</button>
              <button class="chip sm on" data-w="3.4">中</button>
              <button class="chip sm" data-w="6">粗</button>
              <button class="chip sm" id="eraser">橡皮</button>
              <button class="chip sm" id="clearHand">清空</button>
            </div>
            <canvas id="handCv"></canvas>
          </div>
        </div>

        <div class="row" style="margin-top:11px;">
          <button class="btn ghost grow" id="delDiary">删除本篇</button>
          <button class="btn grow" id="saveDiary">保存日记</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.calendar()}</span>本周心情 <small id="weekRange"></small></div>
        <div class="week-row" id="weekRow"></div>
        <div class="row" style="margin-top:11px;">
          <button class="btn ghost grow" id="seeEarlier">查看更早的日记</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.gear()}</span>数据管理</div>
        <div class="row wrap">
          <button class="btn ghost sm" id="bkNow">立即备份导出</button>
          <button class="btn ghost sm" id="goClean">内存优化设置</button>
        </div>
        <div class="hint" style="margin-top:7px;">日记、图片都存在你自己的手机里，刷新和关机都不会丢。删除只由你决定 🐾</div>
      </div>`;

    $$('#diaryEdit img', p).forEach(im => im.classList.add('clickable-img'));

    $$('#moodPick .mood-opt').forEach(o => o.onclick = () => {
      const cur = getDiary(viewDate) || {};
      cur.mood = cur.mood === o.dataset.m ? '' : o.dataset.m;
      cur.ts = Date.now();
      setDiary(viewDate, cur);
      $$('#moodPick .mood-opt').forEach(x => x.classList.toggle('on', x.dataset.m === cur.mood));
      drawWeek();
      toast(cur.mood ? '心情记下啦 ' + MOODS[cur.mood].n : '心情已清除');
    });

    // 模式切换
    $$('#modeSw .sw').forEach(s => s.onclick = () => {
      diaryMode = s.dataset.m;
      $('#modeSw').classList.toggle('right', diaryMode === 'hand');
      $$('#modeSw .sw').forEach(x => x.classList.toggle('on', x === s));
      $('#typePane').style.display = diaryMode === 'type' ? 'block' : 'none';
      $('#handPane').style.display = diaryMode === 'hand' ? 'block' : 'none';
      if (diaryMode === 'hand') initCanvas();
    });

    // 富文本
    $$('#typePane .rt-btn[data-cmd]').forEach(btn => btn.onmousedown = (e) => {
      e.preventDefault();
      const ed = $('#diaryEdit'); ed.focus();
      const c = btn.dataset.cmd;
      let fs = Number(DB.get('diary.fs', 3));
      try {
        if (c === 'bold') document.execCommand('bold');
        else if (c === 'fs-up') { fs = Math.min(7, fs + 1); DB.set('diary.fs', fs); document.execCommand('fontSize', false, fs); }
        else if (c === 'fs-down') { fs = Math.max(1, fs - 1); DB.set('diary.fs', fs); document.execCommand('fontSize', false, fs); }
        else if (c === 'color') { const cs = ['#D2604E', '#E08A22', '#5F8F49', '#5789A9', '#8467A9']; document.execCommand('foreColor', false, cs[Math.floor(Math.random() * cs.length)]); }
      } catch (err) { }
    });
    $('#addImg').onclick = async () => {
      const img = await pickImage(1400);
      if (!img) return;
      const ed = $('#diaryEdit'); ed.focus();
      document.execCommand('insertHTML', false, `<img src="${img}">`);
      toast('图片贴上啦');
    };

    const STK = ['🐱', '🐶', '🐰', '🐭', '🐻', '🌸', '☀️', '🌙', '⭐', '🍰', '☕', '🍦', '🌈', '💧', '🔥', '💌', '🎀', '🧸', '🍀', '📌', '✨', '🫧', '🍓', '🐾'];
    $('#stickers').innerHTML = STK.map(s => `<div class="st">${s}</div>`).join('');
    $$('#stickers .st').forEach(s => s.onclick = () => {
      const ed = $('#diaryEdit'); ed.focus();
      document.execCommand('insertHTML', false, `<span style="font-size:24px">${s.textContent}</span>`);
    });

    $('#saveDiary').onclick = saveDiary;
    $('#delDiary').onclick = async () => {
      if (!getDiary(viewDate)) { toast('这天还没有日记'); return; }
      if (await confirmBox(`确定删除 ${viewDate} 的日记吗？删了就找不回来啦。`, '删除')) {
        DB.del('diary:' + viewDate); toast('已删除'); renderMood(p);
      }
    };
    $('#dateBack').onclick = () => { const d = parseYMD(viewDate); d.setDate(d.getDate() - 1); viewDate = ymd(d); renderMood(p); };
    $('#dateFwd').onclick = () => { const d = parseYMD(viewDate); d.setDate(d.getDate() + 1); if (ymd(d) > today()) { toast('未来还没发生呢～'); return; } viewDate = ymd(d); renderMood(p); };
    $('#dateToday').onclick = () => { viewDate = today(); renderMood(p); };
    $('#seeEarlier').onclick = showEarlier;
    $('#bkNow').onclick = () => { UI.download(`三花日常备份_${today()}.json`, JSON.stringify(DB.all())); toast('备份文件已导出'); };
    $('#goClean').onclick = () => App.go('settings');

    drawWeek();
    if (diaryMode === 'hand') initCanvas();
  }

  function saveDiary() {
    const cur = getDiary(viewDate) || {};
    if (diaryMode === 'type') {
      cur.html = safeHTML($('#diaryEdit').innerHTML);
    } else {
      const cv = $('#handCv');
      if (cv) { try { cur.hand = cv.toDataURL('image/png'); } catch (e) { } }
    }
    cur.ts = Date.now();
    setDiary(viewDate, cur);
    DB.flushNow();
    drawWeek();
    toast('日记保存好啦 ✍️');
  }

  function drawWeek() {
    const days = weekOf(today());
    const t = today();
    $('#weekRange').textContent = `${niceDate(days[0]) === '今天' ? days[0].slice(5) : days[0].slice(5)} ~ ${days[6].slice(5)}`;
    $('#weekRow').innerHTML = days.map((d, i) => {
      const dd = getDiary(d);
      const m = dd && dd.mood;
      const hasContent = dd && ((dd.html && dd.html.replace(/<[^>]+>/g, '').trim()) || dd.hand);
      return `<div class="week-cell">
        <div class="wd">${['一', '二', '三', '四', '五', '六', '日'][i]}</div>
        <div class="wbox ${d === t ? 'today' : ''}" data-d="${d}">
          ${m ? Icons[MOODS[m].ico]() : `<span class="none">${hasContent ? '📝' : '·'}</span>`}
          <span class="dnum">${Number(d.slice(8))}</span>
        </div>
      </div>`;
    }).join('');
    $$('#weekRow .wbox').forEach(b => b.onclick = () => { viewDate = b.dataset.d; renderMood($('#todoPane')); });
  }

  function showEarlier() {
    const ds = diaryDates().filter(d => (getDiary(d) || {}).mood || (getDiary(d) || {}).html || (getDiary(d) || {}).hand);
    if (!ds.length) { toast('还没有更早的日记哦'); return; }
    modal.open('更早的日记', `<div id="oldList">${ds.map(d => {
      const dd = getDiary(d) || {};
      const txt = (dd.html || '').replace(/<[^>]+>/g, '').slice(0, 40) || (dd.hand ? '（手写日记）' : '（仅心情）');
      return `<div class="rec-item" data-d="${d}">
        <div class="rec-ico" style="padding:3px;">${dd.mood ? Icons[MOODS[dd.mood].ico]() : '📝'}</div>
        <div class="rec-main"><div class="t">${d} 星期${UI.wdOf(d)}</div><div class="s">${esc(txt)}</div></div>
        <span class="chip sm">查看</span>
      </div>`;
    }).join('')}</div>`, (b) => {
      $$('#oldList .rec-item', b).forEach(it => it.onclick = () => {
        viewDate = it.dataset.d; modal.close(); renderMood($('#todoPane'));
      });
    });
  }

  /* 手写画布 */
  function initCanvas() {
    const cv = $('#handCv'); if (!cv) return;
    const wrap = cv.parentElement;
    const w = wrap.clientWidth, h = 320;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (cv.dataset.init !== '1' || cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.height = h + 'px';
      const ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      cv.dataset.init = '1';
      const d = getDiary(viewDate);
      if (d && d.hand) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, w, h); im.src = d.hand; }
    }
    const ctx = cv.getContext('2d');
    let color = '#6B4630', width = 3.4, drawing = false, erase = false;

    $$('#penBar .pen-dot').forEach(p => p.onclick = () => {
      color = p.dataset.c; erase = false;
      $$('#penBar .pen-dot').forEach(x => x.classList.toggle('on', x === p));
      $('#eraser').classList.remove('on');
    });
    $$('#penBar .chip[data-w]').forEach(c => c.onclick = () => {
      width = Number(c.dataset.w);
      $$('#penBar .chip[data-w]').forEach(x => x.classList.toggle('on', x === c));
    });
    $('#eraser').onclick = (e) => { erase = !erase; e.target.classList.toggle('on', erase); };
    $('#clearHand').onclick = async () => {
      if (await confirmBox('清空这张手写纸？')) { ctx.clearRect(0, 0, cv.width, cv.height); }
    };

    const pos = (e) => {
      const r = cv.getBoundingClientRect();
      const p = e.touches ? e.touches[0] : e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };
    const start = (e) => {
      drawing = true; const { x, y } = pos(e);
      ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
      ctx.strokeStyle = color; ctx.lineWidth = erase ? 16 : width;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + .01, y);
      ctx.stroke();
    };
    const move = (e) => { if (!drawing) return; e.preventDefault(); const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke(); };
    const end = () => { drawing = false; };
    cv.ontouchstart = start; cv.ontouchmove = move; cv.ontouchend = end;
    cv.onmousedown = start; cv.onmousemove = move; cv.onmouseup = end; cv.onmouseleave = end;
  }

  window.Modules = window.Modules || {};
  window.Modules.todo = { id: 'todo', name: '日程待办', desc: '今天也要元气满满呀', icon: 'cat', render };
})();
