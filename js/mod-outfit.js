/* ===== 模块 5：穿搭表达 ===== */
(function () {
  const { $, $$, esc, uid, today, toast, modal, confirmBox, pickImage } = UI;

  const SECTIONS = [
    { k: 'clothes', n: '衣服篇', ico: '👗' },
    { k: 'acc', n: '饰品篇', ico: '💍' },
    { k: 'hair', n: '发型篇', ico: '💇' },
    { k: 'practice', n: '灵活实践', ico: '📸' }
  ];

  const WEATHER_CODE = {
    0: ['☀️', '晴'], 1: ['🌤', '大部晴'], 2: ['⛅', '多云'], 3: ['☁️', '阴'],
    45: ['🌫', '雾'], 48: ['🌫', '雾凇'], 51: ['🌦', '毛毛雨'], 53: ['🌦', '小雨'], 55: ['🌧', '中雨'],
    61: ['🌧', '小雨'], 63: ['🌧', '中雨'], 65: ['🌧', '大雨'], 71: ['🌨', '小雪'], 73: ['🌨', '中雪'],
    75: ['❄️', '大雪'], 80: ['🌦', '阵雨'], 81: ['🌧', '阵雨'], 82: ['⛈', '强阵雨'], 95: ['⛈', '雷阵雨']
  };

  function dressAdvice(t) {
    if (t == null || isNaN(t)) return '填入气温后我给你推荐穿搭～';
    if (t >= 30) return '🥵 酷热：真丝/棉麻短袖、宽松半裙或短裤，戴帽子+墨镜，防晒必须 SPF50+。';
    if (t >= 28) return '☀️ 炎热：短袖 T 恤 / 连衣裙 + 凉鞋，随身带薄防晒衫应对空调房。';
    if (t >= 24) return '😎 温热：短袖 + 薄开衫备用，下装九分裤或半裙，早晚温差留意。';
    if (t >= 20) return '🍃 舒适：长袖 T / 衬衫 + 长裤，最百搭的温度，可以尽情叠穿配色。';
    if (t >= 17) return '🍂 微凉：薄卫衣 / 针织开衫 + 牛仔裤，加一条丝巾提亮。';
    if (t >= 12) return '🧥 转凉：风衣 / 夹克 + 内搭长袖，脚踝别露，容易受寒。';
    if (t >= 8) return '🧣 冷：厚毛衣 + 大衣，围巾登场，可以开始叠穿保暖内衣。';
    if (t >= 4) return '🥶 很冷：羊毛大衣 / 棉服 + 毛衣 + 保暖内搭，手套围巾帽子三件套。';
    return '❄️ 严寒：羽绒服 + 抓绒/羊绒内胆 + 保暖裤，注意头颈手脚保暖。';
  }
  function uvAdvice(uv) {
    if (uv == null || isNaN(uv)) return '';
    if (uv <= 2) return '紫外线弱，日常防晒即可（SPF15-30）。';
    if (uv <= 5) return '紫外线中等，出门涂 SPF30 防晒，两小时补涂。';
    if (uv <= 7) return '紫外线较强，SPF50 + 帽子 + 墨镜，避免正午暴晒。';
    if (uv <= 10) return '紫外线很强，硬防晒必须上：伞、帽、口罩、防晒衣。';
    return '紫外线极强！尽量减少 10:00-16:00 外出，全副武装。';
  }

  let curSec = 'clothes';
  let curCol = '全部';
  let outfitFilterTag = '__all__'; // 标签筛选
  let outfitFilterY = ''; // 年份筛选，空=全部
  let outfitFilterSeason = '__all__'; // 季节筛选
  let autoW = DB.get('outfit.autoWeather', false);

  const getNotes = () => DB.get('outfit.notes', []);
  const setNotes = (v) => DB.set('outfit.notes', v);

  function render(root) {
    const w = DB.get('outfit.weather', {});
    root.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#FFF6E2,#FFE9C6);border-color:var(--orange-l);">
        <div class="card-title"><span class="ci">${Icons.sun()}</span>今日天气 <small id="wDate">${today()}</small></div>
        <div class="row" style="margin-bottom:8px;">
          <span class="hint grow">联网自动定位并更新气温</span>
          <button class="chip sm ${autoW ? 'on' : ''}" id="wToggle">🔄 自动更新：${autoW ? '开' : '关'}</button>
        </div>
        <div class="row" style="align-items:flex-end;gap:14px;">
          <div>
            <div style="font-size:34px;font-weight:800;line-height:1;" id="wTemp">${w.temp != null ? w.temp + '°' : '--°'}</div>
            <div class="hint" id="wRange">${w.tmin != null ? `${w.tmin}° ~ ${w.tmax}°` : '点右侧按钮获取或手填'}</div>
          </div>
          <div class="grow">
            <div style="font-size:22px;" id="wIco">${w.ico || '🌤'}</div>
            <div style="font-size:12.5px;font-weight:700;" id="wCond">${esc(w.cond || '未知')}</div>
            <div class="hint" id="wUv">紫外线 ${w.uv != null ? w.uv : '--'}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            <button class="chip sm" id="wAuto">📍自动</button>
            <button class="chip sm" id="wEdit">✏️手填</button>
          </div>
        </div>
        <div class="divider"></div>
        <div style="font-size:12.8px;line-height:1.7;font-weight:600;" id="wAdvice">${dressAdvice(w.temp)}</div>
        <div class="hint" style="margin-top:4px;" id="wUvAdv">${uvAdvice(w.uv)}</div>
        <div class="divider"></div>
        <span class="lbl">今天我打算这么穿</span>
        <textarea class="field" id="wMyPlan" style="min-height:56px;" placeholder="记一下今天的穿搭想法…">${esc(DB.get('outfit.plan:' + today(), ''))}</textarea>
        <button class="btn sm block" id="wSavePlan" style="margin-top:8px;">保存今日穿搭记录</button>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.shirt()}</span>构建衣橱</div>
        <div class="tabs sub" id="secTabs">
          ${SECTIONS.map(s => `<div class="tab ${curSec === s.k ? 'active' : ''}" data-k="${s.k}">${s.ico} ${s.n}</div>`).join('')}
        </div>
        <div class="row" style="margin:9px 0;">
          <div class="chip-group grow" id="colGrp"></div>
        </div>
        <div class="row" style="margin-bottom:10px;">
          <button class="btn grow" id="noteAdd">${Icons.plus()}添加图文存档</button>
          <button class="btn ghost" id="colManage">合集</button>
        </div>
        <div id="outfitFilters" style="margin-bottom:10px;"></div>
        <div class="grid2" id="noteGrid"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.pen()}</span>色彩搭配 <small>看到有意思的配色就存下来</small></div>
        <button class="btn ghost block sm" id="colorAdd" style="margin-bottom:10px;">${Icons.plus()}记一组配色</button>
        <div id="colorList"></div>
      </div>`;

    $$('#secTabs .tab').forEach(t => t.onclick = () => {
      curSec = t.dataset.k; curCol = '全部';
      outfitFilterTag = '__all__'; outfitFilterY = ''; outfitFilterSeason = '__all__';
      $$('#secTabs .tab').forEach(x => x.classList.toggle('active', x === t));
      drawCols(); drawNotes(); drawOutfitFilters();
    });
    $('#noteAdd').onclick = () => editNote(null);
    $('#colManage').onclick = manageCollections;
    $('#colorAdd').onclick = () => editColor(null);
    $('#wAuto').onclick = autoWeather;
    $('#wEdit').onclick = manualWeather;
    $('#wToggle').onclick = () => {
      autoW = !autoW;
      DB.set('outfit.autoWeather', autoW);
      $('#wToggle').classList.toggle('on', autoW);
      $('#wToggle').textContent = '🔄 自动更新：' + (autoW ? '开' : '关');
      if (autoW) autoWeather();
      else toast('已关闭自动更新');
    };
    $('#wSavePlan').onclick = () => { DB.set('outfit.plan:' + today(), $('#wMyPlan').value); toast('今日穿搭已记录 👗'); };

    drawCols(); drawNotes(); drawColors(); drawOutfitFilters();
    // 开启自动更新且今日天气缺失/过期时，静默刷新一次
    if (autoW) {
      const w = DB.get('outfit.weather', {});
      if (!w || w.date !== today()) autoWeather();
    }
  }

  /* ---- 天气 ---- */
  function applyWeather(w) {
    DB.set('outfit.weather', w);
    $('#wTemp').textContent = w.temp != null ? w.temp + '°' : '--°';
    $('#wRange').textContent = w.tmin != null ? `${w.tmin}° ~ ${w.tmax}°` : '';
    $('#wIco').textContent = w.ico || '🌤';
    $('#wCond').textContent = w.cond || '未知';
    $('#wUv').textContent = '紫外线 ' + (w.uv != null ? w.uv : '--');
    $('#wAdvice').textContent = dressAdvice(w.temp);
    $('#wUvAdv').textContent = uvAdvice(w.uv);
  }

  function autoWeather() {
    const loc = DB.get('outfit.loc', null);
    if (loc && loc.la != null) { fetchWeather(loc.la, loc.lo); return; }
    if (!navigator.geolocation) { toast('设备不支持定位，手填吧～'); return manualWeather(); }
    toast('正在定位…');
    navigator.geolocation.getCurrentPosition((pos) => {
      const la = pos.coords.latitude, lo = pos.coords.longitude;
      DB.set('outfit.loc', { la, lo });
      fetchWeather(la, lo);
    }, () => { toast('定位被拒绝，手填吧～'); manualWeather(); }, { timeout: 8000 });
  }

  async function fetchWeather(la, lo) {
    try {
      const ctrl = new AbortController();
      const tm = setTimeout(() => ctrl.abort(), 8000);
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=1`, { signal: ctrl.signal });
      clearTimeout(tm);
      const j = await r.json();
      const code = j.current.weather_code;
      const wc = WEATHER_CODE[code] || ['🌤', '未知'];
      applyWeather({
        date: today(), temp: Math.round(j.current.temperature_2m),
        tmin: Math.round(j.daily.temperature_2m_min[0]), tmax: Math.round(j.daily.temperature_2m_max[0]),
        uv: Math.round(j.daily.uv_index_max[0]), cond: wc[1], ico: wc[0]
      });
      toast('天气已更新 ☀️');
    } catch (e) {
      toast('联网获取失败，手填一下吧');
      manualWeather();
    }
  }

  function manualWeather() {
    const w = DB.get('outfit.weather', {});
    modal.open('手动填写天气', `
      <div class="row"><div class="grow"><span class="lbl">当前气温 ℃</span><input class="field" id="mT" type="number" value="${w.temp != null ? w.temp : ''}"></div>
      <div class="grow"><span class="lbl">紫外线指数 0-11</span><input class="field" id="mU" type="number" value="${w.uv != null ? w.uv : ''}"></div></div>
      <div class="row" style="margin-top:8px;"><div class="grow"><span class="lbl">最低温</span><input class="field" id="mMin" type="number" value="${w.tmin != null ? w.tmin : ''}"></div>
      <div class="grow"><span class="lbl">最高温</span><input class="field" id="mMax" type="number" value="${w.tmax != null ? w.tmax : ''}"></div></div>
      <span class="lbl" style="margin-top:8px;">天气状况</span>
      <div class="chip-group" id="condGrp">
        ${[['☀️', '晴'], ['⛅', '多云'], ['☁️', '阴'], ['🌧', '雨'], ['⛈', '雷阵雨'], ['🌨', '雪'], ['🌫', '雾霾'], ['💨', '大风']].map(([i, n]) => `<button class="chip ${w.cond === n ? 'on' : ''}" data-i="${i}" data-n="${n}">${i} ${n}</button>`).join('')}
      </div>
      <button class="btn block" id="mSave" style="margin-top:12px;">保存</button>`, (b) => {
      let ico = w.ico || '🌤', cond = w.cond || '晴';
      $$('#condGrp .chip', b).forEach(c => c.onclick = () => {
        ico = c.dataset.i; cond = c.dataset.n;
        $$('#condGrp .chip', b).forEach(x => x.classList.toggle('on', x === c));
      });
      $('#mSave', b).onclick = () => {
        const num = (v) => v === '' ? null : Number(v);
        applyWeather({
          date: today(), temp: num($('#mT', b).value), uv: num($('#mU', b).value),
          tmin: num($('#mMin', b).value), tmax: num($('#mMax', b).value), cond, ico
        });
        modal.close(); toast('天气已保存');
      };
    });
  }

  /* ---- 合集 ---- */
  function drawCols() {
    const notes = getNotes().filter(n => n.type === curSec);
    const cols = ['全部', ...Array.from(new Set(notes.map(n => n.col).filter(Boolean)))];
    if (!cols.includes(curCol)) curCol = '全部';
    $('#colGrp').innerHTML = cols.map(c =>
      `<button class="chip sm ${curCol === c ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}${c !== '全部' ? ` ${notes.filter(n => n.col === c).length}` : ''}</button>`).join('');
    $$('#colGrp .chip').forEach(c => c.onclick = () => { curCol = c.dataset.c; drawCols(); drawNotes(); });
  }

  function manageCollections() {
    const notes = getNotes().filter(n => n.type === curSec);
    const cols = Array.from(new Set(notes.map(n => n.col).filter(Boolean)));
    modal.open('合集管理', `
      <div class="hint" style="margin-bottom:9px;">合集用于把同类笔记合并在一起，比如「秋冬通勤」「显白配色」。</div>
      <div id="colList">${cols.length ? cols.map(c => {
        const items = notes.filter(n => n.col === c);
        return `<div class="rec-item" data-col-view="${esc(c)}" style="cursor:pointer;">
        <div class="rec-ico">📁</div>
        <div class="rec-main"><div class="t">${esc(c)}</div><div class="s">${items.length} 条笔记</div></div>
        <button class="chip sm" data-ren="${esc(c)}">改名</button>
        <button class="chip sm" data-rm="${esc(c)}">解散</button></div>`;
      }).join('') : '<div class="empty">还没有合集，添加笔记时填写合集名即可自动创建</div>'}</div>`, (b) => {
      // 点击合集名称区域 → 查看该合集所有笔记
      $$('[data-col-view]', b).forEach(el => el.onclick = (e) => {
        if (e.target.closest('[data-ren]') || e.target.closest('[data-rm]')) return; // 点按钮不触发
        const colName = el.dataset.colView;
        const colNotes = getNotes().filter(n => n.type === curSec && n.col === colName).sort((a, b) => b.ts - a.ts);
        modal.open('📁 ' + colName + `（${colNotes.length} 条）`, colNotes.length ? colNotes.map(n => `
          <div class="pcard" style="margin-bottom:9px;">
            ${n.imgs && n.imgs[0] ? `<img class="pimg" src="${n.imgs[0]}" style="max-height:160px;object-fit:cover;border-radius:10px;">` : ''}
            <div style="font-size:13px;font-weight:700;margin-top:5px;">${esc(n.title || '未命名')}</div>
            <div class="hint" style="font-size:11.5px;">${new Date(n.ts).toLocaleString('zh-CN')}</div>
            ${n.text ? `<div style="font-size:12.5px;line-height:1.6;margin-top:4px;white-space:pre-wrap;">${esc(n.text.slice(0, 200))}${n.text.length > 200 ? '…' : ''}</div>` : ''}
            <div class="chip-group" style="margin-top:6px;">
              ${n.season ? `<span class="chip sm" style="background:#F2A340;color:#fff;">${esc(n.season)}</span>` : ''}
              ${(n.tags || []).slice(0, 3).map(t => `<span class="chip sm">#${esc(t)}</span>`).join('')}
            </div>
          </div>`).join('') : '<div class="empty">该合集暂无笔记</div>');
      });
      $$('[data-ren]', b).forEach(btn => btn.onclick = async () => {
        const old = btn.dataset.ren;
        const nv = await UI.promptBox('新的合集名称', old);
        if (!nv) return;
        const all = getNotes(); all.forEach(n => { if (n.type === curSec && n.col === old) n.col = nv; });
        setNotes(all); modal.close(); drawCols(); drawNotes(); toast('改好啦');
      });
      $$('[data-rm]', b).forEach(btn => btn.onclick = async () => {
        if (!(await confirmBox(`解散合集「${btn.dataset.rm}」？笔记会保留，只是不再归入合集。`))) return;
        const all = getNotes(); all.forEach(n => { if (n.type === curSec && n.col === btn.dataset.rm) n.col = ''; });
        setNotes(all); modal.close(); drawCols(); drawNotes(); toast('已解散');
      });
    });
  }

  /* ---- 图文笔记 ---- */
  function drawNotes() {
    let list = getNotes().filter(n => n.type === curSec);
    if (curCol !== '全部') list = list.filter(n => n.col === curCol);
    // 标签筛选
    if (outfitFilterTag !== '__all__') list = list.filter(n => (n.tags || []).includes(outfitFilterTag));
    // 年份筛选
    if (outfitFilterY) list = list.filter(n => {
      const d = new Date(n.ts);
      return String(d.getFullYear()) === outfitFilterY;
    });
    // 季节筛选
    if (outfitFilterSeason !== '__all__') list = list.filter(n => n.season === outfitFilterSeason);
    list.sort((a, b) => b.ts - a.ts);
    const g = $('#noteGrid');
    if (!list.length) {
      g.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="e-ico">${Icons.fox()}</div>还没有存档～<br>看到顺眼的风格就存进来吧</div>`;
      return;
    }
    g.innerHTML = list.map(n => `
      <div class="pcard" data-id="${n.id}">
        ${n.imgs && n.imgs[0]
        ? `<img class="pimg clickable-img" src="${n.imgs[0]}">`
        : `<div class="pimg ph">${Icons.shirt()}</div>`}
        <div class="pb">
          <div class="pt">${esc(n.title || '未命名')}</div>
          <div class="ps">${esc((n.text || '').slice(0, 40))}</div>
          <div class="pf">
            ${n.season ? `<span class="tag t-mid" style="background:#F2A340;color:#fff;">${esc(n.season)}</span>` : ''}
            ${n.col ? `<span class="tag t-mid">📁${esc(n.col)}</span>` : ''}
            ${(n.tags || []).slice(0, 2).map(t => `<span class="tag t-soul">${esc(t)}</span>`).join('')}
            ${n.imgs && n.imgs.length > 1 ? `<span class="tag t-body">${n.imgs.length}图</span>` : ''}
          </div>
        </div>
      </div>`).join('');
    $$('#noteGrid .pcard').forEach(c => c.onclick = () => viewNote(c.dataset.id));
  }

  /* ---- 衣橱筛选（年份/季节/标签） ---- */
  function drawOutfitFilters() {
    const box = $('#outfitFilters');
    if (!box) return;
    const notes = getNotes().filter(n => n.type === curSec);
    // 收集所有年份
    const years = Array.from(new Set(notes.map(n => new Date(n.ts).getFullYear()).sort((a,b)=>b-a)));
    // 收集所有标签
    const allTags = Array.from(new Set(notes.flatMap(n => n.tags || []))).sort();
    // 收集所有已用季节
    const allSeasons = Array.from(new Set(notes.map(n => n.season).filter(Boolean)));

    // 当前筛选后的数量提示
    let filteredCount = notes.length;
    if (outfitFilterY) filteredCount = notes.filter(n => String(new Date(n.ts).getFullYear()) === outfitFilterY).length;
    const baseList = outfitFilterY ? notes.filter(n => String(new Date(n.ts).getFullYear()) === outfitFilterY) : notes;
    if (outfitFilterSeason !== '__all__') filteredCount = baseList.filter(n => n.season === outfitFilterSeason).length;
    const sList = outfitFilterSeason !== '__all__' ? baseList.filter(n => n.season === outfitFilterSeason) : baseList;
    if (outfitFilterTag !== '__all__') filteredCount = sList.filter(n => (n.tags||[]).includes(outfitFilterTag)).length;

    box.innerHTML = `
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 10px;background:#FFFBF5;border-radius:10px;border:1.5px dashed #E8D9BC;">
        <span style="font-size:.76rem;color:#9A8874;font-weight:600;white-space:nowrap;">🔍 筛选</span>
        <select id="ofYearSel" style="padding:3px 7px;border:1.5px solid #E8D9BC;border-radius:7px;background:#fff;font-size:.73rem;color:#4A3628;">
          <option value="">📅 全部年份</option>
          ${years.map(y => `<option value="${y}" ${outfitFilterY===String(y)?'selected':''}>${y}年</option>`).join('')}
        </select>
        <select id="ofSeasonSel" style="padding:3px 7px;border:1.5px solid #E8D9BC;border-radius:7px;background:#fff;font-size:.73rem;color:#4A3628;">
          <option value="__all__" ${outfitFilterSeason==='__all__'?'selected':''}>🍂 全部季节</option>
          ${['春','夏','秋','冬'].map(s => {
            const cnt = allSeasons.filter(x => x === s).length;
            return `<option value="${s}" ${outfitFilterSeason===s?'selected':''}>${s} ${cnt ? '('+cnt+')' : ''}</option>`;
          }).join('')}
        </select>
        <select id="ofTagSel" style="padding:3px 7px;border:1.5px solid #E8D9BC;border-radius:7px;background:#fff;font-size:.73rem;color:#4A3628;flex:1;min-width:80px;">
          <option value="__all__" ${outfitFilterTag==='__all__'?'selected':''}>🏷️ 全部标签</option>
          ${allTags.map(t => `<option value="${esc(t)}" ${outfitFilterTag===t?'selected':''}>${esc(t)}</option>`).join('')}
        </select>
        <span style="font-size:.7rem;color:#C9A66B;white-space:nowrap;margin-left:auto;">${filteredCount < notes.length ? filteredCount + '/' + notes.length : notes.length} 条</span>
      </div>`;
    $('#ofYearSel').onchange = () => { outfitFilterY = $('#ofYearSel').value; drawNotes(); drawOutfitFilters(); };
    $('#ofSeasonSel').onchange = () => { outfitFilterSeason = $('#ofSeasonSel').value; drawNotes(); drawOutfitFilters(); };
    $('#ofTagSel').onchange = () => { outfitFilterTag = $('#ofTagSel').value; drawNotes(); drawOutfitFilters(); };
  }

  function viewNote(id) {
    const n = getNotes().find(x => x.id === id); if (!n) return;
    modal.open(n.title || '存档', `
      ${(n.imgs || []).map(s => `<img class="onote-img" src="${s}" style="width:100%;border-radius:14px;margin-bottom:8px;">`).join('')}
      <div style="font-size:13.5px;line-height:1.8;white-space:pre-wrap;">${esc(n.text || '')}</div>
      <div class="chip-group" style="margin-top:9px;">
        ${n.season ? `<span class="chip sm" style="background:#F2A340;color:#fff;">🍂 ${esc(n.season)}</span>` : ''}
        ${n.col ? `<span class="chip sm">📁 ${esc(n.col)}</span>` : ''}
        ${(n.tags || []).map(t => `<span class="chip sm">#${esc(t)}</span>`).join('')}
      </div>
      <div class="hint" style="margin-top:6px;">${new Date(n.ts).toLocaleString('zh-CN')}</div>
      <div class="row" style="margin-top:12px;">
        <button class="btn ghost grow" id="nDel">删除</button>
        <button class="btn grow" id="nEdit">编辑</button>
      </div>`, (b) => {
      $('#nEdit', b).onclick = () => { modal.close(); editNote(id); };
      $$('.onote-img', b).forEach((im, i) => { im.onclick = (e) => { e.stopPropagation(); openLightbox((n.imgs || []).slice(), i); }; });
      $('#nDel', b).onclick = async () => {
        if (await confirmBox('删除这条存档？')) { setNotes(getNotes().filter(x => x.id !== id)); modal.close(); drawCols(); drawNotes(); toast('已删除'); }
      };
    });
  }

  function editNote(id) {
    const all = getNotes();
    const n = id ? all.find(x => x.id === id) : { id: uid(), type: curSec, title: '', text: '', imgs: [], col: '', tags: [], ts: Date.now() };
    let imgs = (n.imgs || []).slice();
    const secName = (SECTIONS.find(s => s.k === curSec) || {}).n || '';
    modal.open((id ? '编辑' : '新增') + secName + '存档', `
      <span class="lbl">标题</span>
      <input class="field" id="nTitle" value="${esc(n.title)}" placeholder="比如：奶油色针织叠穿">
      <span class="lbl" style="margin-top:8px;">图片（可多张）</span>
      <div class="row wrap" id="imgBox" style="margin-bottom:6px;"></div>
      <button class="btn ghost sm" id="nAddImg">🖼 添加图片</button>
      <span class="lbl" style="margin-top:10px;">笔记内容</span>
      <textarea class="field" id="nText" style="min-height:110px;" placeholder="喜欢的点、单品来源、搭配思路…">${esc(n.text)}</textarea>
      <div class="row" style="margin-top:8px;">
        <div class="grow"><span class="lbl">合集（可留空）</span><input class="field" id="nCol" value="${esc(n.col || '')}" placeholder="秋冬通勤" list="colDL"></div>
        <div class="grow"><span class="lbl">标签（逗号分隔）</span><input class="field" id="nTags" value="${esc((n.tags || []).join(','))}" placeholder="显白,法式"></div>
      </div>
      <div class="row" style="margin-top:8px;">
        <div class="grow"><span class="lbl">季节分类</span>
          <select id="nSeason" style="width:100%;padding:6px 9px;border:1.5px solid #E8D9BC;border-radius:8px;background:#fff;font-size:.85rem;color:#4A3628;">
            <option value="">未分类</option>
            ${['春','夏','秋','冬'].map(s => `<option value="${s}" ${(n.season||'')===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <datalist id="colDL">${Array.from(new Set(all.filter(x => x.type === curSec).map(x => x.col).filter(Boolean))).map(c => `<option value="${esc(c)}"></option>`).join('')}</datalist>
      <button class="btn block" id="nSave" style="margin-top:12px;">保存</button>`, (b) => {
      const drawImgs = () => {
        $('#imgBox', b).innerHTML = imgs.map((s, i) =>
          `<div style="position:relative;"><img src="${s}" style="width:64px;height:80px;object-fit:cover;border-radius:9px;border:1.5px solid var(--line);">
          <span data-i="${i}" style="position:absolute;top:-6px;right:-6px;background:#E0806F;color:#fff;width:19px;height:19px;border-radius:50%;font-size:13px;display:flex;align-items:center;justify-content:center;">×</span></div>`).join('');
        $$('#imgBox span[data-i]', b).forEach(x => x.onclick = () => { imgs.splice(Number(x.dataset.i), 1); drawImgs(); });
      };
      drawImgs();
      $('#nAddImg', b).onclick = async () => { const im = await pickImage(1400); if (im) { imgs.push(im); drawImgs(); } };
      $('#nSave', b).onclick = () => {
        const t = $('#nTitle', b).value.trim();
        if (!t && !imgs.length) { toast('至少写个标题或加张图'); return; }
        n.title = t; n.text = $('#nText', b).value; n.imgs = imgs;
        n.col = $('#nCol', b).value.trim();
        n.tags = $('#nTags', b).value.split(/[,，]/).map(x => x.trim()).filter(Boolean);
        n.season = $('#nSeason', b).value;
        n.type = curSec; n.ts = n.ts || Date.now();
        if (!id) all.push(n);
        setNotes(all); modal.close(); drawCols(); drawNotes(); toast('存好啦 ✨');
      };
    });
  }

  /* ---- 色彩搭配 ---- */
  function drawColors() {
    const list = DB.get('outfit.colors', []).slice().sort((a, b) => b.ts - a.ts);
    const box = $('#colorList');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.chick()}</div>还没有配色记录～<br>三花猫配色：米白 + 咖啡棕 + 橘黄，先来一组？</div>`;
      return;
    }
    box.innerHTML = list.map(c => `
      <div class="card tight" data-id="${c.id}" style="margin-bottom:9px;">
        <div class="color-sw">${c.colors.map(x => `<i style="background:${x}"></i>`).join('')}</div>
        <div class="row" style="margin-top:7px;">
          <div class="grow"><b style="font-size:13px;">${esc(c.name)}</b>
          <div class="hint">${esc(c.note || '')}</div></div>
          <span class="chip sm" data-act="del">删</span>
        </div>
        <div class="chip-group" style="margin-top:6px;">${c.colors.map(x => `<span class="chip sm" style="font-family:monospace;">${x}</span>`).join('')}</div>
      </div>`).join('');
    box.onclick = (e) => {
      const card = e.target.closest('[data-id]'); if (!card) return;
      if (e.target.dataset.act === 'del') {
        DB.set('outfit.colors', DB.get('outfit.colors', []).filter(x => x.id !== card.dataset.id));
        drawColors(); toast('已删除'); return;
      }
      editColor(card.dataset.id);
    };
  }

  function editColor(id) {
    const all = DB.get('outfit.colors', []);
    const c = id ? all.find(x => x.id === id) : { id: uid(), name: '', colors: ['#FAF0DC', '#6B4630', '#F2A340'], note: '', ts: Date.now() };
    modal.open(id ? '编辑配色' : '记一组配色', `
      <span class="lbl">配色名称</span>
      <input class="field" id="cName" value="${esc(c.name)}" placeholder="比如：三花猫配色">
      <span class="lbl" style="margin-top:9px;">颜色（点色块修改，最多 6 个）</span>
      <div class="row wrap" id="cColors"></div>
      <div class="row" style="margin-top:7px;">
        <button class="btn ghost sm" id="cAdd">+ 加一个颜色</button>
        <button class="btn ghost sm" id="cRandom">🎲 随机灵感</button>
      </div>
      <span class="lbl" style="margin-top:9px;">笔记</span>
      <textarea class="field" id="cNote" style="min-height:70px;" placeholder="适合什么场合、为什么好看…">${esc(c.note || '')}</textarea>
      <button class="btn block" id="cSave" style="margin-top:12px;">保存</button>`, (b) => {
      let cols = c.colors.slice();
      const draw = () => {
        $('#cColors', b).innerHTML = cols.map((x, i) => `
          <div style="position:relative;">
            <input type="color" value="${x}" data-i="${i}" style="width:52px;height:52px;border:none;background:none;padding:0;">
            <span data-rm="${i}" style="position:absolute;top:-4px;right:-4px;background:#E0806F;color:#fff;width:17px;height:17px;border-radius:50%;font-size:12px;display:flex;align-items:center;justify-content:center;">×</span>
          </div>`).join('');
        $$('#cColors input[type=color]', b).forEach(inp => inp.oninput = () => { cols[Number(inp.dataset.i)] = inp.value; });
        $$('#cColors span[data-rm]', b).forEach(s => s.onclick = () => { if (cols.length > 1) { cols.splice(Number(s.dataset.rm), 1); draw(); } });
      };
      draw();
      $('#cAdd', b).onclick = () => { if (cols.length < 6) { cols.push('#DDDDDD'); draw(); } };
      $('#cRandom', b).onclick = () => {
        const P = [['#FAF0DC', '#6B4630', '#F2A340'], ['#EDE6DC', '#7C8C7A', '#C9A66B'], ['#FDF0F0', '#D98B8B', '#8C6647'],
        ['#E8EEF2', '#5789A9', '#F0C987'], ['#F5F0E1', '#3E4E50', '#C4703E'], ['#FFF4E6', '#B0764F', '#7A9E7E']];
        cols = P[Math.floor(Math.random() * P.length)].slice(); draw();
      };
      $('#cSave', b).onclick = () => {
        c.name = $('#cName', b).value.trim() || '未命名配色';
        c.colors = cols; c.note = $('#cNote', b).value;
        if (!id) all.push(c);
        DB.set('outfit.colors', all); modal.close(); drawColors(); toast('配色存好啦 🎨');
      };
    });
  }

  window.Modules = window.Modules || {};
  window.Modules.outfit = { id: 'outfit', name: '穿搭表达', desc: '狐狸帮你搭出高级感', icon: 'fox', render };
})();
