/* ===== 模块 2：来记记账 ===== */
(function () {
  const { $, $$, esc, uid, today, niceDate, toast, modal, confirmBox, money } = UI;

  const OUT_TAGS = [
    ['餐饮', '🍚'], ['买菜', '🥬'], ['零食', '🍪'], ['奶茶咖啡', '🧋'], ['饮品', '🥤'], ['酸奶', '🥛'], ['购物', '🛍'], ['服饰', '👗'],
    ['美妆护肤', '💄'], ['日用百货', '🧴'], ['交通', '🚌'], ['打车', '🚕'], ['房租房贷', '🏠'], ['水电燃气', '💡'],
    ['通讯话费', '📱'], ['医疗健康', '💊'], ['学习进修', '📚'], ['书籍', '📖'], ['娱乐', '🎮'], ['旅游', '✈️'],
    ['运动健身', '🏋️'], ['宠物', '🐾'], ['人情往来', '🎁'], ['订阅会员', '💳'], ['家居家电', '🛋'], ['美发美甲', '💇'],
    ['维修保养', '🔧'], ['保险', '🛡'], ['税费', '🧾'], ['其他支出', '📦']
  ];
  const IN_TAGS = [
    ['工资', '💰'], ['奖金', '🏆'], ['兼职', '🛠'], ['副业', '🚀'], ['理财收益', '📈'], ['报销', '🧾'],
    ['红包', '🧧'], ['礼金', '🎀'], ['退款', '↩️'], ['卖闲置', '📦'], ['补贴', '🏦'], ['利息', '🪙'], ['其他收入', '✨']
  ];
  const ICO = {}; OUT_TAGS.concat(IN_TAGS).forEach(([n, e]) => ICO[n] = e);

  let mode = 'out';
  let curTag = '餐饮';
  let viewY = new Date().getFullYear();
  let viewM = new Date().getMonth() + 1;
  let viewYear = false;

  const getBills = () => DB.get('bills', []);
  const setBills = (v) => DB.set('bills', v);

  function render(root) {
    root.innerHTML = `
      <div class="money-hero">
        <div class="row" style="justify-content:space-between;margin-bottom:8px;">
          <div class="row" style="gap:5px;">
            <button class="chip sm" id="mPrev">‹</button>
            <button class="chip sm on" id="mLabel"></button>
            <button class="chip sm" id="mNext">›</button>
          </div>
          <button class="chip sm" id="mYear">看整年</button>
        </div>
        <div class="money-row">
          <div class="mi"><div class="v v-in" id="sIn">0.00</div><div class="k">收入</div></div>
          <div class="mi"><div class="v v-out" id="sOut">0.00</div><div class="k">支出</div></div>
          <div class="mi"><div class="v v-bal" id="sBal">0.00</div><div class="k">盈余</div></div>
        </div>
        <div class="mh-cat">${Icons.mouse()}</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.coin()}</span>记一笔</div>
        <div class="slide-switch" id="mSw">
          <div class="thumb"></div>
          <div class="sw on" data-m="out">💸 支出</div>
          <div class="sw" data-m="in">💰 收入</div>
        </div>
        <div class="row">
          <input class="field grow" id="amt" type="number" inputmode="decimal" placeholder="金额 ¥" step="0.01">
          <input class="field" id="bdate" type="date" style="width:132px;">
        </div>
        <div style="margin-top:9px;">
          <span class="lbl">选个标签</span>
          <div class="chip-group" id="tagGrp" style="max-height:132px;overflow-y:auto;"></div>
        </div>
        <input class="field" id="note" placeholder="备注（可选，比如：和朋友吃的火锅）" style="margin-top:9px;" maxlength="60">
        <button class="btn block" id="addBill" style="margin-top:11px;">${Icons.plus()}记下这笔</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>消费记录 <small id="recCnt"></small></div>
        <div id="tagStat" style="margin-bottom:9px;"></div>
        <div id="recList"></div>
      </div>`;

    $('#bdate').value = today();
    drawTags();
    $$('#mSw .sw').forEach(s => s.onclick = () => {
      mode = s.dataset.m;
      $('#mSw').classList.toggle('right', mode === 'in');
      $$('#mSw .sw').forEach(x => x.classList.toggle('on', x === s));
      curTag = mode === 'out' ? '餐饮' : '工资';
      drawTags();
    });
    $('#addBill').onclick = addBill;
    $('#mPrev').onclick = () => { if (viewYear) { viewY--; } else { viewM--; if (viewM < 1) { viewM = 12; viewY--; } } refresh(); };
    $('#mNext').onclick = () => { if (viewYear) { viewY++; } else { viewM++; if (viewM > 12) { viewM = 1; viewY++; } } refresh(); };
    $('#mYear').onclick = () => { viewYear = !viewYear; $('#mYear').textContent = viewYear ? '看单月' : '看整年'; refresh(); };
    $('#mLabel').onclick = () => pickMonth();
    refresh();
  }

  function drawTags() {
    const tags = mode === 'out' ? OUT_TAGS : IN_TAGS;
    $('#tagGrp').innerHTML = tags.map(([n, e]) =>
      `<button class="chip ${curTag === n ? 'on' : ''}" data-t="${esc(n)}">${e} ${esc(n)}</button>`).join('');
    $$('#tagGrp .chip').forEach(c => c.onclick = () => {
      curTag = c.dataset.t;
      $$('#tagGrp .chip').forEach(x => x.classList.toggle('on', x === c));
    });
  }

  function addBill() {
    const a = parseFloat($('#amt').value);
    if (!a || a <= 0) { toast('金额填一下呀 🐭'); return; }
    const list = getBills();
    list.push({
      id: uid(), type: mode, amount: Math.round(a * 100) / 100, tag: curTag,
      note: $('#note').value.trim(), date: $('#bdate').value || today(), ts: Date.now()
    });
    setBills(list);
    $('#amt').value = ''; $('#note').value = '';
    refresh();
    toast(mode === 'out' ? `记下支出 ¥${money(a)}` : `记下收入 ¥${money(a)}`);
  }

  function pickMonth() {
    const y = viewY;
    modal.open('选择月份', `
      <div class="row" style="justify-content:center;margin-bottom:10px;">
        <button class="chip" id="yPrev">‹</button>
        <b id="yLbl" style="font-size:16px;padding:0 12px;">${y} 年</b>
        <button class="chip" id="yNext">›</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;" id="mGrid"></div>
      <button class="btn block ghost" id="pickWholeYear" style="margin-top:12px;">查看 <span id="wy">${y}</span> 全年</button>`, (b) => {
      let yy = y;
      const paint = () => {
        $('#yLbl', b).textContent = yy + ' 年';
        $('#wy', b).textContent = yy;
        $('#mGrid', b).innerHTML = Array.from({ length: 12 }, (_, i) =>
          `<button class="chip ${(yy === viewY && i + 1 === viewM && !viewYear) ? 'on' : ''}" data-m="${i + 1}" style="justify-content:center;">${i + 1}月</button>`).join('');
        $$('#mGrid .chip', b).forEach(c => c.onclick = () => {
          viewY = yy; viewM = Number(c.dataset.m); viewYear = false;
          $('#mYear').textContent = '看整年';
          modal.close(); refresh();
        });
      };
      $('#yPrev', b).onclick = () => { yy--; paint(); };
      $('#yNext', b).onclick = () => { yy++; paint(); };
      $('#pickWholeYear', b).onclick = () => { viewY = yy; viewYear = true; $('#mYear').textContent = '看单月'; modal.close(); refresh(); };
      paint();
    });
  }

  function inRange(r) {
    if (!r.date) return false;
    return viewYear ? r.date.startsWith(String(viewY)) : r.date.startsWith(`${viewY}-${String(viewM).padStart(2, '0')}`);
  }

  function refresh() {
    $('#mLabel').textContent = viewYear ? `${viewY} 年` : `${viewY}年${viewM}月`;
    const all = getBills();
    const cur = all.filter(inRange);
    const inc = cur.filter(r => r.type === 'in').reduce((a, b) => a + Number(b.amount), 0);
    const out = cur.filter(r => r.type === 'out').reduce((a, b) => a + Number(b.amount), 0);
    $('#sIn').textContent = money(inc);
    $('#sOut').textContent = money(out);
    $('#sBal').textContent = money(inc - out);
    $('#sBal').style.color = inc - out >= 0 ? 'var(--brown)' : '#D2604E';

    // 分类占比
    const stat = {};
    cur.filter(r => r.type === 'out').forEach(r => { stat[r.tag] = (stat[r.tag] || 0) + Number(r.amount); });
    const top = Object.entries(stat).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const colors = ['#F2A340', '#E6866F', '#8FBF7A', '#8FB8D6', '#C0A8D8'];
    $('#tagStat').innerHTML = top.length ? `
      <div class="nutri-bar">${top.map(([n, v], i) => `<i style="flex:${v};background:${colors[i]}"></i>`).join('')}</div>
      <div class="chip-group" style="margin-top:7px;">
        ${top.map(([n, v], i) => `<span class="chip sm"><i style="width:8px;height:8px;border-radius:50%;background:${colors[i]};display:inline-block;"></i>${ICO[n] || ''}${esc(n)} ¥${money(v)}</span>`).join('')}
      </div>` : '';

    if (viewYear) {
      const byM = Array.from({ length: 12 }, (_, i) => {
        const k = `${viewY}-${String(i + 1).padStart(2, '0')}`;
        const m = all.filter(r => (r.date || '').startsWith(k));
        return {
          m: i + 1,
          out: m.filter(r => r.type === 'out').reduce((a, b) => a + Number(b.amount), 0),
          in: m.filter(r => r.type === 'in').reduce((a, b) => a + Number(b.amount), 0)
        };
      });
      const max = Math.max(1, ...byM.map(x => Math.max(x.out, x.in)));
      $('#tagStat').innerHTML += `
        <div class="divider"></div>
        <div style="display:flex;align-items:flex-end;gap:3px;height:96px;">
          ${byM.map(x => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;justify-content:flex-end;height:100%;">
            <div style="display:flex;gap:1.5px;align-items:flex-end;height:74px;">
              <i style="width:6px;background:#8FBF7A;border-radius:2px 2px 0 0;height:${Math.round(x.in / max * 74)}px;display:block;"></i>
              <i style="width:6px;background:#E6866F;border-radius:2px 2px 0 0;height:${Math.round(x.out / max * 74)}px;display:block;"></i>
            </div>
            <span style="font-size:8.5px;color:var(--brown-soft);">${x.m}</span>
          </div>`).join('')}
        </div>
        <div class="hint" style="text-align:center;">绿=收入　红=支出（单位随金额自适应）</div>`;
    }

    const list = cur.slice().sort((a, b) => (b.date + '').localeCompare(a.date + '') || b.ts - a.ts);
    $('#recCnt').textContent = list.length ? `共 ${list.length} 笔` : '';
    const box = $('#recList');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.mouse()}</div>这段时间还没有记录～<br>鼠鼠等着帮你数钱呢</div>`;
      return;
    }
    let lastDate = '';
    box.innerHTML = list.map(r => {
      let head = '';
      if (r.date !== lastDate) {
        lastDate = r.date;
        const dayOut = list.filter(x => x.date === r.date && x.type === 'out').reduce((a, b) => a + Number(b.amount), 0);
        head = `<div class="hint" style="margin:9px 2px 5px;font-weight:700;">${niceDate(r.date)} · ${r.date} 星期${UI.wdOf(r.date)}　支出 ¥${money(dayOut)}</div>`;
      }
      return head + `<div class="rec-item" data-id="${r.id}">
        <div class="rec-ico">${ICO[r.tag] || '📦'}</div>
        <div class="rec-main">
          <div class="t">${esc(r.tag)}</div>
          <div class="s">${esc(r.note || '（无备注）')}</div>
        </div>
        <div class="rec-amt ${r.type === 'out' ? 'v-out' : 'v-in'}">${r.type === 'out' ? '-' : '+'}${money(r.amount)}</div>
      </div>`;
    }).join('');
    $$('#recList .rec-item').forEach(it => it.onclick = () => editBill(it.dataset.id));
  }

  function editBill(id) {
    const all = getBills();
    const r = all.find(x => x.id === id); if (!r) return;
    modal.open('这笔记录', `
      <div class="row"><input class="field grow" id="eAmt" type="number" value="${r.amount}" step="0.01">
      <input class="field" id="eDate" type="date" value="${r.date}" style="width:132px;"></div>
      <input class="field" id="eNote" placeholder="备注" value="${esc(r.note || '')}" style="margin-top:9px;">
      <div class="hint" style="margin-top:7px;">${ICO[r.tag] || ''} ${esc(r.tag)} · ${r.type === 'out' ? '支出' : '收入'}</div>
      <div class="row" style="margin-top:12px;">
        <button class="btn danger grow" id="eDel">删除</button>
        <button class="btn grow" id="eSave">保存修改</button>
      </div>`, (b) => {
      $('#eSave', b).onclick = () => {
        const a = parseFloat($('#eAmt', b).value);
        if (!a || a <= 0) { toast('金额不对哦'); return; }
        r.amount = Math.round(a * 100) / 100;
        r.date = $('#eDate', b).value || r.date;
        r.note = $('#eNote', b).value.trim();
        setBills(all); modal.close(); refresh(); toast('改好啦');
      };
      $('#eDel', b).onclick = async () => {
        if (await confirmBox('删掉这笔记录？')) {
          setBills(all.filter(x => x.id !== id)); modal.close(); refresh(); toast('已删除');
        }
      };
    });
  }

  window.Modules = window.Modules || {};
  window.Modules.money = { id: 'money', name: '来记记账', desc: '鼠鼠帮你数小钱钱', icon: 'mouse', render };
})();
