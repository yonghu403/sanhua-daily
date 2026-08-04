/* ===== 模块 6：化妆护肤 ===== */
(function () {
  const { $, $$, esc, uid, today, toast, modal, confirmBox, promptBox, pickImage, longPress } = UI;

  const PROD_CATS = ['防晒', '卸妆', '洁面', '化妆水', '精华', '乳液面霜', '眼霜', '面膜', '身体乳', '护发精油', '洗发水', '底妆', '口红', '香水', '其他'];
  const DEF_STEPS = ['卸妆', '洁面', '化妆水/爽肤水', '精华', '眼霜', '乳液/面霜', '防晒（早）', '面膜（每周 2-3 次）'];

  const SEASON_TIPS = {
    春: {
      t: '春季 · 换季敏感期',
      list: [
        '气温回升出油增多，但屏障还没完全恢复，别急着上强功效酸类。',
        '洁面换成氨基酸类，早晚各一次，水温 32-34℃。',
        '柳絮花粉季易泛红，精简护肤：水 + 修护精华 + 清爽乳。',
        '防晒从春天就要开始，SPF30 PA+++ 起步，紫外线不看温度。',
        '混油皮建议 T 区控油乳、两颊保湿乳分区护理。'
      ]
    },
    夏: {
      t: '夏季 · 控油防晒主场',
      list: [
        '出油高峰，清洁要够但不能过度：早晨可只用清水或极温和洁面。',
        '质地全面换轻薄：凝露、无油乳液、水感防晒。',
        '防晒 SPF50+ PA++++，每 2-3 小时补涂（防晒喷雾/气垫补）。',
        '每周 1-2 次清洁面膜（高岭土），之后立刻补水面膜镇定。',
        '烟酰胺 + 水杨酸组合可控油缩毛孔，但要建立耐受，从每周 2 次开始。',
        '空调房记得放加湿器，外油内干就是这么来的。'
      ]
    },
    秋: {
      t: '秋季 · 修护屏障黄金期',
      list: [
        '出油减少、水分流失加快，护肤重点从"控油"转向"锁水"。',
        '加入神经酰胺、角鲨烷类修护成分，把夏天折腾的屏障补回来。',
        '功效护肤（A 醇、果酸）最适合在秋冬开始建立耐受，从低浓度隔天用。',
        '防晒不能停，秋天的 UVA 依然很强。',
        '身体也要保湿了，洗澡后 3 分钟内涂身体乳效果最好。'
      ]
    },
    冬: {
      t: '冬季 · 保湿锁水攻坚',
      list: [
        '面霜换成滋润型，混油皮 T 区可少涂、两颊厚涂。',
        '洁面频率降低，晚上认真洗，早上清水或温和洁面。',
        '室内暖气干燥，加湿器保持湿度 45-60%。',
        '嘴唇和手部最容易开裂，唇膏和护手霜随身带。',
        '热水澡时间控制在 10 分钟内，太烫会带走皮脂膜。',
        '冬天照样要防晒，雪地反射紫外线更强。'
      ]
    }
  };

  const OILY_DRY = [
    '认清本质：混油皮 = T 区油 + 两颊干/正常，核心矛盾是"控油"和"保湿"要分开做。',
    '不要用强力清洁产品全脸，皂基洁面只会让 T 区越洗越油、两颊越洗越干。',
    '分区护理：T 区用控油精华/凝露，两颊用滋润乳霜，一瓶走天下不适合你。',
    '补水 ≠ 保湿。补水是给角质层加水，保湿是把水锁住，两步都要有。',
    '毛孔粗大的根源是出油和老废角质堆积，烟酰胺 + 水杨酸 + 认真防晒是长期方案。',
    '爆痘期停用所有厚重乳霜和彩妆，做减法比堆产品有用。',
    '睡眠、控糖、少奶茶对油脂分泌的影响，比换十瓶精华都大。',
    '任何新产品先耳后/下颌线试用 3 天，别在脸上做实验。'
  ];

  const seasonOf = (m) => (m >= 3 && m <= 5) ? '春' : (m >= 6 && m <= 8) ? '夏' : (m >= 9 && m <= 11) ? '秋' : '冬';
  const quarterOf = (d) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;

  let side = 'skin';
  let curQ = quarterOf(new Date());

  function render(root) {
    side = DB.get('beauty.side', 'skin');
    root.innerHTML = `
      <div class="slide-switch ${side === 'makeup' ? 'right' : ''}" id="bSw">
        <div class="thumb"></div>
        <div class="sw ${side === 'skin' ? 'on' : ''}" data-s="skin">🧴 护肤</div>
        <div class="sw ${side === 'makeup' ? 'on' : ''}" data-s="makeup">💄 化妆</div>
      </div>
      <div id="bPane"></div>`;
    $$('#bSw .sw').forEach(s => s.onclick = () => {
      side = s.dataset.s; DB.set('beauty.side', side);
      $('#bSw').classList.toggle('right', side === 'makeup');
      $$('#bSw .sw').forEach(x => x.classList.toggle('on', x === s));
      paint();
    });
    paint();
  }
  function paint() { side === 'skin' ? renderSkin($('#bPane')) : renderMakeup($('#bPane')); }

  /* ============ 护肤 ============ */
  function renderSkin(p) {
    const m = new Date().getMonth() + 1;
    const sea = seasonOf(m);
    const tip = SEASON_TIPS[sea];
    p.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#FFF7EC,#FFEFE0);border-color:var(--orange-l);">
        <div class="card-title"><span class="ci">${Icons.sheep()}</span>混油皮变好指南 <small>${m} 月 · ${tip.t}</small></div>
        <ul class="bullet" style="margin-bottom:8px;">${tip.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <div class="acc" data-a="core"><div class="acc-h">📌 混油皮长期心法（点开）<span class="ar">▾</span></div>
          <div class="acc-b">${OILY_DRY.map((x, i) => `${i + 1}. ${esc(x)}`).join('\n')}</div></div>
        <div class="chip-group" style="margin-top:8px;">
          ${Object.keys(SEASON_TIPS).map(s => `<button class="chip sm ${s === sea ? 'on' : ''}" data-sea="${s}">${s}季方案</button>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.pen()}</span>我的护肤顺序 <small>可自由编辑排序</small></div>
        <div id="stepList"></div>
        <div class="row" style="margin-top:8px;">
          <button class="btn ghost sm grow" id="stepAdd">${Icons.plus()}加一步</button>
          <button class="btn ghost sm grow" id="stepReset">恢复默认</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.lipstick()}</span>季度在用产品
          <small><button class="chip sm" id="qPrev">‹</button> <b id="qLbl" style="padding:0 5px;"></b> <button class="chip sm" id="qNext">›</button></small>
        </div>
        <button class="btn block sm" id="prodAdd" style="margin-bottom:10px;">${Icons.plus()}记录一个产品</button>
        <div id="prodList"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>护肤心得 & 体验收藏 <small id="diaryCnt"></small></div>
        <div class="row" style="margin-bottom:9px;">
          <button class="btn grow sm" id="expAdd">${Icons.plus()}写一条心得</button>
          <button class="btn ghost sm" id="expFav">⭐ 只看收藏</button>
        </div>
        <div id="expList"></div>
      </div>`;

    $$('[data-sea]').forEach(b => b.onclick = () => {
      const s = b.dataset.sea, t2 = SEASON_TIPS[s];
      modal.open(t2.t, `<ul class="bullet">${t2.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`);
    });
    $$('#bPane .acc').forEach(a => a.querySelector('.acc-h').onclick = () => a.classList.toggle('open'));

    drawSteps(); drawProds(); drawExp();
    $('#stepAdd').onclick = async () => {
      const v = await promptBox('新增护肤步骤', '', '比如：精华油');
      if (!v) return;
      const s = DB.get('beauty.steps', DEF_STEPS.slice()); s.push(v); DB.set('beauty.steps', s); drawSteps();
    };
    $('#stepReset').onclick = async () => {
      if (await confirmBox('恢复成默认护肤顺序？你自定义的步骤会被覆盖。')) { DB.set('beauty.steps', DEF_STEPS.slice()); drawSteps(); toast('已恢复'); }
    };
    $('#qPrev').onclick = () => { curQ = shiftQ(curQ, -1); drawProds(); };
    $('#qNext').onclick = () => { curQ = shiftQ(curQ, 1); drawProds(); };
    $('#prodAdd').onclick = () => editProd(null);
    $('#expAdd').onclick = () => editExp(null);
    $('#expFav').onclick = (e) => {
      const f = !DB.get('beauty.favOnly', false);
      DB.set('beauty.favOnly', f);
      e.target.textContent = f ? '⭐ 显示全部' : '⭐ 只看收藏';
      drawExp();
    };
    $('#expFav').textContent = DB.get('beauty.favOnly', false) ? '⭐ 显示全部' : '⭐ 只看收藏';
  }

  function shiftQ(q, d) {
    let [y, qq] = q.split('-Q').map(Number);
    qq += d;
    if (qq > 4) { qq = 1; y++; } if (qq < 1) { qq = 4; y--; }
    return `${y}-Q${qq}`;
  }

  function drawSteps() {
    const steps = DB.get('beauty.steps', DEF_STEPS.slice());
    $('#stepList').innerHTML = steps.map((s, i) => `
      <div class="plan-day" data-i="${i}" style="padding:7px 9px;">
        <div class="pd" style="width:28px;height:28px;flex:0 0 28px;border-radius:10px;font-size:12px;">${i + 1}</div>
        <div class="grow" style="font-size:13px;font-weight:700;line-height:28px;">${esc(s)}</div>
        <button class="chip sm" data-act="up">↑</button>
        <button class="chip sm" data-act="down">↓</button>
        <button class="chip sm" data-act="del">×</button>
      </div>`).join('');
    $('#stepList').onclick = (e) => {
      const act = e.target.dataset.act; if (!act) return;
      const i = Number(e.target.closest('[data-i]').dataset.i);
      const s = DB.get('beauty.steps', DEF_STEPS.slice());
      if (act === 'up' && i > 0) { [s[i - 1], s[i]] = [s[i], s[i - 1]]; }
      if (act === 'down' && i < s.length - 1) { [s[i + 1], s[i]] = [s[i], s[i + 1]]; }
      if (act === 'del') s.splice(i, 1);
      DB.set('beauty.steps', s); drawSteps();
    };
  }

  function drawProds() {
    $('#qLbl').textContent = curQ.replace('-Q', ' 年 Q') + ' 季度';
    const all = DB.get('beauty.products', {});
    const list = all[curQ] || [];
    const box = $('#prodList');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.sheep()}</div>这个季度还没记录～<br>防晒、精华、身体乳都可以记下来</div>`;
      return;
    }
    const byCat = {};
    list.forEach(p => { (byCat[p.cat] = byCat[p.cat] || []).push(p); });
    box.innerHTML = Object.keys(byCat).map(c => `
      <div style="margin-bottom:10px;">
        <div class="lbl" style="font-size:12px;">${esc(c)}</div>
        ${byCat[c].map(p => `
          <div class="rec-item" data-id="${p.id}">
            <div class="rec-ico">${p.img ? `<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '🧴'}</div>
            <div class="rec-main"><div class="t">${esc(p.name)}</div>
            <div class="s">${'⭐'.repeat(p.rate || 0)}${p.note ? ' · ' + esc(p.note) : ''}</div></div>
            <span class="chip sm">${p.repurchase ? '会回购' : '在用'}</span>
          </div>`).join('')}
      </div>`).join('');
    $$('#prodList .rec-item').forEach(it => it.onclick = () => editProd(it.dataset.id));
  }

  function editProd(id) {
    const all = DB.get('beauty.products', {});
    const list = all[curQ] || [];
    const p = id ? list.find(x => x.id === id) : { id: uid(), cat: '防晒', name: '', note: '', rate: 4, img: '', repurchase: false };
    modal.open(id ? '编辑产品' : '记录产品', `
      <span class="lbl">类别</span>
      <div class="chip-group" id="pcGrp" style="max-height:96px;overflow-y:auto;">
        ${PROD_CATS.map(c => `<button class="chip sm ${p.cat === c ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}
      </div>
      <span class="lbl" style="margin-top:9px;">产品名</span>
      <input class="field" id="pName" value="${esc(p.name)}" placeholder="品牌 + 名称">
      <div class="row" style="margin-top:9px;align-items:center;">
        <div class="grow"><span class="lbl">评分</span>
          <div class="chip-group" id="rateGrp">${[1, 2, 3, 4, 5].map(n => `<button class="chip sm ${p.rate === n ? 'on' : ''}" data-r="${n}">${n}⭐</button>`).join('')}</div>
        </div>
      </div>
      <span class="lbl" style="margin-top:9px;">使用感受</span>
      <textarea class="field" id="pNote" style="min-height:72px;">${esc(p.note || '')}</textarea>
      <div class="row" style="margin-top:9px;">
        <button class="chip ${p.repurchase ? 'on' : ''}" id="pRe">🔁 会回购</button>
        <button class="btn ghost sm" id="pImg">🖼 加图</button>
        <span id="pImgBox"></span>
      </div>
      <div class="row" style="margin-top:12px;">
        ${id ? '<button class="btn danger grow" id="pDel">删除</button>' : ''}
        <button class="btn grow" id="pSave">保存</button>
      </div>`, (b) => {
      let cat = p.cat, rate = p.rate || 0, re = !!p.repurchase, img = p.img || '';
      const drawImg = () => { $('#pImgBox', b).innerHTML = img ? `<img src="${img}" style="width:44px;height:44px;object-fit:cover;border-radius:10px;">` : ''; };
      drawImg();
      $$('#pcGrp .chip', b).forEach(c => c.onclick = () => { cat = c.dataset.c; $$('#pcGrp .chip', b).forEach(x => x.classList.toggle('on', x === c)); });
      $$('#rateGrp .chip', b).forEach(c => c.onclick = () => { rate = Number(c.dataset.r); $$('#rateGrp .chip', b).forEach(x => x.classList.toggle('on', x === c)); });
      $('#pRe', b).onclick = () => { re = !re; $('#pRe', b).classList.toggle('on', re); };
      $('#pImg', b).onclick = async () => { const i2 = await pickImage(400); if (i2) { img = i2; drawImg(); } };
      $('#pSave', b).onclick = () => {
        const n = $('#pName', b).value.trim();
        if (!n) { toast('产品名写一下～'); return; }
        Object.assign(p, { cat, name: n, note: $('#pNote', b).value, rate, repurchase: re, img });
        if (!id) list.push(p);
        all[curQ] = list; DB.set('beauty.products', all);
        modal.close(); drawProds(); toast('记好啦 🧴');
      };
      if (id) $('#pDel', b).onclick = async () => {
        if (await confirmBox('删除这个产品记录？')) {
          all[curQ] = list.filter(x => x.id !== id); DB.set('beauty.products', all);
          modal.close(); drawProds(); toast('已删除');
        }
      };
    });
  }

  function drawExp() {
    let list = DB.get('beauty.exp', []).slice().sort((a, b) => b.ts - a.ts);
    if (DB.get('beauty.favOnly', false)) list = list.filter(x => x.fav);
    $('#diaryCnt').textContent = list.length ? `${list.length} 条` : '';
    const box = $('#expList');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.koala()}</div>还没有心得～<br>记录踩雷和真爱，未来的你会感谢现在的自己</div>`;
      return;
    }
    box.innerHTML = list.map(e => `
      <div class="card tight" data-id="${e.id}" style="margin-bottom:8px;">
        <div class="row" style="align-items:flex-start;">
          <div class="grow">
            <b style="font-size:13px;">${esc(e.title || '护肤心得')}</b>
            <div class="hint" style="margin-top:2px;">${new Date(e.ts).toLocaleDateString('zh-CN')}</div>
          </div>
          <span class="chip sm ${e.fav ? 'on' : ''}" data-act="fav">⭐</span>
          <span class="chip sm" data-act="del">×</span>
        </div>
        ${e.img ? `<img src="${e.img}" style="width:100%;border-radius:11px;margin-top:7px;">` : ''}
        <div style="font-size:12.6px;line-height:1.75;margin-top:6px;white-space:pre-wrap;">${esc(e.text || '')}</div>
      </div>`).join('');
    box.onclick = (e) => {
      const c = e.target.closest('[data-id]'); if (!c) return;
      const arr = DB.get('beauty.exp', []);
      const i = arr.findIndex(x => x.id === c.dataset.id); if (i < 0) return;
      if (e.target.dataset.act === 'fav') { arr[i].fav = !arr[i].fav; DB.set('beauty.exp', arr); drawExp(); }
      else if (e.target.dataset.act === 'del') { confirmBox('删除这条心得？').then(ok => { if (ok) { arr.splice(i, 1); DB.set('beauty.exp', arr); drawExp(); toast('已删除'); } }); }
      else editExp(c.dataset.id);
    };
  }

  function editExp(id) {
    const arr = DB.get('beauty.exp', []);
    const e = id ? arr.find(x => x.id === id) : { id: uid(), title: '', text: '', img: '', fav: false, ts: Date.now() };
    modal.open(id ? '编辑心得' : '写一条护肤心得', `
      <input class="field" id="eTitle" value="${esc(e.title)}" placeholder="标题，比如：夏天控油组合">
      <textarea class="field" id="eText" style="min-height:120px;margin-top:9px;" placeholder="用了什么、皮肤反应、值不值得回购…">${esc(e.text)}</textarea>
      <div class="row" style="margin-top:9px;">
        <button class="btn ghost sm" id="eImg">🖼 加张图</button>
        <span id="eImgBox"></span>
      </div>
      <button class="btn block" id="eSave" style="margin-top:12px;">保存</button>`, (b) => {
      let img = e.img || '';
      const dr = () => { $('#eImgBox', b).innerHTML = img ? `<img src="${img}" style="width:48px;height:48px;object-fit:cover;border-radius:10px;">` : ''; };
      dr();
      $('#eImg', b).onclick = async () => { const i2 = await pickImage(800); if (i2) { img = i2; dr(); } };
      $('#eSave', b).onclick = () => {
        e.title = $('#eTitle', b).value.trim();
        e.text = $('#eText', b).value;
        e.img = img;
        if (!e.title && !e.text) { toast('写点内容呀'); return; }
        if (!id) arr.push(e);
        DB.set('beauty.exp', arr); modal.close(); drawExp(); toast('保存好啦');
      };
    });
  }

  /* ============ 化妆 ============ */
  function renderMakeup(p) {
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.lipstick()}</span>教程链接收藏 <small>长按卡片直接打开</small></div>
        <div class="row" style="margin-bottom:10px;">
          <button class="btn grow" id="linkAdd">${Icons.plus()}添加链接</button>
          <button class="btn ghost" id="linkPaste">📋 粘贴</button>
        </div>
        <div id="linkList"></div>
        <div class="hint" style="margin-top:6px;">支持小红书 / 抖音 / B站 等任意链接。长按 0.6 秒即可跳转打开，轻点是编辑。</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.photo()}</span>喜欢的妆容风格 <small>便签 + 图片</small></div>
        <button class="btn block sm" id="mnAdd" style="margin-bottom:10px;">${Icons.plus()}贴一张风格便签</button>
        <div class="grid2" id="mnGrid"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>化妆小抄</div>
        <div class="acc"><div class="acc-h">🎨 底妆不卡粉<span class="ar">▾</span></div>
          <div class="acc-b">1. 妆前保湿要吸收完全，急了就是搓泥。\n2. 混油皮 T 区用控油妆前，两颊用保湿妆前，分区处理。\n3. 粉底少量多次，海绵微湿按压比刷子更服帖。\n4. 定妆只在 T 区和易脱妆处，全脸厚定妆容易斑驳。</div></div>
        <div class="acc"><div class="acc-h">👁 眼妆放大眼型<span class="ar">▾</span></div>
          <div class="acc-b">1. 眼影三色法：浅色打底 → 中间色晕染双眼皮褶 → 深色压眼尾。\n2. 内眼角提亮，眼尾自然拉长 2-3mm。\n3. 睫毛夹分三段夹，睫毛膏 Z 字形刷。\n4. 下睫毛后半段带一点点，眼睛更圆更亮。</div></div>
        <div class="acc"><div class="acc-h">💋 唇妆显气色<span class="ar">▾</span></div>
          <div class="acc-b">1. 先去角质 + 唇膏打底。\n2. 黄皮避雷正红偏蓝调，选番茄红、豆沙、焦糖。\n3. 唇中点涂晕开 = 日常；描边填满 = 正式。\n4. 唇色和腮红同色系，整体更协调。</div></div>
        <div class="acc"><div class="acc-h">✨ 卸妆要彻底<span class="ar">▾</span></div>
          <div class="acc-b">1. 眼唇专用卸妆湿敷 20 秒再擦。\n2. 全脸卸妆油乳化到位（加水打圈变白）再冲。\n3. 卸妆后温和洁面二次清洁，但别过度搓揉。\n4. 卸完立刻补水，别让皮肤晾着。</div></div>
      </div>`;

    drawLinks(); drawMakeupNotes();
    $('#linkAdd').onclick = () => editLink(null);
    $('#linkPaste').onclick = async () => {
      try {
        const t = await navigator.clipboard.readText();
        if (t && /https?:\/\//.test(t)) editLink(null, t.match(/https?:\/\/[^\s]+/)[0]);
        else toast('剪贴板里没有链接');
      } catch (e) { toast('读取剪贴板失败，手动粘贴吧'); editLink(null); }
    };
    $('#mnAdd').onclick = () => editMakeupNote(null);
    $$('#bPane .acc').forEach(a => a.querySelector('.acc-h').onclick = () => a.classList.toggle('open'));
  }

  function platOf(url) {
    if (/xiaohongshu|xhslink/.test(url)) return ['小红书', 'p-xhs', '书'];
    if (/douyin|iesdouyin/.test(url)) return ['抖音', 'p-dy', '抖'];
    if (/bilibili|b23\.tv/.test(url)) return ['B站', 'p-other', 'B'];
    if (/weibo/.test(url)) return ['微博', 'p-other', '微'];
    return ['链接', 'p-other', '链'];
  }

  function drawLinks() {
    const list = DB.get('beauty.links', []).slice().sort((a, b) => b.ts - a.ts);
    const box = $('#linkList');
    if (!list.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.lipstick()}</div>还没有收藏链接～<br>看到好教程就存下来吧</div>`;
      return;
    }
    box.innerHTML = list.map(l => {
      const [pn, pc, pt] = platOf(l.url || '');
      return `<div class="link-item" data-id="${l.id}">
        <div class="link-plat ${pc}">${pt}</div>
        <div class="rec-main"><div class="t">${esc(l.title || pn + '教程')}</div>
        <div class="s">${esc((l.note || l.url || '').slice(0, 40))}</div></div>
        <span class="chip sm" data-act="open">打开</span>
      </div>`;
    }).join('');
    $$('#linkList .link-item').forEach(it => {
      const id = it.dataset.id;
      const open = () => {
        const l = DB.get('beauty.links', []).find(x => x.id === id);
        if (!l || !l.url) { toast('没有有效链接'); return; }
        window.open(l.url, '_blank');
      };
      longPress(it, open, 600);
      it.onclick = (e) => { if (e.target.dataset.act === 'open') open(); else editLink(id); };
    });
  }

  function editLink(id, preset) {
    const all = DB.get('beauty.links', []);
    const l = id ? all.find(x => x.id === id) : { id: uid(), title: '', url: preset || '', note: '', ts: Date.now() };
    modal.open(id ? '编辑链接' : '添加链接', `
      <span class="lbl">链接地址</span>
      <input class="field" id="lUrl" value="${esc(l.url)}" placeholder="粘贴小红书 / 抖音链接">
      <span class="lbl" style="margin-top:9px;">标题</span>
      <input class="field" id="lTitle" value="${esc(l.title)}" placeholder="比如：伪素颜通勤妆教程">
      <span class="lbl" style="margin-top:9px;">备注</span>
      <textarea class="field" id="lNote" style="min-height:64px;">${esc(l.note || '')}</textarea>
      <div class="row" style="margin-top:12px;">
        ${id ? '<button class="btn danger grow" id="lDel">删除</button>' : ''}
        <button class="btn grow" id="lSave">保存</button>
      </div>`, (b) => {
      $('#lSave', b).onclick = () => {
        const u = $('#lUrl', b).value.trim();
        const m = u.match(/https?:\/\/[^\s]+/);
        l.url = m ? m[0] : u;
        l.title = $('#lTitle', b).value.trim();
        l.note = $('#lNote', b).value.trim();
        if (!l.url && !l.title) { toast('至少填个链接或标题'); return; }
        if (!id) all.push(l);
        DB.set('beauty.links', all); modal.close(); drawLinks(); toast('收藏好啦 💄');
      };
      if (id) $('#lDel', b).onclick = async () => {
        if (await confirmBox('删除这条链接？')) { DB.set('beauty.links', all.filter(x => x.id !== id)); modal.close(); drawLinks(); toast('已删除'); }
      };
    });
  }

  function drawMakeupNotes() {
    const list = DB.get('beauty.mnotes', []).slice().sort((a, b) => b.ts - a.ts);
    const g = $('#mnGrid');
    if (!list.length) {
      g.innerHTML = `<div class="empty" style="grid-column:1/-1;"><div class="e-ico">${Icons.chick()}</div>还没有风格便签～</div>`;
      return;
    }
    g.innerHTML = list.map(n => `
      <div class="pcard" data-id="${n.id}">
        ${n.img ? `<img class="pimg" src="${n.img}">` : `<div class="pimg ph">${Icons.lipstick()}</div>`}
        <div class="pb"><div class="pt">${esc(n.title || '风格便签')}</div>
        <div class="ps">${esc((n.text || '').slice(0, 36))}</div></div>
      </div>`).join('');
    $$('#mnGrid .pcard').forEach(c => c.onclick = () => editMakeupNote(c.dataset.id));
  }

  function editMakeupNote(id) {
    const all = DB.get('beauty.mnotes', []);
    const n = id ? all.find(x => x.id === id) : { id: uid(), title: '', text: '', img: '', ts: Date.now() };
    modal.open(id ? '编辑便签' : '风格便签', `
      <input class="field" id="mTitle" value="${esc(n.title)}" placeholder="风格名，比如：清冷氛围感">
      <textarea class="field" id="mText" style="min-height:110px;margin-top:9px;" placeholder="妆容要点、用到的产品…">${esc(n.text)}</textarea>
      <div class="row" style="margin-top:9px;">
        <button class="btn ghost sm" id="mImg">🖼 图片</button><span id="mImgBox"></span>
      </div>
      <div class="row" style="margin-top:12px;">
        ${id ? '<button class="btn danger grow" id="mDel">删除</button>' : ''}
        <button class="btn grow" id="mSave">保存</button>
      </div>`, (b) => {
      let img = n.img || '';
      const dr = () => { $('#mImgBox', b).innerHTML = img ? `<img src="${img}" style="width:52px;height:52px;object-fit:cover;border-radius:10px;">` : ''; };
      dr();
      $('#mImg', b).onclick = async () => { const i2 = await pickImage(900); if (i2) { img = i2; dr(); } };
      $('#mSave', b).onclick = () => {
        n.title = $('#mTitle', b).value.trim(); n.text = $('#mText', b).value; n.img = img;
        if (!n.title && !n.text && !img) { toast('写点什么呀'); return; }
        if (!id) all.push(n);
        DB.set('beauty.mnotes', all); modal.close(); drawMakeupNotes(); toast('贴好啦');
      };
      if (id) $('#mDel', b).onclick = async () => {
        if (await confirmBox('删除这张便签？')) { DB.set('beauty.mnotes', all.filter(x => x.id !== id)); modal.close(); drawMakeupNotes(); toast('已删除'); }
      };
    });
  }

  window.Modules = window.Modules || {};
  window.Modules.beauty = { id: 'beauty', name: '化妆护肤', desc: '羊咩咩的变美笔记', icon: 'sheep', render };
})();
