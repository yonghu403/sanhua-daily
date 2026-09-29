/* ===== 模块：赚一笔 · 好习惯奖赏罐（与「来记记账」完全独立的账户） ===== */
(function () {
  const { $, $$, esc, uid, today, pad, ymd, parseYMD, niceDate, wdOf, weekOf, toast, modal, confirmBox, money } = UI;

  const EMOJIS = ['🏃', '📚', '💧', '🧘', '🌙', '🥗', '✍️', '🧹', '💪', '☀️', '🦷', '🎯',
    '🎸', '🚿', '🍎', '🧴', '📵', '🚭', '🛏️', '🧠', '🌱', '🙏'];

  const KH = 'earn.habits', KL = 'earn.logs', KS = 'earn.spends';
  const getHabits = () => DB.get(KH, []);
  const setHabits = (v) => DB.set(KH, v);
  const getLogs = () => DB.get(KL, []);
  const setLogs = (v) => DB.set(KL, v);
  const getSpends = () => DB.get(KS, []);
  const setSpends = (v) => DB.set(KS, v);

  let checkDate = today();
  let statKind = DB.get('pref.earnKind', 'month');
  let statAnchor = today();
  let logsOpen = !DB.get('pref.earnLogsCollapsed', false);
  let spendOpen = !DB.get('pref.earnSpendCollapsed', false);
  let emoPick = EMOJIS[0];

  const sum = (a) => a.reduce((x, y) => x + (Number(y) || 0), 0);
  const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
  const setTxt = (id, v) => { const e = $('#' + id); if (e) e.textContent = v; };
  const fmt0 = (v) => {
    v = Number(v) || 0;
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
    return String(Math.round(v * 10) / 10);
  };
  const shiftDay = (ds, n) => { const d = parseYMD(ds); d.setDate(d.getDate() + n); return ymd(d); };

  /* ---------- 区间计算 ---------- */
  function rangeOf(kind, anchor) {
    const d = parseYMD(anchor);
    const y = d.getFullYear(), m = d.getMonth();
    if (kind === 'week') {
      const w = weekOf(anchor);
      return { from: w[0], to: w[6], label: `${w[0].slice(5).replace('-', '/')} ~ ${w[6].slice(5).replace('-', '/')}` };
    }
    if (kind === 'month') {
      const last = new Date(y, m + 1, 0).getDate();
      return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${pad(last)}`, label: `${y}年${m + 1}月` };
    }
    if (kind === 'quarter') {
      const q = Math.floor(m / 3), s = q * 3;
      const last = new Date(y, s + 3, 0).getDate();
      return { from: `${y}-${pad(s + 1)}-01`, to: `${y}-${pad(s + 3)}-${pad(last)}`, label: `${y}年 第${q + 1}季度` };
    }
    if (kind === 'year') return { from: `${y}-01-01`, to: `${y}-12-31`, label: `${y}年` };
    return { from: '0000-01-01', to: '9999-12-31', label: '全部时间' };
  }

  function shiftAnchor(kind, anchor, dir) {
    const d = parseYMD(anchor);
    if (kind === 'week') d.setDate(d.getDate() + dir * 7);
    else if (kind === 'month') d.setMonth(d.getMonth() + dir);
    else if (kind === 'quarter') d.setMonth(d.getMonth() + dir * 3);
    else if (kind === 'year') d.setFullYear(d.getFullYear() + dir);
    return ymd(d);
  }

  function makeBuckets(kind, r) {
    const out = [];
    const p = (s) => s.split('-').map(Number);
    if (kind === 'week') {
      const w = weekOf(r.from), L = ['一', '二', '三', '四', '五', '六', '日'];
      w.forEach((ds, i) => out.push({ label: L[i], from: ds, to: ds }));
    } else if (kind === 'month') {
      const [y, m] = p(r.from); const last = new Date(y, m, 0).getDate();
      for (let i = 1; i <= last; i++) { const ds = `${y}-${pad(m)}-${pad(i)}`; out.push({ label: String(i), from: ds, to: ds }); }
    } else if (kind === 'quarter') {
      const [y, m] = p(r.from);
      for (let i = 0; i < 3; i++) {
        const mm = m + i; const last = new Date(y, mm, 0).getDate();
        out.push({ label: `${mm}月`, from: `${y}-${pad(mm)}-01`, to: `${y}-${pad(mm)}-${pad(last)}` });
      }
    } else if (kind === 'year') {
      const y = p(r.from)[0];
      for (let i = 1; i <= 12; i++) {
        const last = new Date(y, i, 0).getDate();
        out.push({ label: String(i), from: `${y}-${pad(i)}-01`, to: `${y}-${pad(i)}-${pad(last)}` });
      }
    } else {
      const ys = {};
      getLogs().forEach(l => { const y = (l.date || '').slice(0, 4); if (y) ys[y] = 1; });
      getSpends().forEach(s => { const y = (s.date || '').slice(0, 4); if (y) ys[y] = 1; });
      const arr = Object.keys(ys).sort();
      const list = arr.length ? arr : [String(new Date().getFullYear())];
      list.forEach(y => out.push({ label: y.slice(2) + '年', from: `${y}-01-01`, to: `${y}-12-31` }));
    }
    return out;
  }

  /* 连续打卡天数 */
  function streak() {
    const set = new Set(getLogs().map(l => l.date));
    const t = today();
    let n = 0, d = parseYMD(t), guard = 0;
    while (guard++ < 800) {
      const k = ymd(d);
      if (set.has(k)) { n++; d.setDate(d.getDate() - 1); }
      else if (k === t) { d.setDate(d.getDate() - 1); }
      else break;
    }
    return n;
  }

  /* ---------- 主渲染 ---------- */
  function render(root) {
    root.innerHTML = `
      <div class="card earn-hero">
        <div class="eh-top">
          <div>
            <div class="eh-title">🐷 我的奖赏小金猪</div>
            <div class="eh-sub">好习惯攒下的钱，只属于你自己</div>
          </div>
          <div class="eh-pig">${Icons.pigGold()}</div>
        </div>
        <div class="earn-row">
          <div class="ei"><div class="v v-in" id="eEarned">0.00</div><div class="k">累计赚得</div></div>
          <div class="ei"><div class="v v-out" id="eSpent">0.00</div><div class="k">已花掉</div></div>
          <div class="ei"><div class="v v-bal" id="eLeft">0.00</div><div class="k">还能花</div></div>
        </div>
        <div class="hint" style="text-align:center;margin-top:7px;">和「来记记账」完全分开 · 这里只记好习惯换来的钱 ✨</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.paw()}</span>习惯打卡 <small id="ckSum"></small>
          <button class="chip sm" id="addHabit" style="margin-left:auto;">＋ 加习惯</button></div>
        <div class="row" style="justify-content:space-between;margin-bottom:9px;">
          <div class="row" style="gap:5px;">
            <button class="chip sm" id="ckPrev">‹</button>
            <button class="chip sm on" id="ckLabel"></button>
            <button class="chip sm" id="ckNext">›</button>
          </div>
          <input class="field" id="ckDate" type="date" style="width:138px;">
        </div>
        <div id="habitList"></div>
        <div class="hint" id="streakTip" style="margin-top:7px;"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.calendar()}</span>完成情况看板</div>
        <div class="chip-group" id="kindGrp" style="margin-bottom:8px;">
          ${[['week', '周'], ['month', '月'], ['quarter', '季度'], ['year', '年'], ['all', '全部']]
        .map(([k, n]) => `<button class="chip sm ${statKind === k ? 'on' : ''}" data-k="${k}">${n}</button>`).join('')}
        </div>
        <div class="row" style="justify-content:space-between;margin-bottom:9px;" id="stNav">
          <div class="row" style="gap:5px;">
            <button class="chip sm" id="stPrev">‹</button>
            <button class="chip sm on" id="stLabel"></button>
            <button class="chip sm" id="stNext">›</button>
          </div>
          <button class="chip sm" id="stNow">回到今天</button>
        </div>
        <div id="statBody"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>我买了什么 <small id="spendCnt"></small>
          <button class="chip sm" id="spendToggle" style="margin-left:auto;">${spendOpen ? '▼ 收起' : '▶ 展开'}</button></div>
        <div id="spendBody"${spendOpen ? '' : ' style="display:none;"'}>
          <div class="row">
            <input class="field grow" id="spItem" placeholder="用赚到的钱买了啥？" maxlength="40">
            <input class="field" id="spAmt" type="number" inputmode="decimal" step="0.01" placeholder="¥" style="width:88px;">
          </div>
          <div class="row" style="margin-top:8px;">
            <input class="field grow" id="spDate" type="date">
            <button class="btn" id="spAdd">记下花销</button>
          </div>
          <div class="hint" id="spLeft" style="margin-top:7px;"></div>
          <div class="divider"></div>
          <div id="spendList"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>赚取明细 <small id="logCnt"></small>
          <button class="chip sm" id="logToggle" style="margin-left:auto;">${logsOpen ? '▼ 收起' : '▶ 展开'}</button></div>
        <div id="logBody"${logsOpen ? '' : ' style="display:none;"'}><div id="logList"></div></div>
      </div>`;

    $('#addHabit').onclick = () => habitDialog(null);
    $('#ckPrev').onclick = () => { checkDate = shiftDay(checkDate, -1); refreshAll(); };
    $('#ckNext').onclick = () => {
      if (checkDate >= today()) { toast('还没到明天呢 🐷'); return; }
      checkDate = shiftDay(checkDate, 1); refreshAll();
    };
    $('#ckLabel').onclick = () => { checkDate = today(); refreshAll(); };
    const cdi = $('#ckDate'); cdi.value = checkDate;
    cdi.onchange = () => { if (cdi.value) { checkDate = cdi.value; refreshAll(); } };

    $$('#kindGrp .chip').forEach(c => c.onclick = () => {
      statKind = c.dataset.k;
      DB.set('pref.earnKind', statKind);
      statAnchor = today();
      $$('#kindGrp .chip').forEach(x => x.classList.toggle('on', x === c));
      refreshAll();
    });
    $('#stPrev').onclick = () => { statAnchor = shiftAnchor(statKind, statAnchor, -1); refreshAll(); };
    $('#stNext').onclick = () => { statAnchor = shiftAnchor(statKind, statAnchor, 1); refreshAll(); };
    $('#stNow').onclick = () => { statAnchor = today(); refreshAll(); };

    $('#spendToggle').onclick = () => {
      spendOpen = !spendOpen;
      $('#spendBody').style.display = spendOpen ? '' : 'none';
      $('#spendToggle').textContent = spendOpen ? '▼ 收起' : '▶ 展开';
      DB.set('pref.earnSpendCollapsed', !spendOpen);
    };
    $('#logToggle').onclick = () => {
      logsOpen = !logsOpen;
      $('#logBody').style.display = logsOpen ? '' : 'none';
      $('#logToggle').textContent = logsOpen ? '▼ 收起' : '▶ 展开';
      DB.set('pref.earnLogsCollapsed', !logsOpen);
    };
    $('#spAdd').onclick = addSpend;
    $('#spDate').value = today();

    refreshAll();
  }

  /* ---------- 刷新 ---------- */
  function refreshAll() {
    const logs = getLogs(), sps = getSpends();
    const earned = sum(logs.map(l => l.amount)), spent = sum(sps.map(s => s.amount));
    setTxt('eEarned', money(earned));
    setTxt('eSpent', money(spent));
    const el = $('#eLeft');
    if (el) { el.textContent = money(earned - spent); el.style.color = (earned - spent) >= 0 ? 'var(--brown)' : '#D2604E'; }
    setTxt('spLeft', '');
    const lb = $('#ckLabel');
    if (lb) lb.textContent = `${niceDate(checkDate)} · ${checkDate.slice(5).replace('-', '/')} 周${wdOf(checkDate)}`;
    const cdi = $('#ckDate'); if (cdi) cdi.value = checkDate;
    const st = $('#streakTip');
    if (st) st.textContent = logs.length ? `🔥 已连续打卡 ${streak()} 天 · 累计完成 ${logs.length} 次` : '每完成一次习惯，小金猪就会多一枚硬币～';
    drawHabits();
    drawStat();
    drawSpends();
    drawLogs();
    const spL = $('#spLeft');
    if (spL) {
      const left = earned - spent;
      spL.innerHTML = left >= 0
        ? `当前余额 <b style="color:var(--brown);">¥${money(left)}</b>（累计赚 ¥${money(earned)} − 已花 ¥${money(spent)}）`
        : `⚠️ 已超支 <b style="color:#D2604E;">¥${money(-left)}</b>，小金猪有点空啦～`;
    }
  }

  /* ---------- 习惯打卡 ---------- */
  function drawHabits() {
    const habits = getHabits();
    const box = $('#habitList'); if (!box) return;
    const dayLogs = getLogs().filter(l => l.date === checkDate);
    const totalToday = sum(dayLogs.map(l => l.amount));
    const doneN = new Set(dayLogs.map(l => l.habitId)).size;
    setTxt('ckSum', habits.length ? `完成 ${doneN}/${habits.length} · +¥${money(totalToday)}` : '');
    if (!habits.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.pigGold()}</div>还没有习惯～<br>点右上角「＋ 加习惯」，给想养成的习惯定个价吧</div>`;
      return;
    }
    box.innerHTML = habits.map(h => {
      const n = dayLogs.filter(l => l.habitId === h.id).length;
      return `<div class="habit-row ${n > 0 ? 'on' : ''}" data-id="${h.id}">
        <div class="hr-emoji" data-act="edit">${h.emoji || '🎯'}</div>
        <div class="hr-main" data-act="edit">
          <div class="hr-name">${esc(h.name)}</div>
          <div class="hr-sub">${n > 0 ? `✅ 今天 ${n} 次 · 小计 +¥${money(n * Number(h.amount))}` : `完成一次 +¥${money(h.amount)}`}</div>
        </div>
        <div class="hr-amt">¥${money(h.amount)}</div>
        <div class="step">
          <button class="stp" data-act="dec"${n ? '' : ' disabled'}>−</button>
          <span class="stp-n ${n > 0 ? 'on' : ''}">${n}</span>
          <button class="stp plus" data-act="inc">＋</button>
        </div>
      </div>`;
    }).join('');
    box.onclick = (e) => {
      const row = e.target.closest('.habit-row'); if (!row) return;
      const id = row.dataset.id;
      const a = e.target.closest('[data-act]');
      const act = a ? a.dataset.act : '';
      if (act === 'inc') addLog(id);
      else if (act === 'dec') delLog(id);
      else editHabit(id);
    };
  }

  function addLog(id) {
    const h = getHabits().find(x => x.id === id); if (!h) return;
    const list = getLogs();
    list.push({
      id: uid(), habitId: h.id, name: h.name, emoji: h.emoji || '🎯',
      amount: Number(h.amount) || 0, date: checkDate, ts: Date.now()
    });
    setLogs(list);
    refreshAll();
    toast(`打卡成功！+¥${money(h.amount)} 🎉`);
  }

  function delLog(id) {
    const all = getLogs();
    const same = all.filter(l => l.date === checkDate && l.habitId === id);
    if (!same.length) return;
    const target = same[same.length - 1];
    setLogs(all.filter(l => l.id !== target.id));
    refreshAll();
    toast('撤销了一次打卡');
  }

  function editHabit(id) { const h = getHabits().find(x => x.id === id); if (h) habitDialog(h); }

  function habitDialog(h) {
    emoPick = h ? (h.emoji || EMOJIS[0]) : EMOJIS[0];
    modal.open(h ? '编辑习惯' : '添加好习惯', `
      <span class="lbl">习惯名称</span>
      <input class="field" id="hbName" placeholder="比如：晨跑 20 分钟" value="${esc(h ? h.name : '')}" maxlength="24">
      <span class="lbl" style="margin-top:10px;">完成一次奖励多少钱</span>
      <input class="field" id="hbAmt" type="number" inputmode="decimal" step="0.01" placeholder="¥ 金额" value="${h ? h.amount : ''}">
      <span class="lbl" style="margin-top:10px;">挑个小图标</span>
      <div class="chip-group" id="hbEmo" style="max-height:126px;overflow-y:auto;">
        ${EMOJIS.map(e => `<button class="chip sm ${emoPick === e ? 'on' : ''}" data-e="${e}">${e}</button>`).join('')}
      </div>
      <div class="row" style="margin-top:13px;">
        ${h ? '<button class="btn danger" id="hbDel">删除</button>' : ''}
        <button class="btn grow" id="hbSave">${h ? '保存修改' : '添加习惯'}</button>
      </div>`, (b) => {
      $$('#hbEmo .chip', b).forEach(c => c.onclick = () => {
        emoPick = c.dataset.e;
        $$('#hbEmo .chip', b).forEach(x => x.classList.toggle('on', x === c));
      });
      $('#hbSave', b).onclick = () => {
        const name = $('#hbName', b).value.trim();
        if (!name) { toast('给习惯起个名字呀 🐷'); return; }
        const amt = parseFloat($('#hbAmt', b).value);
        if (!amt || amt <= 0) { toast('设置一下奖励金额～'); return; }
        const list = getHabits();
        if (h) {
          const t = list.find(x => x.id === h.id);
          if (t) { t.name = name; t.amount = r2(amt); t.emoji = emoPick; }
        } else {
          list.push({ id: uid(), name, amount: r2(amt), emoji: emoPick, ts: Date.now() });
        }
        setHabits(list);
        modal.close(); refreshAll();
        toast(h ? '已保存' : '习惯添加好啦 ✨');
      };
      const del = $('#hbDel', b);
      if (del) del.onclick = async () => {
        if (await confirmBox(`删除「${h.name}」？已经赚到的钱会保留在记录里。`)) {
          setHabits(getHabits().filter(x => x.id !== h.id));
          modal.close(); refreshAll(); toast('已删除');
        }
      };
    });
  }

  /* ---------- 奖励消费 ---------- */
  function addSpend() {
    const name = $('#spItem').value.trim();
    const a = parseFloat($('#spAmt').value);
    if (!a || a <= 0) { toast('填一下花了多少呀'); return; }
    const list = getSpends();
    list.push({
      id: uid(), name: name || '（没写名字）', amount: r2(a),
      date: $('#spDate').value || today(), ts: Date.now()
    });
    setSpends(list);
    $('#spItem').value = ''; $('#spAmt').value = '';
    refreshAll();
    toast(`记下啦，奖励了自己 ¥${money(a)} 🎁`);
  }

  function drawSpends() {
    const r = rangeOf(statKind, statAnchor);
    const all = getSpends().filter(s => (s.date || '') >= r.from && (s.date || '') <= r.to);
    const list = all.slice().sort((a, b) => (b.date + '').localeCompare(a.date + '') || b.ts - a.ts);
    setTxt('spendCnt', list.length ? `${list.length} 笔` : '');
    const box = $('#spendList'); if (!box) return;
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.star()}</div>这段时间还没有奖励自己的消费～</div>`;
      return;
    }
    let last = '';
    box.innerHTML = list.map(s => {
      let head = '';
      if (s.date !== last) {
        last = s.date;
        head = `<div class="hint" style="margin:8px 2px 5px;font-weight:700;">${niceDate(s.date)} · ${s.date} 周${wdOf(s.date)}</div>`;
      }
      return head + `<div class="rec-item" data-id="${s.id}">
        <div class="rec-ico">🛍</div>
        <div class="rec-main"><div class="t">${esc(s.name)}</div><div class="s">奖励消费</div></div>
        <div class="rec-amt v-out">-${money(s.amount)}</div>
        <div class="rec-x" data-del="${s.id}">×</div>
      </div>`;
    }).join('');
    $$('#spendList .rec-x').forEach(x => x.onclick = async (e) => {
      e.stopPropagation();
      const id = x.dataset.del;
      if (await confirmBox('删掉这笔奖励消费？余额会加回来。')) {
        setSpends(getSpends().filter(s => s.id !== id));
        refreshAll(); toast('已删除');
      }
    });
  }

  /* ---------- 赚取明细 ---------- */
  function drawLogs() {
    const r = rangeOf(statKind, statAnchor);
    const all = getLogs().filter(l => (l.date || '') >= r.from && (l.date || '') <= r.to);
    const list = all.slice().sort((a, b) => (b.date + '').localeCompare(a.date + '') || b.ts - a.ts);
    setTxt('logCnt', list.length ? `${list.length} 次` : '');
    const box = $('#logList'); if (!box) return;
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.paw()}</div>这段时间还没有打卡记录～</div>`;
      return;
    }
    let last = '';
    box.innerHTML = list.map(l => {
      let head = '';
      if (l.date !== last) {
        last = l.date;
        const daySum = sum(list.filter(x => x.date === l.date).map(x => x.amount));
        head = `<div class="hint" style="margin:8px 2px 5px;font-weight:700;">${niceDate(l.date)} · ${l.date} 周${wdOf(l.date)}　+¥${money(daySum)}</div>`;
      }
      return head + `<div class="rec-item" data-id="${l.id}">
        <div class="rec-ico">${l.emoji || '🎯'}</div>
        <div class="rec-main"><div class="t">${esc(l.name)}</div><div class="s">完成打卡</div></div>
        <div class="rec-amt v-in">+${money(l.amount)}</div>
        <div class="rec-x" data-del="${l.id}">×</div>
      </div>`;
    }).join('');
    $$('#logList .rec-x').forEach(x => x.onclick = async (e) => {
      e.stopPropagation();
      const id = x.dataset.del;
      if (await confirmBox('撤销这次打卡？赚到的钱会扣掉。')) {
        setLogs(getLogs().filter(l => l.id !== id));
        refreshAll(); toast('已撤销');
      }
    });
  }

  /* ---------- 看板 ---------- */
  function drawStat() {
    const r = rangeOf(statKind, statAnchor);
    setTxt('stLabel', r.label);
    const nav = $('#stNav'); if (nav) nav.style.display = statKind === 'all' ? 'none' : '';
    const box = $('#statBody'); if (!box) return;

    const logs = getLogs().filter(l => (l.date || '') >= r.from && (l.date || '') <= r.to);
    const sps = getSpends().filter(s => (s.date || '') >= r.from && (s.date || '') <= r.to);
    const earned = sum(logs.map(l => l.amount));
    const spent = sum(sps.map(s => s.amount));
    const days = new Set(logs.map(l => l.date)).size;

    if (!logs.length && !sps.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.pigGold()}</div>${r.label}还没有数据～<br>去打个卡或记一笔花销吧</div>`;
      return;
    }

    /* 每个习惯完成情况 */
    const habits = getHabits();
    const per = {};
    logs.forEach(l => {
      const k = l.habitId || l.name;
      if (!per[k]) per[k] = { name: l.name, emoji: l.emoji || '🎯', n: 0, amt: 0 };
      per[k].n++; per[k].amt += Number(l.amount) || 0;
    });
    const perList = Object.keys(per).map(k => per[k]).sort((a, b) => b.amt - a.amt);
    const maxN = Math.max(1, ...perList.map(x => x.n));

    /* 柱状图 */
    const bks = makeBuckets(statKind, r);
    const data = bks.map(b => ({
      label: b.label,
      e: sum(logs.filter(l => (l.date || '') >= b.from && (l.date || '') <= b.to).map(l => l.amount)),
      s: sum(sps.filter(x => (x.date || '') >= b.from && (x.date || '') <= b.to).map(x => x.amount))
    }));
    const maxV = Math.max(1, ...data.map(d => Math.max(d.e, d.s)));
    const H = (v) => (v > 0 ? Math.max(3, Math.round(v / maxV * 74)) : 2);
    const showVal = data.length <= 13;

    const spanDays = statKind === 'all' ? 0
      : Math.round((parseYMD(r.to) - parseYMD(r.from)) / 86400000) + 1;

    box.innerHTML = `
      <div class="e-stat">
        <div class="s"><div class="sv" style="color:var(--orange-d);">${logs.length}</div><div class="sk">完成次数</div></div>
        <div class="s"><div class="sv v-in">¥${money(earned)}</div><div class="sk">赚得</div></div>
        <div class="s"><div class="sv v-out">¥${money(spent)}</div><div class="sk">花掉</div></div>
        <div class="s"><div class="sv" style="color:${earned - spent >= 0 ? 'var(--brown)' : '#D2604E'};">¥${money(earned - spent)}</div><div class="sk">结余</div></div>
      </div>
      <div class="chip-group" style="margin-bottom:9px;">
        <span class="epill">📅 有打卡 ${days} 天${spanDays ? ` / 共 ${spanDays} 天` : ''}</span>
        ${logs.length ? `<span class="epill">🏆 最能赚：${esc(perList[0].emoji)} ${esc(perList[0].name)} ¥${money(perList[0].amt)}</span>` : ''}
        ${spent > earned ? '<span class="epill" style="background:#FDE4DF;color:#D2604E;">⚠️ 花超了哦</span>' : ''}
      </div>

      <div class="hint" style="margin-bottom:3px;">赚得 vs 花掉</div>
      <div class="eb-chart">
        ${data.map(d => `<div class="eb-col">
          ${showVal ? `<div class="eb-val">${d.e > 0 ? fmt0(d.e) : ''}</div>` : ''}
          <div class="eb-pair">
            <i class="eb-bar eb-earn" style="height:${H(d.e)}px"></i>
            <i class="eb-bar eb-spend" style="height:${H(d.s)}px"></i>
          </div>
          <div class="eb-lbl">${d.label}</div>
        </div>`).join('')}
      </div>
      <div class="hint" style="text-align:center;">🟢 赚得　🔴 花掉</div>

      <div class="divider"></div>
      <div class="hint" style="margin-bottom:4px;">各习惯完成情况</div>
      ${perList.map(x => `<div class="hb-row">
        <span class="hb-em">${x.emoji}</span>
        <span class="hb-nm">${esc(x.name)}</span>
        <span class="hb-bar pbar"><i style="width:${Math.round(x.n / maxN * 100)}%"></i></span>
        <span class="hb-v">${x.n} 次 · ¥${money(x.amt)}</span>
      </div>`).join('')}
      ${habits.length > perList.length ? `<div class="hint" style="margin-top:6px;">这段时间有 ${habits.length - perList.length} 个习惯没打卡，明天继续加油呀 💪</div>` : ''}`;
  }

  window.Modules = window.Modules || {};
  window.Modules.earn = { id: 'earn', name: '赚一笔', desc: '好习惯换小钱钱', icon: 'pigGold', render };
})();
