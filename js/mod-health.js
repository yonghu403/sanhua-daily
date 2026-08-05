// 健康管理 —— 小鸡守护你的身体（可爱风）
// 支持：主状态（分类）可自行添加命名（不限个数）；分状态（各分类下的选项）也可自行添加/删除
(function () {
  const DB_KEY = 'health';

  // 默认主状态（分类）
  const DEFAULT_CATS = {
    gi: { name:'🤢 肠胃不适', icon:'🤢', color:'#E07B20',
      opts:['拉肚子','胃痛','肚子胀','便秘','肚子疼','恶心反胃','食欲不振'] },
    ext: { name:'🤒 外感内热', icon:'🤒', color:'#D4A017',
      opts:['风寒感冒','风热感冒','发烧','喉咙痛','湿热内停','咳嗽流涕','头晕头痛'] },
    ms: { name:'💪 筋骨肉痛', icon:'💪', color:'#5B8C6A',
      opts:['手腕腱鞘炎','肩关节劳损','上背部不适','手臂麻木','腿部麻木','下肢水肿','屁股两侧痛','颈椎不适'] },
    women: { name:'🌸 女性问题', icon:'🌸', color:'#C05A8E',
      opts:['排卵期出血','分泌物异常','痛经','尿路感染','乳房胀痛','卵巢疼痛','月经过多','月经过少','经期时间异常'] }
  };

  const PALETTE = ['#E07B20','#D4A017','#5B8C6A','#C05A8E','#7A6FF0','#E0533B','#3AA6B9','#B5683F','#8C6BD0','#4F9D69'];

  /* 数据结构 */
  const get = () => DB.get(DB_KEY, { records:[], customs:{}, customCats:{} });
  const set = (v) => DB.set(DB_KEY, v);
  function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function today() { return new Date().toISOString().slice(0,10); }

  // 合并默认 + 自定义主状态
  function allCats(data) {
    return Object.assign({}, DEFAULT_CATS, data.customCats || {});
  }
  function catInfo(data, key) {
    const all = allCats(data);
    return all[key] || { name: key||'未分类', icon:'❓', color:'#999', opts:[] };
  }
  function pickColor(data) {
    const used = Object.keys(data.customCats || {}).length;
    return PALETTE[used % PALETTE.length];
  }

  // 颜色加深（选中态更明显）
  function darken(hex, f) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (!m) return hex;
    const n = parseInt(m[1], 16);
    let r = (n>>16)&255, g = (n>>8)&255, b = n&255;
    r = Math.round(r*(1-f)); g = Math.round(g*(1-f)); b = Math.round(b*(1-f));
    return '#' + ((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }

  /* ===== 主渲染 ===== */
  let view = 'today'; // today | month | year
  let selDate = today();
  let curCat = 'gi';
  let rootEl = null;
  let traceTime = '__all__'; // 时间筛选：__all__/week/2w/month
  let traceStatus = '__all__'; // 状态筛选：__all__ 或具体状态名

  function render(root) {
    rootEl = root;
    const data = get();
    if (!allCats(data)[curCat]) curCat = 'gi';
    root.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
        <span class="chip ${view==='today'?'on':'sm'}" id="hdToday" style="${view==='today'?`font-weight:700;background:${document.documentElement.style.getPropertyValue('--orange')||'#F2A340'};color:#fff;`:''}">📅 今天</span>
        <span class="chip ${view==='month'?'on':'sm'}" id="hdMonth" style="${view==='month'?`font-weight:700;background:${document.documentElement.style.getPropertyValue('--orange')||'#F2A340'};color:#fff;`:''}">📆 月历</span>
        <span class="chip ${view==='year'?'on':'sm'}" id="hdYear" style="${view==='year'?`font-weight:700;background:${document.documentElement.style.getPropertyValue('--orange')||'#F2A340'};color:#fff;`:''}">📊 年历</span>
      </div>

      <!-- 日期显示（可点击选择日期） -->
      <div id="hdDateBar" style="text-align:center;padding:8px;background:#FFFBF5;border-radius:10px;border:2px dashed #E8D9BC;margin-bottom:12px;cursor:pointer;position:relative;" title="点击选择日期">
        <div style="font-size:1.15rem;font-weight:700;color:#6B4630;" id="hdDateText">${formatDate(selDate)}</div>
        <div style="font-size:.78rem;color:#9A8874;margin-top:2px;" id="hdWeekday">${weekday(selDate)}</div>
        <div style="position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:.72rem;color:#B8A484;">📅 选择</div>
      </div>

      <!-- 主状态（分类）切换：可点击切换，选中态加深；自定义主状态可删除 -->
      <div id="hdCats" style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;align-items:center;">
        ${Object.entries(allCats(data)).map(([k,v]) => {
          const on = curCat===k;
          const style = on ? `background:${darken(v.color,0.18)};color:#fff;border:none;box-shadow:inset 0 2px 6px rgba(0,0,0,.28),0 2px 4px rgba(0,0,0,.12);font-weight:700;` : `background:#FFFDF8;color:${v.color};border:1.5px solid ${v.color};`;
          const isCustom = !!((data.customCats||{})[k]);
          return `<span class="cat-wrap" style="position:relative;display:inline-flex;${isCustom?'margin:6px 6px 0 0;':''}">
            <button class="chip ${on?'on':''}" data-cat="${k}" style="${style}">${v.name}</button>
            ${isCustom?`<span class="cat-x" data-del-cat="${k}" title="删除该分类">×</span>`:''}
          </span>`;
        }).join('')}
        <button class="chip sm" id="hdAddCat" style="border:2px dashed #B8A484;color:#9A8874;">＋ 新增分类</button>
      </div>

      <div id="hdPane"></div>
    `;

    $('#hdToday').onclick = () => { view='today'; selDate=today(); render(root); };
    $('#hdMonth').onclick = () => { view='month'; render(root); };
    $('#hdYear').onclick = () => { view='year'; render(root); };

    // 点击日期栏选择日期（支持补录历史记录）
    let datePickerOpen = false;
    $('#hdDateBar').onclick = () => {
      if (datePickerOpen) return; // 防止重复触发
      const bar = $('#hdDateBar');
      if (!bar) return;
      datePickerOpen = true;
      bar.innerHTML = `
        <div style="font-size:1.05rem;font-weight:700;color:#6B4630;">📅 选择记录日期</div>
        <input type="date" id="hdDatePicker" value="${selDate}" style="margin-top:6px;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;background:#fff;font-size:1rem;width:160px;text-align:center;color:#6B4630;font-weight:600;cursor:pointer;">
        <div style="font-size:.72rem;color:#9A8874;margin-top:4px;">支持选择任意日期补录记录</div>
      `;
      const picker = $('#hdDatePicker');
      if (!picker) { datePickerOpen = false; return; }
      picker.focus();
      picker.onchange = () => {
        const v = picker.value;
        if (v) { selDate = v; datePickerOpen = false; render(root); }
      };
      picker.onblur = () => {
        setTimeout(() => { datePickerOpen = false; render(root); }, 150);
      };
    };

    $$('#hdCats [data-cat]').forEach(btn => {
      btn.onclick = () => { curCat = btn.dataset.cat; render(root); };
    });
    // 删除自定义主状态（× 号在 #hdCats 内，必须在这里绑定，不能依赖 #hdPane 的委托）
    $$('#hdCats [data-del-cat]').forEach(x => {
      x.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        const k = x.dataset.delCat;
        const nm = catInfo(get(), k).name;
        confirmBox('删除分类「'+nm+'」？该分类下已记录的历史数据会保留，只是不再显示此分类。', '删除').then((ok) => {
          if (!ok) return;
          const d = get();
          d.customCats = d.customCats || {};
          delete d.customCats[k];
          if (d.customs) delete d.customs[k];
          if (curCat === k) curCat = 'gi';
          set(d);
          render(rootEl);
          toast('已删除分类「'+nm+'」');
        });
      };
    });
    $('#hdAddCat').onclick = () => addCategory(data);

    paintPane();
  }

  function addCategory(data) {
    UI.promptBox('给新分类起个名字', '', '如：皮肤问题、睡眠问题、过敏...').then((name) => {
      if (!name || !name.trim()) return;
      const key = 'c_' + uid();
      data.customCats = data.customCats || {};
      data.customCats[key] = { name: name.trim(), icon:'🩺', color: pickColor(data), opts:[] };
      set(data);
      curCat = key;
      render(rootEl);
      toast('已新增分类：「'+name.trim()+'」，现在可以添加它的分状态啦～');
    });
  }

  function paintPane() {
    const pane = $('#hdPane'); if(!pane)return;
    if (view === 'today' || view === 'month') {
      renderRecordForm(pane);
    } else if (view === 'year') {
      renderYearView(pane);
    }
  }

  /* ===== 记录表单 ===== */
  function renderRecordForm(pane) {
    const data = get();
    const cats = allCats(data);
    if (!cats[curCat]) curCat = 'gi';
    const cat = cats[curCat];
    const defaultOpts = cat.opts || [];
    const customs = data.customs[curCat] || [];

    // 当日已有记录
    const dayRecs = (data.records||[]).filter(r => r.date === selDate && r.cat === curCat);

    pane.innerHTML = `
      <!-- 状态选择 -->
      <div style="margin-bottom:10px;">
        <label style="font-size:.85rem;color:${cat.color};font-weight:600;display:block;margin-bottom:4px;">${cat.icon} 分状态选择 <small style="font-weight:normal;color:#9A8874;">（点「＋ 自定义」可新增，自定义项可点 × 删除）</small></label>
        <div id="hdStatusGrid" style="display:flex;flex-wrap:wrap;gap:6px;">
          ${defaultOpts.map((o) => `<button class="chip sm hd-st-opt" data-v="${esc(o)}" style="${dayRecs.some(r=>r.status===o)?`background:${cat.color};color:#fff;border:none;`:''}">${esc(o)}</button>`).join('')}
          ${customs.map((o) => `<button class="chip sm hd-st-opt" data-v="${esc(o)}" style="${dayRecs.some(r=>r.status===o)?`background:${cat.color};color:#fff;border:none;`:`border:1.5px dashed ${cat.color};color:${cat.color};`}">${esc(o)} <span class="st-x" data-del-custom="${esc(o)}">×</span></button>`).join('')}
          <button class="chip sm" id="hdAddCustom" style="border:2px dashed #B8A484;color:#9A8874;">＋ 自定义</button>
        </div>
      </div>

      <!-- 不适感打分 -->
      <div style="margin-bottom:10px;">
        <label style="font-size:.85rem;color:${cat.color};font-weight:600;display:block;margin-bottom:4px;">😖 不适感打分 <small style="font-weight:normal;color:#9A8874;">(1-10，10最难受)</small></label>
        <div id="hdScoreBar" style="display:flex;align-items:center;gap:6px;">
          <input type="range" id="hdScore" min="1" max="10" value="${dayRecs.length?dayRecs[0].score||5:5}" style="flex:1;accent-color:${cat.color};" />
          <span id="hdScoreVal" style="font-size:1.1rem;font-weight:700;color:${cat.color};min-width:24px;text-align:center;">${dayRecs.length?dayRecs[0].score||5:5}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.7rem;color:#9A8874;margin-top:2px;">
          <span>轻微</span><span>难以忍受</span>
        </div>
      </div>

      <!-- 回忆溯源 -->
      <div style="margin-bottom:10px;">
        <label style="font-size:.85rem;color:${cat.color};font-weight:600;display:block;margin-bottom:4px;">🔍 回忆溯源</label>
        <textarea id="hdTrace" rows="3" placeholder="记录一下今天吃了什么、做了什么、可能是什么原因导致不舒服..." style="width:100%;box-sizing:border-box;padding:8px 10px;border:2px solid #E8D9BC;border-radius:8px;background:#FFFBF5;resize:vertical;font-size:.9rem;line-height:1.5;">${dayRecs.length?esc(dayRecs[0].trace||''):''}</textarea>
      </div>

      <!-- 保存按钮 -->
      <button class="btn primary" id="hdSaveBtn" style="width:100%;padding:10px;font-size:1rem;">${Icons.chick()} 保存${selDate===today()?'今日':formatDate(selDate)+'的'}记录</button>

      <!-- 当日已有记录列表 -->
      ${dayRecs.length?`<div style="margin-top:14px;"><b style="font-size:.88rem">📋 ${selDate===today()?'今日':formatDate(selDate)}已记录 (${dayRecs.length}条)</b><div style="margin-top:4px;">${dayRecs.map((r,i)=>`
        <div class="food-item" style="padding:8px 10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <span class="chip sm" style="background:${cat.color};color:#fff;border:none;font-size:.78rem;">${r.status}</span>
            <span style="color:#E07B20;font-weight:600;margin-left:4px;">${r.score}/10</span>
            ${r.trace?`<p style="font-size:.8rem;color:#6B4630;margin-top:3px;">${esc(r.trace)}</p>`:''}
          </div>
          <span class="chip sm" data-act="delRec" data-i="${i}" style="color:#CC6666;border-color:#CC6666;">× 删除</span>
        </div>
      `).join('')}</div></div>`:''}

      <!-- AI 智能汇总避雷 -->
      <div style="margin-top:16px;padding:14px;background:linear-gradient(135deg,#FFF8F0,#FFF3E8);border-radius:12px;border:2px solid #F0D9B8;">
        <div style="font-weight:700;color:#6B4630;margin-bottom:8px;">🐔 AI 智能汇总 · 避雷指南</div>
        <div id="hdAISummary">${renderAISummary(data)}</div>
      </div>
    `;

    // 近期溯源状态筛选
    bindTraceFilter();
    // 打分滑块
    $('#hdScore').oninput = () => { $('#hdScoreVal').textContent = $('#hdScore').value; };
    // 状态选择
    $$('.hd-st-opt').forEach(btn => {
      btn.onclick = (e) => {
        if (e.target.classList.contains('st-x')) return; // × 号单独处理
        btn.style.background = cat.color;
        btn.style.color = '#fff';
        btn.style.border = 'none';
      };
    });
    // 自定义分状态
    $('#hdAddCustom').onclick = () => {
      UI.promptBox('自定义分状态', '', '输入新状态名称（如：偏头痛、过敏等）：').then((val) => {
        if (!val || !val.trim()) return;
        const v = val.trim();
        data.customs = data.customs || {};
        data.customs[curCat] = data.customs[curCat] || [];
        if (!data.customs[curCat].includes(v)) {
          data.customs[curCat].push(v);
          set(data);
          paintPane();
        }
      });
    };
    // 保存
    $('#hdSaveBtn').onclick = () => {
      const selected = $$('.hd-st-opt').filter(b => b.style.color==='rgb(255, 255, 255)'||b.style.color==='#fff').map(b=>b.dataset.v);
      if (!selected.length && !$('#hdTrace').value.trim()) { toast('请至少选择一个状态或填写溯源'); return; }
      const score = +$('#hdScore').value;
      const trace = $('#hdTrace').value.trim();

      selected.forEach(status => {
        data.records = data.records || [];
        data.records.push({ id:uid(), date:selDate, cat:curCat, status, score, trace, ts:Date.now() });
      });
      // 如果有溯源但没有选状态，也保存一条
      if (!selected.length && trace) {
        data.records.push({ id:uid(), date:selDate, cat:curCat, status:'其他', score, trace, ts:Date.now() });
      }
      set(data);
      toast('🐔 记录已保存！注意身体哦～');
      paintPane();
    };

    // 各种删除/移除
    pane.onclick = (e) => {
      const t = e.target;
      // 删除某条记录
      if (t.dataset.act === 'delRec') {
        const i = +t.dataset.i;
        const recs = (get().records||[]).filter(r => r.date === selDate && r.cat === curCat);
        if (!recs[i]) return;
        const delId = recs[i].id;
        confirmBox('删除这条记录？', '删除').then((ok) => {
          if (!ok) return;
          const d = get();
          d.records = (d.records||[]).filter(r => r.id !== delId);
          set(d);
          paintPane();
        });
        return;
      }
      // 删除自定义分状态
      if (t.dataset.delCustom) {
        const v = t.dataset.delCustom;
        confirmBox('删除分状态「'+v+'」？已记录的历史不会消失。', '删除').then((ok) => {
          if (!ok) return;
          const d = get();
          d.customs = d.customs || {};
          d.customs[curCat] = (d.customs[curCat]||[]).filter(x => x !== v);
          set(d);
          paintPane();
        });
        return;
      }
      // 注：删除自定义主状态的 × 在 #hdCats 内（非 #hdPane 子节点），已在 render() 中单独绑定
    };
  }

  /* ===== 月历视图 ===== */
  function renderMonthView(pane) {
    const [y,m] = selDate.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const firstDay = new Date(y, m-1, 1).getDay(); // 0=Sun
    const data = get();

    let html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center;">';
    ['日','一','二','三','四','五','六'].forEach(d => html += `<div style="padding:4px;font-size:.75rem;color:#9A8874;font-weight:600;">${d}</div>`);
    for(let i=0;i<firstDay;i++) html += '<div></div>';

    for(let d=1;d<=daysInMonth;d++) {
      const ds = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const recs = (data.records||[]).filter(r=>r.date===ds);
      const hasRec = recs.length > 0;
      const isToday = ds === today();
      const ci = hasRec ? catInfo(data, recs[0].cat) : null;
      html += `<div class="cal-day ${isToday?'cal-today':''}" data-d="${ds}" style="padding:6px 2px;border-radius:6px;cursor:pointer;${hasRec?'background:#FFE8D6;border:1.5px solid '+ci.color:''}${isToday&&!hasRec?';border:1.5px solid #F2A340':''}">
        <div style="font-size:.82rem;font-weight:${isToday?'700':'500'};${isToday&&(!hasRec)?'color:#F2A340':''}">${d}</div>
        ${hasRec?`<div style="font-size:.55rem;color:${ci.color};margin-top:1px;">${recs.length}条</div>`:''}
      </div>`;
    }
    html += '</div>';

    // 月份导航
    html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <button class="chip sm" id="mPrev">◀ 上月</button>
        <b style="color:#6B4630;">${y}年${m}月</b>
        <button class="chip sm" id="mNext">下月 ▶</button>
      </div>
      ${html}
      <div id="mDayDetail" style="margin-top:10px;"></div>
    `;

    pane.innerHTML = html;

    // ===== 月度健康汇总 =====
    const monthRecs = (data.records||[]).filter(r => r.date.startsWith(y+'-'+String(m).padStart(2,'0')));
    if (monthRecs.length > 0) {
      // 按分类统计
      const catFreq = {};
      const statusFreq = {};
      let totalScore = 0;
      monthRecs.forEach(r => {
        const cn = catInfo(data, r.cat).name;
        catFreq[cn] = (catFreq[cn] || 0) + 1;
        statusFreq[r.status] = (statusFreq[r.status] || 0) + 1;
        totalScore += r.score || 0;
      });
      const topStatuses = Object.entries(statusFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);
      const avgScore = (totalScore / monthRecs.length).toFixed(1);

      // 按日期分布（有记录的日期）
      const dateMap = {};
      monthRecs.forEach(r => { dateMap[r.date] = (dateMap[r.date]||0)+1; });
      const busyDates = Object.entries(dateMap).sort((a,b)=>b[1]-a[1]).slice(0,3);

      pane.innerHTML += `
        <div style="margin-top:14px;padding:12px;background:linear-gradient(135deg,#FFFBF5,#FFF8F0);border-radius:12px;border:2px solid #E8D9BC;">
          <div style="font-weight:700;color:#6B4630;margin-bottom:8px;">📊 ${y}年${m}月 健康汇总</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">
            <div style="text-align:center;padding:6px;background:#FFFDF8;border-radius:8px;">
              <div style="font-size:1.15rem;font-weight:700;color:#E07B20;">${monthRecs.length}</div>
              <div style="font-size:.7rem;color:#9A8874;">总记录数</div>
            </div>
            <div style="text-align:center;padding:6px;background:#FFFDF8;border-radius:8px;">
              <div style="font-size:1.15rem;font-weight:700;color:#E07B20;">${avgScore}</div>
              <div style="font-size:.7rem;color:#9A8874;">平均不适分</div>
            </div>
            <div style="text-align:center;padding:6px;background:#FFFDF8;border-radius:8px;">
              <div style="font-size:1.15rem;font-weight:700;color:#5B8C6A;">${Object.keys(dateMap).length}</div>
              <div style="font-size:.7rem;color:#9A8874;">有记录天数</div>
            </div>
          </div>

          <!-- 高频问题 TOP 5 -->
          ${topStatuses.length ? `<div style="margin-bottom:8px;">
            <div style="font-size:.82rem;font-weight:600;color:#6B4630;margin-bottom:4px;">🔥 本月高频问题</div>
            ${topStatuses.map(([st,c]) => `<div class="row" style="align-items:center;margin-bottom:2px;gap:6px;"><span class="chip sm" style="background:#FFE8D6;color:#E07B20;border:none;font-size:.72rem;">${esc(st)}</span><span style="flex:1;height:6px;background:#FAF3E8;border-radius:3px;overflow:hidden;"><span style="display:block;height:100%;background:${document.documentElement.style.getPropertyValue('--orange')||'#F2A340'};border-radius:3px;width:${Math.min(100,(c/monthRecs.length)*100)}%;"></span></span><span style="font-size:.7rem;color:#9A8874;min-width:22px;text-align:right;">×${c}</span></div>`).join('')}
          </div>` : ''}

          <!-- 记录最密集的日期 -->
          ${busyDates.length ? `<div style="font-size:.78rem;color:#8C6647;">
            📌 记录最多：${busyDates.map(([d,c])=>`<b>${formatDate(d)}</b>(${c}条)`).join('、')}
          </div>` : ''}
        </div>
      `;
    } else {
      pane.innerHTML += `<div style="margin-top:10px;text-align:center;color:#C9BCAA;font-size:.84rem;padding:12px;">${y}年${m}月暂无健康记录 ✨</div>`;
    }

    $('#mPrev').onclick = () => { selDate = `${y}-${String(m-1||12).padStart(2,'0')}-01`; if(m===1)selDate=`${y-1}-12-01`; paintPane(); };
    $('#mNext').onclick = () => { selDate = `${y}-${String(m+1<=12?m+1:1).padStart(2,'0')}-01`; if(m===12)selDate=`${y+1}-01-01`; paintPane(); };

    // 点击日期查看详情
    $$('.cal-day[data-d]').forEach(el => {
      el.onclick = () => {
        $$('.cal-day').forEach(x=>x.style.outline='none');
        el.style.outline = '2px solid #F2A340';
        el.style.outlineOffset = '-1px';
        showDayDetail(el.dataset.d);
      };
    });
  }

  function showDayDetail(ds) {
    const data = get();
    const recs = (data.records||[]).filter(r=>r.date===ds);
    const detail = $('#mDayDetail');
    if (!detail) return;
    if (!recs.length) { detail.innerHTML = `<p style="color:#9A8874;font-size:.84rem;text-align:center;padding:8px;">${ds} 无记录</p>`; return; }
    detail.innerHTML = `
      <div style="font-weight:600;color:#6B4630;margin-bottom:4px;">${formatDate(ds)} 的记录：</div>
      ${recs.map(r=>{
        const ci = catInfo(data, r.cat);
        return `<div class="food-item" style="padding:8px;margin-bottom:4px;">
          <span class="chip sm" style="background:${ci.color};color:#fff;border:none;font-size:.76rem;">${ci.icon} ${r.status}</span>
          <span style="color:#E07B20;font-weight:600;margin-left:4px;">${r.score}/10</span>
          ${r.trace?`<p style="font-size:.82rem;color:#4A3628;margin-top:3px;">${esc(r.trace)}</p>`:''}
        </div>`;
      }).join('')}`;
  }

  /* ===== 年历视图 ===== */
  function renderYearView(pane) {
    const y = parseInt(selDate.split('-')[0]);
    const data = get();
    const recs = (data.records||[]).filter(r => r.date.startsWith(y+'-'));

    // 按月统计
    const monthStats = Array.from({length:12}, (_,i)=>({
      m:i+1, count:recs.filter(r=>parseInt(r.date.slice(5,7))===i+1).length,
      avgScore: (()=>{const m=recs.filter(r=>parseInt(r.date.slice(5,7))===i+1);return m.length?(m.reduce((a,r)=>a+r.score,0)/m.length).toFixed(1):'-';})(),
      topIssue: (()=>{const m=recs.filter(r=>parseInt(r.date.slice(5,7))===i+1);if(!m.length)return'-';const freq={};m.forEach(r=>{freq[r.status]=(freq[r.status]||0)+1;});return Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];})()
    }));

    pane.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <button class="chip sm" id="yPrev">◀ ${y-1}</button>
        <b style="font-size:1.1rem;color:#6B4630;">📊 ${y} 年度健康报告</b>
        <button class="chip sm" id="yNext">${y+1} ▶</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
        ${monthStats.map(s => {
          const intensity = s.count > 0 ? Math.min(100, s.count*20) : 0;
          const bgColor = s.count > 0 ? `rgba(224,123,32,${intensity/100})` : '#FAF3E8';
          return `<div style="padding:10px;background:${bgColor};border-radius:10px;border:2px solid #E8D9BC;text-align:center;">
            <div style="font-weight:700;color:#6B4630;">${s.m}月</div>
            <div style="font-size:.78rem;color:#9A8874;margin-top:2px;">${s.count}条记录</div>
            ${s.count>0?`<div style="font-size:.72rem;color:#E07B20;">均分 ${s.avgScore}/10</div>
            <div style="font-size:.7rem;color:#8C6647;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(s.topIssue)}</div>`:'<div style="font-size:.72rem;color:#C9BCAA;margin-top:2px;">无异常 ✨</div>'}
          </div>`;
        }).join('')}
      </div>

      <!-- 年度总结 -->
      <div style="margin-top:14px;padding:12px;background:#FFFBF5;border-radius:10px;border:2px solid #E8D9BC;">
        <b style="color:#6B4630;">📈 年度健康概况</b>
        <div style="margin-top:6px;font-size:.86rem;color:#4A3628;line-height:1.7;">
          全年共记录 <b style="color:#E07B20">${recs.length}</b> 条不适<br>
          最常出问题的类别：<b>${renderTopCategory(data, recs)}</b><br>
          平均不适感：<b style="color:#E07B20">${recs.length?(recs.reduce((a,r)=>a+r.score,0)/recs.length).toFixed(1):'-'}/10</b><br>
          最需关注的月份：<b>${monthStats.sort((a,b)=>b.count-a.count)[0]?.m||'-'}月</b>（${monthStats.sort((a,b)=>b.count-a.count)[0]?.count||0}条）
        </div>
      </div>
    `;

    $('#yPrev').onclick = () => { selDate = `${y-1}-01-01`; paintPane(); };
    $('#yNext').onclick = () => { selDate = `${y+1}-01-01`; paintPane(); };
  }

  function renderTopCategory(data, recs) {
    const freq = {};
    recs.forEach(r => { const cn = catInfo(data, r.cat).name; freq[cn]=(freq[cn]||0)+1; });
    const sorted = Object.entries(freq).sort((a,b)=>b[1]-a[1]);
    return sorted.length ? sorted[0][0] : '-';
  }

  /* ===== AI 智能汇总避雷 ===== */
  function renderAISummary(data) {
    const records = data.records || [];
    if (records.length === 0) {
      return `<p style="color:#9A8874;font-size:.85rem;line-height:1.6;">还没有健康记录哦～开始记录后，这里会自动生成你的个人避雷指南 🐔✨</p>`;
    }

    // 按状态聚合
    const byStatus = {};
    records.forEach(r => {
      if (!byStatus[r.status]) byStatus[r.status] = [];
      byStatus[r.status].push(r);
    });

    // 取最近30天高频问题
    const thirtyDaysAgo = Date.now() - 30*86400000;
    const recent = records.filter(r => r.ts >= thirtyDaysAgo);

    const recentFreq = {};
    recent.forEach(r => { recentFreq[r.status] = (recentFreq[r.status]||0)+1; });
    const topIssues = Object.entries(recentFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);

    // 按分类给建议
    const suggestions = {
      '拉肚子': '💡 建议：避免生冷食物、注意饮食卫生、少吃油腻辛辣。可喝温盐水补液。',
      '胃痛': '💡 建议：规律三餐、避免空腹吃刺激性食物、少喝浓茶咖啡。可适当喝小米粥养胃。',
      '肚子胀': '💡 建议：细嚼慢咽、避免边吃饭边说话、少吃豆类/碳酸饮料。饭后散步助消化。',
      '便秘': '💡 建议：多喝水、多吃蔬果粗纤维、定时排便。可晨起喝一杯温水。',
      '肚子疼': '💡 建议：记录疼痛位置和规律，如持续加重请及时就医。',
      '风寒感冒': '💡 建议：注意保暖、喝姜汤驱寒、避免吹冷风。多休息多喝热水。',
      '风热感冒': '💡 建议：清淡饮食、多喝水、可喝菊花茶/绿豆汤降火。保持室内通风。',
      '发烧': '⚠️ 建议：多休息补水、物理降温。超过38.5°C或持续不退请就医！',
      '喉咙痛': '💡 建议：少吃辛辣刺激、多喝温水、可用淡盐水漱口。避免用嗓过度。',
      '湿热内停': '💡 建议：饮食清淡、少吃油腻甜食、可吃红豆薏米祛湿。保持环境干燥通风。',
      '手腕腱鞘炎': '💡 建议：减少重复性手部动作、定时休息拉伸、可做握力球康复训练。',
      '肩关节劳损': '💡 建议：避免长时间同一姿势、每小时做肩部环绕运动、注意保暖。',
      '上背部不适': '💡 建议：调整坐姿屏幕高度、做胸椎伸展、避免含胸驼背久坐。',
      '手臂麻木': '⚠️ 建议：检查是否颈椎问题导致，避免长时间低头。如频繁发生建议就医检查。',
      '腿部麻木': '💡 建议：避免久坐久站、定时活动下肢、检查是否有腰椎问题。',
      '下肢水肿': '💡 建议：抬高双腿休息、减少盐分摄入、检查是否循环系统问题。持续请就医。',
      '屁股两侧痛': '💡 建议：换硬一些的座椅、定时起来活动、做臀部拉伸放松。',
      // —— 女性问题 ——
      '排卵期出血': '💡 建议：偶尔少量出血属常见，可观察；若频繁、量多或伴腹痛，建议妇科排查。',
      '分泌物异常': '💡 建议：留意颜色/气味变化，保持私处清洁干燥、穿透气内裤。异常持续请就医。',
      '痛经': '💡 建议：热敷小腹、避免生冷、适当休息。剧痛或影响生活请就医排查。',
      '尿路感染': '⚠️ 建议：多喝水冲刷、不憋尿、注意卫生。尿急尿痛伴发热请及时就医。',
      '乳房胀痛': '💡 建议：穿合身内衣、减少咖啡因、适当热敷。有硬块或血性溢液请就医。',
      '卵巢疼痛': '⚠️ 建议：单侧剧痛伴恶心呕吐需警惕，及时就医排查。',
      '月经过多': '💡 建议：记录用量与天数，长期过多易贫血，建议妇科就诊。',
      '月经过少': '💡 建议：观察是否与压力/节食有关，持续异常建议就医。',
      '经期时间异常': '💡 建议：记录周期长度，长期不规律建议妇科检查。',
      'default': '💡 建议：注意观察规律，找到诱因并尽量避免。规律作息、均衡饮食是基础。'
    };

    let html = '';
    if (topIssues.length) {
      html += `<div style="margin-bottom:10px;"><b style="font-size:.85rem;color:#E07B20;">🔥 近30天高频预警</b><ul style="margin:4px 0 0 16px;padding:0;font-size:.83rem;color:#4A3628;line-height:1.8;">`;
      topIssues.forEach(([status, count]) => {
        const sugg = suggestions[status] || suggestions['default'];
        html += `<li style="margin-bottom:4px;"><b>${esc(status)}</b> ×${count}次<br><span style="color:#8C6647;font-size:.8rem;">${sugg}</span></li>`;
      });
      html += '</ul></div>';
    }

    // ===== 历史溯源汇总（支持时间+状态双维筛选，展示所有记录）=====
    if (records.length) {
      // 所有已记录的状态（按出现次数排序，基于全部记录）
      const stFreq = {};
      records.forEach(r => { stFreq[r.status] = (stFreq[r.status] || 0) + 1; });
      const stList = Object.entries(stFreq).sort((a, b) => b[1] - a[1]);
      // 筛选失效（该状态已被删光）则回退到全部
      if (traceStatus !== '__all__' && !stFreq[traceStatus]) traceStatus = '__all__';

      // 按日期排序（旧→新），使用全部记录
      const sorted = records.slice().sort((a, b) => (a.date === b.date ? (a.ts || 0) - (b.ts || 0) : (a.date < b.date ? -1 : 1)));

      // 时间筛选：计算截止天数
      const now = new Date(); now.setHours(0,0,0,0);
      const timeCut = (() => {
        if (traceTime === 'week') return 7;
        if (traceTime === '2w') return 14;
        if (traceTime === 'month') return 30;
        return Infinity; // __all__ 不限
      })();

      // 应用双筛选
      let picked = sorted.filter(r => {
        const statusOk = (traceStatus === '__all__') || (r.status === traceStatus);
        if (!statusOk) return false;
        if (timeCut === Infinity) return true;
        const rd = new Date(r.date + 'T00:00:00');
        const diff = Math.round((now - rd) / 86400000);
        return diff <= timeCut && diff >= 0;
      }).reverse(); // 新→前显示

      html += `<div>
        <div class="row" style="align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:5px;">
          <b style="font-size:.85rem;color:#5B8C6A;">🔍 近期溯源记录</b>
          <span style="font-size:.76rem;color:#9A8874;margin-left:auto;">分类筛选</span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:5px;">
          <select id="hdTraceTime" style="padding:3px 7px;border:1.5px solid #CFE0D2;border-radius:7px;background:#fff;font-size:.75rem;color:#4A3628;">
            <option value="__all__" ${traceTime==='__all__'?'selected':''}>🕐 全部时间</option>
            <option value="week" ${traceTime==='week'?'selected':''}>📅 一周内</option>
            <option value="2w" ${traceTime==='2w'?'selected':''}>📅 两周内</option>
            <option value="month" ${traceTime==='month'?'selected':''}>📅 一月内</option>
          </select>
          <select id="hdTraceStatus" style="padding:3px 7px;border:1.5px solid #CFE0D2;border-radius:7px;background:#fff;font-size:.75rem;color:#4A3628;flex:1;min-width:100px;">
            <option value="__all__" ${traceStatus==='__all__'?'selected':''}>🏷️ 全部状态</option>
            ${stList.map(([s, c]) => `<option value="${esc(s)}" ${traceStatus===s?'selected':''}>${esc(s)}（${c}次）</option>`).join('')}
          </select>
        </div>`;

      // 选定某个状态时，给出这一状态的发展周期概览（不受时间筛选限制，展示完整周期）
      if (traceStatus !== '__all__') {
        const allOfStatus = records.filter(r => r.status === traceStatus)
          .slice().sort((a, b) => (a.date === b.date ? (a.ts || 0) - (b.ts || 0) : (a.date < b.date ? -1 : 1))).reverse();
        if (allOfStatus.length) {
          const first = allOfStatus[allOfStatus.length - 1], last = allOfStatus[0];
        const scores = allOfStatus.map(r => r.score || 0).filter(Boolean);
        const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '-';
        const span = (() => {
          const d1 = new Date(first.date + 'T00:00:00'), d2 = new Date(last.date + 'T00:00:00');
          const days = Math.round((d2 - d1) / 86400000) + 1;
          return days > 0 ? days : 1;
        })();
        const trend = (() => {
          if (scores.length < 2) return '—';
          const diff = (last.score || 0) - (first.score || 0);
          if (diff <= -2) return '📉 明显好转';
          if (diff < 0) return '🙂 略有缓解';
          if (diff === 0) return '➖ 基本持平';
          if (diff < 2) return '🙁 略有加重';
          return '📈 明显加重';
        })();
        html += `<div style="padding:8px 10px;background:#F4FAF5;border:1.5px solid #CFE0D2;border-radius:8px;margin-bottom:6px;font-size:.78rem;color:#4A3628;line-height:1.7;">
          <b style="color:#5B8C6A;">「${esc(traceStatus)}」发展周期</b><br>
          共 <b>${allOfStatus.length}</b> 次记录 · 跨度 <b>${span}</b> 天（${first.date} → ${last.date}）<br>
          平均不适 <b style="color:#E07B20;">${avg}/10</b> · 趋势 <b>${trend}</b>
        </div>`;
        } // end allOfStatus.length
      } // end traceStatus !== __all__

      html += `<div>`;
      if (!picked.length) {
        html += `<p style="color:#9A8874;font-size:.8rem;padding:6px;">该筛选条件下暂无记录～</p>`;
      }
      picked.forEach(r => {
        const ci = catInfo(data, r.cat);
        html += `<div style="padding:6px 8px;background:#fff;border-radius:6px;margin-bottom:3px;font-size:.8rem;">
          <span style="color:#9A8874;">${r.date}</span>
          <span class="chip sm" style="font-size:.7rem;background:${ci.color};color:#fff;border:none;margin-left:4px;">${esc(r.status)}</span>
          ${r.score ? `<span style="color:#E07B20;font-weight:600;margin-left:4px;font-size:.76rem;">${r.score}/10</span>` : ''}
          ${r.trace ? `<p style="color:#4A3628;margin-top:2px;">${esc(r.trace)}</p>` : ''}
        </div>`;
      });
      html += '</div></div>';
    }

    return html;
  }

  /* 绑定溯源双筛选（时间+状态，每次重绘汇总区后都要重新绑定） */
  function bindTraceFilter() {
    const timeSel = $('#hdTraceTime');
    const stSel = $('#hdTraceStatus');
    if (timeSel) timeSel.onchange = () => { traceTime = timeSel.value; reRenderSummary(); };
    if (stSel) stSel.onchange = () => { traceStatus = stSel.value; reRenderSummary(); };
  }
  function reRenderSummary() {
    const box = $('#hdAISummary');
    if (box) { box.innerHTML = renderAISummary(get()); bindTraceFilter(); }
  }

  /* 工具函数 */
  function formatDate(d) {
    if (!d) return '';
    const [y,m,day] = d.split('-');
    return `${parseInt(m)}月${parseInt(day)}日`;
  }
  function weekday(d) {
    const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
    return days[new Date(d+'T00:00:00').getDay()];
  }

  /* 月历视图需要覆盖 paintPane */
  const origPaintPane = paintPane;
  paintPane = function() {
    const pane = $('#hdPane'); if(!pane)return;
    if (view === 'month') { renderMonthView(pane); }
    else if (view === 'year') { renderYearView(pane); }
    else { renderRecordForm(pane); }
  };

  window.Modules = window.Modules || {};
  window.Modules.health = { id: 'health', name: '健康管理', desc: '小鸡守护你的每一天', icon: 'chick', render };
})();
