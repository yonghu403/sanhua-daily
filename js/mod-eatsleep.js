/* ===== 模块 3：能吃能睡 ===== */
(function () {
  const { $, $$, esc, uid, ymd, today, parseYMD, WD, monthMatrix, niceDate, toast, modal, confirmBox, weekOf } = UI;

  /* 食物库：[名称, 图标, 每100g/ml 千卡, 分类] */
  const FOODS = [
    ['米饭', '🍚', 116, '谷薯'], ['馒头', '🍞', 223, '谷薯'], ['面条', '🍜', 110, '谷薯'], ['粥', '🥣', 46, '谷薯'],
    ['玉米', '🌽', 112, '谷薯'], ['红薯', '🍠', 86, '谷薯'], ['土豆', '🥔', 77, '谷薯'], ['燕麦', '🥣', 367, '谷薯'],
    ['全麦面包', '🍞', 246, '谷薯'], ['饺子', '🥟', 240, '谷薯'], ['包子', '🥟', 227, '谷薯'], ['米粉', '🍜', 109, '谷薯'],
    ['青菜', '🥬', 20, '蔬菜'], ['西兰花', '🥦', 34, '蔬菜'], ['番茄', '🍅', 18, '蔬菜'], ['黄瓜', '🥒', 15, '蔬菜'],
    ['胡萝卜', '🥕', 41, '蔬菜'], ['菠菜', '🥬', 23, '蔬菜'], ['蘑菇', '🍄', 22, '蔬菜'], ['茄子', '🍆', 25, '蔬菜'],
    ['白菜', '🥬', 17, '蔬菜'], ['豆角', '🫛', 31, '蔬菜'], ['海带', '🌿', 13, '蔬菜'], ['生菜', '🥬', 15, '蔬菜'],
    ['苹果', '🍎', 52, '水果'], ['香蕉', '🍌', 89, '水果'], ['橙子', '🍊', 47, '水果'], ['葡萄', '🍇', 69, '水果'],
    ['西瓜', '🍉', 30, '水果'], ['草莓', '🍓', 32, '水果'], ['蓝莓', '🫐', 57, '水果'], ['猕猴桃', '🥝', 61, '水果'],
    ['梨', '🍐', 44, '水果'], ['桃子', '🍑', 39, '水果'], ['芒果', '🥭', 60, '水果'], ['菠萝', '🍍', 50, '水果'],
    ['鸡胸肉', '🍗', 133, '肉蛋'], ['牛肉', '🥩', 250, '肉蛋'], ['猪肉', '🥓', 395, '肉蛋'], ['鸡蛋', '🥚', 144, '肉蛋'],
    ['鱼', '🐟', 104, '肉蛋'], ['虾', '🦐', 93, '肉蛋'], ['鸡腿', '🍗', 181, '肉蛋'], ['排骨', '🍖', 278, '肉蛋'],
    ['三文鱼', '🍣', 208, '肉蛋'], ['鸭肉', '🦆', 240, '肉蛋'],
    ['牛奶', '🥛', 54, '奶豆'], ['酸奶', '🍦', 72, '奶豆'], ['豆浆', '🥛', 31, '奶豆'], ['豆腐', '🧊', 82, '奶豆'],
    ['奶酪', '🧀', 328, '奶豆'], ['坚果', '🥜', 580, '奶豆'], ['核桃', '🌰', 646, '奶豆'], ['杏仁', '🥜', 578, '奶豆'],
    ['咖啡', '☕', 2, '饮品'], ['奶茶', '🧋', 75, '饮品'], ['可乐', '🥤', 43, '饮品'], ['果汁', '🧃', 45, '饮品'],
    ['白开水', '💧', 0, '饮品'], ['茶', '🍵', 1, '饮品'], ['气泡水', '🫧', 0, '饮品'], ['豆奶', '🥛', 40, '饮品'],
    ['薯片', '🍟', 548, '零食'], ['巧克力', '🍫', 546, '零食'], ['蛋糕', '🍰', 347, '零食'], ['冰淇淋', '🍨', 207, '零食'],
    ['饼干', '🍪', 435, '零食'], ['泡面', '🍜', 436, '零食'], ['炸鸡', '🍗', 279, '零食'], ['披萨', '🍕', 266, '零食'],
    ['汉堡', '🍔', 295, '零食'], ['火锅', '🍲', 200, '零食'], ['烧烤', '🍢', 280, '零食'], ['麻辣烫', '🍲', 150, '零食']
  ];
  const CATS = ['谷薯', '蔬菜', '水果', '肉蛋', '奶豆', '饮品', '零食'];
  const CAT_COLOR = { 谷薯: '#F2C14E', 蔬菜: '#8FBF7A', 水果: '#E6866F', 肉蛋: '#D9917A', 奶豆: '#A8C6DE', 饮品: '#9DC5C9', 零食: '#C0A8D8' };
  const GUIDE = [
    ['谷薯', '谷薯类', '200-300g（其中全谷杂豆 50-150g）+ 薯类 50-100g'],
    ['蔬菜', '蔬菜', '300-500g，深色蔬菜要占一半以上'],
    ['水果', '水果', '200-350g，果汁不能代替鲜果'],
    ['肉蛋', '动物性食物', '禽畜肉 40-75g + 水产 40-75g + 蛋 40-50g'],
    ['奶豆', '奶豆坚果', '奶及奶制品 300-500g + 大豆坚果 25-35g'],
    ['饮品', '饮水', '1500-1700ml，白开水或淡茶水优先']
  ];
  /* 分类三大营养素估算（每100g 的 蛋白质/碳水/脂肪 g） */
  const MACRO = {
    谷薯: [8, 23, 1], 蔬菜: [2, 4, 0.3], 水果: [1, 12, 0.2],
    肉蛋: [18, 1, 12], 奶豆: [8, 5, 6], 饮品: [0.5, 4, 0.5], 零食: [5, 55, 25]
  };
  /* 混合菜别名 → 主食材 */
  const DISH_ALIAS = {
    '宫保鸡丁': '鸡胸肉', '红烧肉': '猪肉', '糖醋里脊': '猪肉', '鱼香肉丝': '猪肉',
    '可乐鸡翅': '鸡腿', '土豆烧牛肉': '牛肉', '番茄牛腩': '牛肉', '青椒肉丝': '猪肉',
    '土豆炖牛肉': '牛肉', '香菇滑鸡': '鸡腿', '清蒸鱼': '鱼', '白灼虾': '虾'
  };
  const FOOD_MAP = {}; FOODS.forEach(f => FOOD_MAP[f[0]] = f);

  let side = 'eat';
  let eatDate = today();
  let calY = new Date().getFullYear(), calM = new Date().getMonth();
  let selCat = '谷薯';
  let guideMode = DB.get('es.guideMode', 'cn');   // 'cn'=中国居民膳食指南  'fit'=女性增肌健身指南
  let foodUnit = 'g';        // 'g'=克/毫升  'fist'=一拳
  let aiMode = false;        // 食物 AI 识别模式
  let sumRange = 'day';      // 'day' | 'week' | 'month'
  const FIST_G = 150;        // 一拳约等于 150g 固体食物

  /* 爱吃爱喝分类 */
  const FAV_CATS = [
    { id: 'dish', name: '菜系', ico: '🍲' },
    { id: 'drink', name: '饮料', ico: '🧋' },
    { id: 'snack', name: '零食', ico: '🍿' },
    { id: 'fruit', name: '水果', ico: '🍑' },
    { id: 'sweet', name: '甜点', ico: '🍰' },
    { id: 'other', name: '其他', ico: '✨' }
  ];
  const FAV_CAT_MAP = {};
  FAV_CATS.forEach(c => FAV_CAT_MAP[c.id] = c);

  const getEat = () => DB.get('eat', {});
  const setEat = (v) => DB.set('eat', v);
  const getSleep = () => DB.get('sleep', {});
  const setSleep = (v) => DB.set('sleep', v);
  const getFav = () => DB.get('eat.fav', []);
  const setFav = (v) => DB.set('eat.fav', v);
  const getWeights = () => DB.get('es.weights', []);
  const setWeights = (v) => DB.set('es.weights', v);
  const getMetab = () => DB.get('es.metab', {});
  const setMetab = (v) => DB.set('es.metab', v);

  function render(root) {
    side = DB.get('es-side', 'eat');
    root.innerHTML = `
      <div class="slide-switch" id="esSw" style="padding:5px 5px;">
        <div class="thumb" style="width:calc(33.33% - 4px);left:5px;"></div>
        <div class="sw ${side === 'eat' ? 'on' : ''}" data-s="eat">${Icons.bowl()}能吃</div>
        <div class="sw ${side === 'sleep' ? 'on' : ''}" data-s="sleep">${Icons.moon()}能睡</div>
        <div class="sw ${side === 'fav' ? 'on' : ''}" data-s="fav">${Icons.star()}爱吃爱喝</div>
      </div>
      <div id="esPane"></div>`;
    $$('#esSw .sw').forEach(s => s.onclick = () => {
      side = s.dataset.s; DB.set('es-side', side);
      const thumb = $('#esSw .thumb');
      const idx = ['eat', 'sleep', 'fav'].indexOf(side);
      thumb.style.transform = `translateX(${idx * 100}%)`;
      $$('#esSw .sw').forEach(x => x.classList.toggle('on', x === s));
      paint();
    });
    /* 初始化 thumb 位置 */
    const initIdx = ['eat', 'sleep', 'fav'].indexOf(side);
    $('#esSw .thumb').style.transform = `translateX(${initIdx * 100}%)`;
    paint();
  }
  function paint() { side === 'eat' ? renderEat($('#esPane')) : side === 'sleep' ? renderSleep($('#esPane')) : renderFav($('#esPane')); }

  /* ============ 能吃 ============ */
  function renderEat(p) {
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.pig()}</span>今日饮食推荐</div>
        <div class="chip-group" id="guideModeGrp" style="margin-bottom:9px;">
          <button class="chip ${guideMode === 'cn' ? 'on' : ''}" data-m="cn">中国居民膳食指南</button>
          <button class="chip ${guideMode === 'fit' ? 'on' : ''}" data-m="fit">女性增肌健身指南</button>
        </div>
        <div id="guideBody"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.bowl()}</span>今天吃了啥 <small>${eatDate === today() ? '今天' : niceDate(eatDate)} · 一日一记</small></div>
        <div class="row" style="margin-bottom:8px;align-items:center;gap:6px;">
          <button class="chip sm ${aiMode ? 'on' : ''}" id="aiToggle">🤖 AI 识别菜名</button>
          <button class="chip sm ${foodUnit !== 'g' ? 'on' : ''}" id="unitToggle">${foodUnit === 'g' ? '单位：g/ml' : '单位：一拳'}</button>
        </div>
        <div class="chip-group" id="catGrp" style="margin-bottom:8px;">
          ${CATS.map(c => `<button class="chip ${selCat === c ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}
        </div>
        <div class="chip-group" id="foodQuick" style="max-height:118px;overflow-y:auto;margin-bottom:9px;"></div>
        <div class="row">
          <input class="field grow" id="fName" placeholder="${aiMode ? '描述菜名，如「土豆焖鸭」' : '食物/饮品名称'}" list="foodList" maxlength="30">
          <input class="field" id="fQty" type="number" inputmode="decimal" placeholder="${foodUnit === 'g' ? '份量g/ml' : '几拳(默认1)'}" style="width:104px;">
        </div>
        <datalist id="foodList">${FOODS.map(f => `<option value="${f[0]}"></option>`).join('')}</datalist>
        <div class="row" style="margin-top:8px;">
          <input class="field grow" id="fKcal" type="number" inputmode="decimal" placeholder="热量 kcal（自动估算，可改）">
          <button class="btn" id="fAdd">${aiMode ? '🤖 识别添加' : '＋ 加'}</button>
        </div>
        <div class="hint" style="margin-top:6px;" id="aiHint">${aiMode ? 'AI 会把混合菜拆成每种食材分别算热量，分量可填「一拳」按目测估算。' : '输入名称 + 份量后会自动算卡路里，找不到的食物可以手填热量～'}</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>今日汇总 <small id="kcalSum"></small></div>
        <div class="chip-group" id="sumRangeGrp" style="margin-bottom:8px;">
          <button class="chip sm ${sumRange === 'day' ? 'on' : ''}" data-r="day">今日</button>
          <button class="chip sm ${sumRange === 'week' ? 'on' : ''}" data-r="week">本周</button>
          <button class="chip sm ${sumRange === 'month' ? 'on' : ''}" data-r="month">本月</button>
        </div>
        <div id="catBar"></div>
        <div id="eatList" style="margin-top:9px;"></div>
        <div id="sumChart" style="margin-top:10px;"></div>
        <div class="row" style="margin-top:10px;">
          <button class="btn ghost grow" id="eatHistory">查看历史记录</button>
        </div>
      </div>`;

    $$('#guideModeGrp .chip').forEach(c => c.onclick = () => {
      guideMode = c.dataset.m; DB.set('es.guideMode', guideMode);
      $$('#guideModeGrp .chip').forEach(x => x.classList.toggle('on', x === c));
      drawGuideBody();
    });
    drawGuideBody();
    drawQuick(); drawEatList(); drawSummary('day');

    $$('#catGrp .chip').forEach(c => c.onclick = () => {
      selCat = c.dataset.c;
      $$('#catGrp .chip').forEach(x => x.classList.toggle('on', x === c));
      drawQuick();
    });
    $('#aiToggle').onclick = () => {
      aiMode = !aiMode;
      $('#aiToggle').classList.toggle('on', aiMode);
      $('#fName').placeholder = aiMode ? '描述菜名，如「土豆焖鸭」' : '食物/饮品名称';
      $('#aiHint').textContent = aiMode ? 'AI 会把混合菜拆成每种食材分别算热量，分量可填「一拳」按目测估算。' : '输入名称 + 份量后会自动算卡路里，找不到的食物可以手填热量～';
      $('#fAdd').innerHTML = aiMode ? '🤖 识别添加' : '＋ 加';
    };
    $('#unitToggle').onclick = () => {
      foodUnit = foodUnit === 'g' ? 'fist' : 'g';
      $('#unitToggle').classList.toggle('on', foodUnit !== 'g');
      $('#unitToggle').textContent = foodUnit === 'g' ? '单位：g/ml' : '单位：一拳';
      $('#fQty').placeholder = foodUnit === 'g' ? '份量g/ml' : '几拳(默认1)';
    };
    $('#fName').oninput = autoKcal;
    $('#fQty').oninput = autoKcal;
    $('#fAdd').onclick = addFood;
    $('#eatHistory').onclick = eatHistory;
    $$('#sumRangeGrp .chip').forEach(c => c.onclick = () => {
      $$('#sumRangeGrp .chip').forEach(x => x.classList.toggle('on', x === c));
      drawSummary(c.dataset.r);
    });
  }

  /* ---- 饮食推荐：根据模式分发 ---- */
  function drawGuideBody() {
    const el = $('#guideBody');
    if (guideMode === 'cn') drawCNGuide(el);
    else drawFitGuide(el);
  }

  function drawCNGuide(el) {
    el.innerHTML = `
      <div class="hint" style="margin-bottom:9px;">平衡膳食三原则：食物多样、谷类为主、餐餐有蔬菜天天有水果。每天最好吃够 12 种食物，每周 25 种以上 🐷</div>
      <div id="guideList"></div>`;
    const day = getEat()[eatDate] || { items: [] };
    const sum = {};
    day.items.forEach(i => { sum[i.cat] = (sum[i.cat] || 0) + Number(i.qty || 0); });
    const TARGET = { 谷薯: 350, 蔬菜: 400, 水果: 275, 肉蛋: 175, 奶豆: 350, 饮品: 1600 };
    $('#guideList').innerHTML = GUIDE.map(([cat, name, txt]) => {
      const got = sum[cat] || 0, tgt = TARGET[cat];
      const pct = Math.min(100, Math.round(got / tgt * 100));
      return `<div style="margin-bottom:9px;">
        <div class="row" style="justify-content:space-between;">
          <b style="font-size:12.5px;">${name}</b>
          <span class="hint">${got}/${tgt}${cat === '饮品' ? 'ml' : 'g'} · ${pct}%</span>
        </div>
        <div class="hint" style="margin:2px 0 4px;">${txt}</div>
        <div class="nutri-bar"><i style="width:${pct}%;background:${CAT_COLOR[cat]}"></i></div>
      </div>`;
    }).join('');
  }

  function drawFitGuide(el) {
    const weights = getWeights();
    const last = weights.length ? weights[weights.length - 1] : null;
    const w = last ? last.kg : 0;
    const todayW = (weights.find(x => x.date === eatDate) || {}).kg || 0;

    const pMin = w * 1.6, pMax = w * 2.2, cMin = w * 3, cMax = w * 5, fMin = w * 0.8, fMax = w * 1;

    const day = getEat()[eatDate] || { items: [] };
    let curP = 0, curC = 0, curF = 0;
    day.items.forEach(i => {
      const m = MACRO[i.cat] || [0, 0, 0];
      const q = Number(i.qty || 0) / 100;
      curP += m[0] * q; curC += m[1] * q; curF += m[2] * q;
    });

    const SRC = {
      p: '鸡胸肉、牛肉、鱼虾、鸡蛋、豆腐、希腊酸奶、乳清蛋白',
      c: '燕麦、糙米、红薯、全麦面包、玉米、荞麦面',
      f: '牛油果、坚果、橄榄油、三文鱼、亚麻籽、奇亚籽'
    };
    const bar = (label, cur, min, max, color) => {
      const pct = Math.min(100, Math.round(cur / max * 100));
      return `<div style="margin-bottom:9px;">
        <div class="row" style="justify-content:space-between;">
          <b style="font-size:12.5px;">${label}</b>
          <span class="hint">${cur.toFixed(0)} / ${min.toFixed(0)}-${max.toFixed(0)} g</span>
        </div>
        <div class="nutri-bar"><i style="width:${pct}%;background:${color}"></i></div>
      </div>`;
    };

    const metab = getMetab()[eatDate] || {};
    const bmr0 = metab.bmr != null ? metab.bmr : '';
    const ex0 = metab.ex != null ? metab.ex : '';

    el.innerHTML = `
      <div class="hint" style="margin-bottom:8px;">根据「女性增肌健身」目标：按体重计算每日三大营养素摄入区间 💪</div>
      <div class="row" style="gap:6px;margin-bottom:10px;align-items:flex-end;">
        <div class="grow">
          <span class="lbl">记录体重 (kg)</span>
          <input class="field" id="wtInp" type="number" inputmode="decimal" placeholder="如 55" value="${todayW || ''}" style="margin-top:4px;">
        </div>
        <button class="btn" id="wtBtn">记录体重</button>
      </div>
      ${last ? `<div class="hint" style="margin-bottom:8px;">基准体重：<b>${w} kg</b>（${last.date}）· 目标按此计算</div>` : `<div class="hint" style="margin-bottom:8px;">先记录体重，AI 会自动算出你的营养目标 🎯</div>`}
      ${w ? `
        <div style="background:var(--orange-xl);border:1.5px solid var(--orange-l);border-radius:12px;padding:10px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:700;margin-bottom:6px;">🎯 今日营养目标（基于 ${w} kg）</div>
          <div class="row" style="gap:8px;flex-wrap:wrap;">
            <span class="chip sm" style="background:#FDE7E0;border-color:#E6866F;color:#B5482E;">蛋白 ${pMin.toFixed(0)}-${pMax.toFixed(0)}g</span>
            <span class="chip sm" style="background:#E9F2DD;border-color:#9CC37E;color:#4E7A2E;">碳水 ${cMin.toFixed(0)}-${cMax.toFixed(0)}g</span>
            <span class="chip sm" style="background:#E6EFF6;border-color:#9DC0DE;color:#3E6E92;">脂肪 ${fMin.toFixed(0)}-${fMax.toFixed(0)}g</span>
          </div>
        </div>
        ${bar('🥩 蛋白质', curP, pMin, pMax, '#E6866F')}
        ${bar('🍚 碳水', curC, cMin, cMax, '#8FBF7A')}
        ${bar('🥑 健康脂肪', curF, fMin, fMax, '#8FB8D6')}
        <div style="margin-top:4px;">
          <div style="font-size:12px;font-weight:700;margin:6px 0 3px;">优质来源</div>
          <div class="hint">蛋白质：${SRC.p}</div>
          <div class="hint">碳水：${SRC.c}</div>
          <div class="hint">脂肪：${SRC.f}</div>
        </div>
      ` : ''}

      <div style="margin-top:12px;border-top:1.6px dashed var(--line);padding-top:10px;">
        <div style="font-size:12.5px;font-weight:700;margin-bottom:7px;">🔥 今日消耗 & 热量平衡（${eatDate === today() ? '今天' : eatDate}）</div>
        <div class="row" style="gap:6px;margin-bottom:8px;align-items:flex-end;">
          <div class="grow">
            <span class="lbl">① 基础代谢 BMR (kcal)</span>
            <div class="row" style="margin-top:4px;gap:5px;">
              <input class="field" id="bmrInp" type="number" inputmode="decimal" placeholder="如 1300" value="${bmr0}" style="flex:1;min-width:0;">
              <button class="chip sm" id="bmrEst" ${w ? '' : 'disabled style="opacity:.5;"'}>🧮 估算</button>
            </div>
          </div>
        </div>
        <div class="row" style="gap:6px;margin-bottom:4px;align-items:flex-end;">
          <div class="grow">
            <span class="lbl">② 运动消耗 (kcal)</span>
            <input class="field" id="exInp" type="number" inputmode="decimal" placeholder="如 250" value="${ex0}" style="margin-top:4px;">
          </div>
        </div>
        <div id="fitCalc"></div>
      </div>
    `;

    const wtBtn = $('#wtBtn', el);
    if (wtBtn) wtBtn.onclick = () => {
      const kg = parseFloat($('#wtInp', el).value);
      if (!kg || kg < 20 || kg > 300) { toast('请输入合理体重 20-300kg'); return; }
      const ws = getWeights();
      const i = ws.findIndex(x => x.date === eatDate);
      if (i >= 0) ws[i] = { date: eatDate, kg }; else ws.push({ date: eatDate, kg });
      ws.sort((a, b) => a.date < b.date ? -1 : 1);
      setWeights(ws);
      toast(`已记录 ${kg} kg 📊`);
      drawFitGuide(el);
    };

    const onMetab = () => {
      const bmr = parseFloat($('#bmrInp', el).value) || 0;
      const ex = parseFloat($('#exInp', el).value) || 0;
      const m = getMetab();
      if (bmr || ex) m[eatDate] = { bmr, ex }; else delete m[eatDate];
      setMetab(m);
      refreshFitCalc(el);
    };
    const bmrEst = $('#bmrEst', el);
    if (bmrEst) bmrEst.onclick = () => {
      if (!w) { toast('先记录体重'); return; }
      $('#bmrInp', el).value = Math.round(w * 22);
      onMetab();
    };
    $('#bmrInp', el).oninput = onMetab;
    $('#exInp', el).oninput = onMetab;
    refreshFitCalc(el);
  }

  function refreshFitCalc(el) {
    const box = $('#fitCalc', el);
    if (!box) return;
    const bmr = parseFloat($('#bmrInp', el).value) || 0;
    const ex = parseFloat($('#exInp', el).value) || 0;
    const day = getEat()[eatDate] || { items: [] };
    const intake = day.items.reduce((a, b) => a + Number(b.kcal || 0), 0);
    if (!bmr) {
      box.innerHTML = `<div class="hint" style="margin-top:4px;">填写基础代谢后，自动算出总消耗 c，并和今日摄入 d 对比热量缺口 / 盈余 🔥</div>`;
      return;
    }
    const total = bmr + ex;          // c = a + b
    const diff = intake - total;     // >0 盈余, <0 缺口
    const surplus = diff > 0;
    const color = surplus ? '#D2604E' : '#4E7A2E';
    const tag = surplus ? '盈余' : '缺口';
    let tip;
    if (surplus) tip = (diff >= 200 && diff <= 300) ? '🎯 盈余 200–300 kcal，增肌黄金区间！' : (diff > 300 ? '盈余偏多，当心囤脂' : '盈余偏少，离增肌目标还差一点');
    else tip = `缺口 ${Math.abs(diff)} kcal，当前偏减脂 / 维持`;
    box.innerHTML = `
      <div class="fit-calc-box">
        <div class="row" style="justify-content:space-between;">
          <span class="lbl">总消耗 c = a ＋ b</span>
          <b style="font-size:14px;color:${color}">${total} kcal</b>
        </div>
        <div class="hint" style="margin:2px 0 5px;">a 基础代谢 ${bmr} ＋ b 运动 ${ex}</div>
        <div class="row" style="justify-content:space-between;">
          <span class="lbl">今日摄入 d</span>
          <b style="font-size:14px;color:var(--orange-d)">${intake} kcal</b>
        </div>
        <div class="fit-balance" style="border-color:${color};color:${color};">
          ${surplus ? '🔴' : '🟢'} 热量${tag} ${Math.abs(diff)} kcal
          <div class="hint" style="color:${color};opacity:.9;margin-top:2px;">${tip}</div>
        </div>
      </div>`;
  }

  function autoKcal() {
    const n = $('#fName').value.trim();
    const q = parseFloat($('#fQty').value);
    let grams = q;
    if (foodUnit === 'fist' && !isNaN(q)) grams = q * FIST_G;
    const f = FOOD_MAP[n];
    if (f && grams > 0) $('#fKcal').value = Math.round(f[2] * grams / 100);
  }

  function drawQuick() {
    const list = FOODS.filter(f => f[3] === selCat);
    $('#foodQuick').innerHTML = list.map(f =>
      `<button class="chip sm" data-n="${esc(f[0])}">${f[1]} ${esc(f[0])}</button>`).join('');
    $$('#foodQuick .chip').forEach(c => c.onclick = () => {
      $('#fName').value = c.dataset.n;
      if (!$('#fQty').value) $('#fQty').value = selCat === '饮品' ? 250 : 100;
      autoKcal();
      $('#fQty').focus();
    });
  }

  /* AI：把菜名拆成每种食材 → [{food, ratio, info}] */
  function estimateDish(name) {
    let s = name.replace(/\s+/g, '');
    if (DISH_ALIAS[s]) return [{ food: DISH_ALIAS[s], ratio: 1, info: FOOD_MAP[DISH_ALIAS[s]] }];
    const seps = ['焖', '炖', '煮', '炒', '烧', '爆', '拌', '配', '汤', '饭', '面', '粥', '和', '加', 'with', '、', '+', '/', '，', ','];
    let parts = [s];
    seps.forEach(sep => {
      const np = [];
      parts.forEach(p => p.split(sep).forEach(x => x && np.push(x)));
      parts = np;
    });
    const found = [];
    parts.forEach(pt => {
      let key = FOOD_MAP[pt] ? pt : null;
      if (!key) {
        for (const k in FOOD_MAP) { if (k.includes(pt) || pt.includes(k)) { key = k; break; } }
      }
      if (key && !found.find(f => f.food === key)) found.push({ food: key });
    });
    if (!found.length) return [];
    if (found.length === 1) found[0].ratio = 1;
    else {
      const mainR = 0.5, rest = (1 - mainR) / (found.length - 1);
      found.forEach((f, idx) => f.ratio = idx === 0 ? mainR : rest);
    }
    return found.map(f => ({ food: f.food, ratio: f.ratio, info: FOOD_MAP[f.food] }));
  }

  function addFood() {
    const n = $('#fName').value.trim();
    if (!n) { toast('先写食物名字呀 🍚'); return; }
    let qty = parseFloat($('#fQty').value);
    if (foodUnit === 'fist') qty = (isNaN(qty) ? 1 : qty) * FIST_G;
    if (isNaN(qty)) qty = 0;

    if (aiMode) {
      const parts = estimateDish(n);
      if (parts.length) {
        const all = getEat();
        const day = all[eatDate] || { items: [], ts: Date.now() };
        const totalG = qty || FIST_G;
        let added = 0;
        parts.forEach(p => {
          const g = Math.round(totalG * p.ratio);
          const kcal = Math.round(p.info[2] * g / 100);
          day.items.push({ id: uid(), name: p.food, ico: p.info[1], kcal, qty: g, cat: p.info[3], time: UI.nowHM() });
          added += kcal;
        });
        all[eatDate] = day; setEat(all);
        $('#fName').value = ''; $('#fQty').value = ''; $('#fKcal').value = '';
        drawEatList(); drawGuideBody(); drawSummary(sumRange);
        toast(`🤖 拆出 ${parts.length} 种食材 · ${added} kcal`);
        return;
      } else {
        toast('没认出具体食材，已按手填热量添加');
      }
    }

    const k = parseFloat($('#fKcal').value);
    const f = FOOD_MAP[n];
    let kcal = k;
    if (isNaN(kcal)) kcal = f && qty ? Math.round(f[2] * qty / 100) : 0;
    const all = getEat();
    const day = all[eatDate] || { items: [], ts: Date.now() };
    day.items.push({ id: uid(), name: n, ico: f ? f[1] : (selCat === '饮品' ? '🥤' : '🍽'), kcal: Math.round(kcal), qty, cat: f ? f[3] : selCat, time: UI.nowHM() });
    all[eatDate] = day; setEat(all);
    $('#fName').value = ''; $('#fQty').value = ''; $('#fKcal').value = '';
    drawEatList(); drawGuideBody(); drawSummary(sumRange);
    toast(`记下 ${n} ${kcal ? kcal + ' kcal' : ''}`);
  }

  function drawEatList() {
    const day = getEat()[eatDate] || { items: [] };
    const total = day.items.reduce((a, b) => a + Number(b.kcal || 0), 0);
    $('#kcalSum').textContent = day.items.length ? `共 ${day.items.length} 项 · ${total} kcal` : '';
    const sum = {};
    day.items.forEach(i => { sum[i.cat] = (sum[i.cat] || 0) + Number(i.kcal || 0); });
    const ent = Object.entries(sum).filter(x => x[1] > 0);
    $('#catBar').innerHTML = ent.length ? `
      <div class="nutri-bar">${ent.map(([c, v]) => `<i style="flex:${v};background:${CAT_COLOR[c] || '#ccc'}"></i>`).join('')}</div>
      <div class="chip-group" style="margin-top:6px;">${ent.map(([c, v]) => `<span class="chip sm"><i style="width:8px;height:8px;border-radius:50%;background:${CAT_COLOR[c]};display:inline-block;"></i>${c} ${v}kcal</span>`).join('')}</div>` : '';
    const box = $('#eatList');
    if (!day.items.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.bowl()}</div>今天还没记录～<br>吃点好的再回来记吧</div>`;
      return;
    }
    box.innerHTML = day.items.map(i => `
      <div class="food-item" data-id="${i.id}">
        <div class="food-ico">${i.ico}</div>
        <div class="grow">
          <div style="font-size:13px;font-weight:700;">${esc(i.name)} ${i.qty ? `<span class="hint">${i.qty}${i.cat === '饮品' ? 'ml' : 'g'}</span>` : ''}</div>
          <div class="hint">${i.time || ''} · ${esc(i.cat)}</div>
        </div>
        <b style="font-size:13.5px;color:var(--orange-d);">${i.kcal} kcal</b>
        <span class="todo-del" data-act="del">×</span>
      </div>`).join('');
    box.onclick = (e) => {
      if (e.target.dataset.act !== 'del') return;
      const it = e.target.closest('.food-item');
      const all = getEat(); const d = all[eatDate];
      d.items = d.items.filter(x => x.id !== it.dataset.id);
      all[eatDate] = d; setEat(all); drawEatList(); drawGuideBody();
    };
  }

  /* 汇总：今日 / 本周 / 本月 + 柱状图 + 日历热力 */
  function drawSummary(range) {
    if (range) sumRange = range;
    const all = getEat();
    const t = today();
    const day = all[eatDate] || { items: [] };

    if (sumRange === 'day') {
      drawEatList();
      const total = day.items.reduce((a, b) => a + Number(b.kcal || 0), 0);
      $('#kcalSum').textContent = day.items.length ? `共 ${day.items.length} 项 · ${total} kcal` : '';
      $('#sumChart').innerHTML = '';
      return;
    }

    $('#catBar').innerHTML = '';
    $('#eatList').innerHTML = `<div class="empty" style="padding:14px 0 4px;">切到「今日」查看每条明细 · 当前显示${sumRange === 'week' ? '本周' : '本月'}汇总</div>`;

    let dates;
    if (sumRange === 'week') dates = weekOf(t);
    else {
      const ym = t.slice(0, 7);
      dates = Object.keys(all).filter(d => d.startsWith(ym)).sort();
    }
    const metab = getMetab();
    const data = dates.map(d => {
      const items = (all[d] && all[d].items) || [];
      const k = items.reduce((a, b) => a + Number(b.kcal || 0), 0);
      const m = metab[d] || {};
      const c = (Number(m.bmr) || 0) + (Number(m.ex) || 0);
      const bal = c > 0 ? k - c : null;   // >0 盈余, <0 缺口；无消耗记录则为 null
      return { d, k, c, bal };
    });
    const total = data.reduce((a, x) => a + x.k, 0);
    $('#kcalSum').textContent = `${sumRange === 'week' ? '本周' : '本月'}共 ${total} kcal`;

    const maxK = Math.max(1, ...data.map(x => Math.max(x.k, x.c)));
    const wdLbl = ['日', '一', '二', '三', '四', '五', '六'];
    const chart = $('#sumChart');
    if (!chart) return;
    const totK = data.reduce((a, x) => a + x.k, 0);
    const totC = data.reduce((a, x) => a + x.c, 0);
    const totBal = totK - totC;
    chart.innerHTML = `
      <div class="hint" style="margin-bottom:5px;">每日热量对比（kcal） · <b style="color:var(--orange)">摄入</b> / <b style="color:#6E84A3">消耗</b> · <b style="color:#D2604E">红=多出(盈余)</b> <b style="color:#4E7A2E">绿=少出(缺口)</b></div>
      <div class="mini-chart">
        ${data.map(x => {
          const lbl = sumRange === 'week' ? wdLbl[parseYMD(x.d).getDay()] : x.d.slice(8);
          const kh = x.k ? Math.max(4, Math.round(x.k / maxK * 90)) : 2;
          const ch = x.c ? Math.max(4, Math.round(x.c / maxK * 90)) : 0;
          const hasPair = x.k && x.c;
          const baseH = hasPair ? Math.round(Math.min(x.k, x.c) / maxK * 90) : 0;
          const surH = hasPair && kh > baseH ? kh - baseH : 0;   // 摄入多出 → 红
          const defH = hasPair && ch > baseH ? ch - baseH : 0;   // 消耗多出(缺口) → 绿
          const inBar = !x.k ? `<div class="bc-bar in" style="height:2px;"></div>`
            : hasPair
              ? `<div class="bc-bar in" style="height:${kh}px;"><div class="bc-seg" style="height:${baseH}px;background:var(--orange);"></div>${surH ? `<div class="bc-seg" style="height:${surH}px;background:#D2604E;"></div>` : ''}<span class="bc-val">${x.k}</span></div>`
              : `<div class="bc-bar in" style="height:${kh}px;background:var(--orange);"><span class="bc-val">${x.k}</span></div>`;
          const outBar = !x.c ? `<div class="bc-bar out" style="height:2px;"></div>`
            : hasPair
              ? `<div class="bc-bar out" style="height:${ch}px;"><div class="bc-seg" style="height:${baseH}px;background:#6E84A3;"></div>${defH ? `<div class="bc-seg" style="height:${defH}px;background:#4E7A2E;"></div>` : ''}<span class="bc-val">${x.c}</span></div>`
              : `<div class="bc-bar out" style="height:${ch}px;background:#6E84A3;"><span class="bc-val">${x.c}</span></div>`;
          return `<div class="bc-col">
            <div class="bc-pair">${inBar}${outBar}</div>
            <div class="bc-lbl">${lbl}</div>
            ${x.bal != null ? `<div class="bc-bal" style="color:${x.bal > 0 ? '#D2604E' : '#4E7A2E'};">${x.bal > 0 ? '＋' + x.bal : '' + x.bal}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${totC > 0 ? `<div class="fit-balance" style="border-color:${totBal > 0 ? '#D2604E' : '#4E7A2E'};color:${totBal > 0 ? '#D2604E' : '#4E7A2E'};margin-top:9px;">
        ${totBal > 0 ? '🔴' : '🟢'} 期间合计：${sumRange === 'week' ? '本周' : '本月'} 摄入 ${totK} ／ 消耗 ${totC} · 净${totBal > 0 ? '盈余' : '缺口'} ${Math.abs(totBal)} kcal
      </div>` : `<div class="hint" style="margin-top:8px;">提示：在「女性增肌指南」里填写每日 BMR / 运动消耗，柱状图会同步显示摄入 vs 消耗对比。</div>`}
    `;

    if (sumRange === 'month') {
      const d0 = parseYMD(t); const y = d0.getFullYear(), m = d0.getMonth();
      const cells = monthMatrix(y, m);
      const byD = {}; data.forEach(x => byD[x.d] = x.k);
      const maxM = Math.max(1, ...Object.values(byD));
      let cal = `<div class="hint" style="margin:12px 0 5px;">本月热量热力（颜色越深吃得越多）</div><div class="cal-heat">`;
      cal += WD.map(w => `<span class="hm-w">${w}</span>`).join('');
      cells.forEach(d => {
        if (!d) { cal += `<span class="hm-cell blank"></span>`; return; }
        const k = byD[d] || 0;
        const inten = k ? Math.round(k / maxM * 100) : 0;
        const bg = k ? `color-mix(in srgb, var(--orange) ${inten}%, #F6EBD8)` : '#F6EBD8';
        cal += `<span class="hm-cell" style="background:${bg};" title="${d}: ${k}kcal">${parseYMD(d).getDate()}</span>`;
      });
      cal += `</div>`;
      chart.innerHTML += cal;
    }
  }

  function eatHistory() {
    const all = getEat();
    const ds = Object.keys(all).filter(d => (all[d].items || []).length).sort().reverse();
    if (!ds.length) { toast('还没有历史记录'); return; }
    modal.open('饮食历史（一日一记）', `<div id="ehList">${ds.map(d => {
      const it = all[d].items || [];
      const k = it.reduce((a, b) => a + Number(b.kcal || 0), 0);
      return `<div class="rec-item" data-d="${d}">
        <div class="rec-ico">${it[0] ? it[0].ico : '🍽'}</div>
        <div class="rec-main"><div class="t">${d} 星期${UI.wdOf(d)}</div>
        <div class="s">${it.slice(0, 6).map(x => x.ico + x.name).join('、')}${it.length > 6 ? '…' : ''}</div></div>
        <b style="font-size:12.5px;color:var(--orange-d);white-space:nowrap;">${k}kcal</b>
      </div>`;
    }).join('')}</div>`, (b) => {
      $$('#ehList .rec-item', b).forEach(it => it.onclick = () => {
        eatDate = it.dataset.d; modal.close(); renderEat($('#esPane'));
      });
    });
  }

  /* ============ 能睡 ============ */
  function renderSleep(p) {
    const sl = getSleep();
    const t = today();
    const cur = sl[t] || {};
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.moon()}</span>早睡的好处 <small>说给赖床的你听</small></div>
        <ul class="bullet">
          <li>23 点前入睡，生长激素分泌高峰在 22:00-02:00，是皮肤修复的黄金时段。</li>
          <li>规律作息让皮质醇（压力激素）回落，第二天情绪更稳定、不易暴躁。</li>
          <li>深睡时大脑淋巴系统清理代谢废物，记忆力和专注力都靠它。</li>
          <li>睡够 7-8 小时的人食欲激素更平衡，比熬夜的人更不容易发胖。</li>
          <li>免疫细胞在夜间活跃，早睡的人感冒频率明显更低。</li>
          <li>眼周血液循环改善，黑眼圈和浮肿会肉眼可见地变淡。</li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.rabbit()}</span>打卡：你今天美容觉了吗？</div>
        <div class="row" style="align-items:center;gap:12px;">
          <div class="grow">
            <span class="lbl">入睡时间</span>
            <input class="field" id="bedT" type="time" value="${cur.bed || '23:00'}">
            <span class="lbl" style="margin-top:8px;">起床时间</span>
            <input class="field" id="upT" type="time" value="${cur.up || '07:00'}">
            <div class="hint" style="margin-top:7px;" id="durHint"></div>
          </div>
          <div style="text-align:center;">
            <div class="stamp-btn ${cur.stamp ? 'done' : ''}" id="stampBtn">美</div>
            <div class="hint" style="margin-top:5px;width:66px;">${cur.stamp ? '已盖章' : '点我盖章'}</div>
          </div>
        </div>
        <button class="btn block" id="saveSleep" style="margin-top:11px;">保存今天的睡眠</button>
      </div>

      <div class="card">
        <div class="stat-row" style="margin-bottom:11px;">
          <div class="stat"><div class="v" id="avgDur">-</div><div class="k">本月平均时长</div></div>
          <div class="stat"><div class="v" id="stampCnt">-</div><div class="k">本月盖章天数</div></div>
          <div class="stat"><div class="v" id="earlyCnt">-</div><div class="k">23点前入睡</div></div>
        </div>
        <div class="cal-head">
          <button class="cal-nav" id="spm">‹</button>
          <div class="m" id="sCalTitle"></div>
          <button class="cal-nav" id="snm">›</button>
        </div>
        <div class="cal-grid" id="sCalGrid"></div>
        <div class="hint" style="margin-top:8px;text-align:center;">格子下方数字为当天睡眠时长（小时）· 红章代表美容觉达标</div>
      </div>`;

    const calcDur = () => {
      const b = $('#bedT').value, u = $('#upT').value;
      if (!b || !u) return null;
      const [bh, bm] = b.split(':').map(Number), [uh, um] = u.split(':').map(Number);
      let d = (uh * 60 + um) - (bh * 60 + bm);
      if (d <= 0) d += 1440;
      return d / 60;
    };
    const showDur = () => {
      const d = calcDur();
      $('#durHint').textContent = d == null ? '' : `睡眠时长约 ${d.toFixed(1)} 小时` + (d >= 7 && d <= 9 ? '，很棒！' : d < 7 ? '，有点不够哦' : '，睡得挺足');
    };
    $('#bedT').oninput = showDur; $('#upT').oninput = showDur; showDur();

    $('#saveSleep').onclick = () => {
      const all = getSleep();
      const c = all[t] || {};
      c.bed = $('#bedT').value; c.up = $('#upT').value; c.dur = calcDur();
      all[t] = c; setSleep(all);
      drawSleepCal(); toast('睡眠记录保存啦 🌙');
    };
    $('#stampBtn').onclick = () => {
      const all = getSleep();
      const c = all[t] || {};
      c.stamp = !c.stamp;
      if (!c.bed) { c.bed = $('#bedT').value; c.up = $('#upT').value; c.dur = calcDur(); }
      all[t] = c; setSleep(all);
      $('#stampBtn').classList.toggle('done', !!c.stamp);
      $('#stampBtn').nextElementSibling.textContent = c.stamp ? '已盖章' : '点我盖章';
      drawSleepCal();
      toast(c.stamp ? '「美」章盖好啦 💮' : '章撤销了');
    };
    $('#spm').onclick = () => { calM--; if (calM < 0) { calM = 11; calY--; } drawSleepCal(); };
    $('#snm').onclick = () => { calM++; if (calM > 11) { calM = 0; calY++; } drawSleepCal(); };
    drawSleepCal();
  }

  function drawSleepCal() {
    $('#sCalTitle').textContent = `${calY} 年 ${calM + 1} 月`;
    const sl = getSleep();
    const cells = monthMatrix(calY, calM);
    const t = today();
    let html = WD.map(w => `<div class="cal-w">${w}</div>`).join('');
    let durs = [], stamps = 0, early = 0;
    cells.forEach(d => {
      if (!d) { html += `<div class="cal-d blank"></div>`; return; }
      const s = sl[d];
      if (s) {
        if (s.dur != null) durs.push(s.dur);
        if (s.stamp) stamps++;
        if (s.bed) { const h = Number(s.bed.split(':')[0]); if (h >= 20 && h < 23) early++; }
      }
      html += `<div class="cal-d ${d === t ? 'today' : ''}" data-d="${d}" style="justify-content:flex-start;padding-top:5px;">
        ${parseYMD(d).getDate()}
        ${s && s.dur != null ? `<span class="mini" style="color:${s.dur >= 7 ? '#5F8F49' : '#D2604E'}">${s.dur.toFixed(1)}h</span>` : ''}
        ${s && s.stamp ? `<span class="stamp-mark" style="position:absolute;right:2px;top:2px;transform:rotate(-14deg) scale(.78);">美</span>` : ''}
      </div>`;
    });
    $('#sCalGrid').innerHTML = html;
    $('#avgDur').textContent = durs.length ? (durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(1) + 'h' : '-';
    $('#stampCnt').textContent = stamps + ' 天';
    $('#earlyCnt').textContent = early + ' 天';
    $$('#sCalGrid .cal-d[data-d]').forEach(c => c.onclick = () => editSleepDay(c.dataset.d));
  }

  function editSleepDay(d) {
    const all = getSleep(); const s = all[d] || {};
    modal.open(d + ' 的睡眠', `
      <span class="lbl">入睡时间</span><input class="field" id="sB" type="time" value="${s.bed || '23:00'}">
      <span class="lbl" style="margin-top:8px;">起床时间</span><input class="field" id="sU" type="time" value="${s.up || '07:00'}">
      <div class="row" style="margin-top:10px;align-items:center;">
        <button class="chip ${s.stamp ? 'on' : ''}" id="sStamp">💮 美容觉盖章</button>
        <span class="hint grow" id="sDur"></span>
      </div>
      <div class="row" style="margin-top:12px;">
        <button class="btn ghost grow" id="sDel">清除这天</button>
        <button class="btn grow" id="sSave">保存</button>
      </div>`, (b) => {
      let stamp = !!s.stamp;
      const calc = () => {
        const [bh, bm] = $('#sB', b).value.split(':').map(Number);
        const [uh, um] = $('#sU', b).value.split(':').map(Number);
        let x = (uh * 60 + um) - (bh * 60 + bm); if (x <= 0) x += 1440;
        $('#sDur', b).textContent = `约 ${(x / 60).toFixed(1)} 小时`;
        return x / 60;
      };
      calc();
      $('#sB', b).oninput = calc; $('#sU', b).oninput = calc;
      $('#sStamp', b).onclick = () => { stamp = !stamp; $('#sStamp', b).classList.toggle('on', stamp); };
      $('#sSave', b).onclick = () => {
        all[d] = { bed: $('#sB', b).value, up: $('#sU', b).value, dur: calc(), stamp };
        setSleep(all); modal.close(); drawSleepCal(); toast('保存好啦');
      };
      $('#sDel', b).onclick = async () => {
        if (await confirmBox(`清除 ${d} 的睡眠记录？`)) { delete all[d]; setSleep(all); modal.close(); drawSleepCal(); toast('已清除'); }
      };
    });
  }

  /* ============ 爱吃爱喝（收藏夹） ============ */
  let favCat = 'dish';
  function renderFav(p) {
    const favs = getFav();
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>我的爱吃爱喝 <small>私藏美食清单</small></div>
        <div class="hint" style="margin-bottom:9px;">记录你最爱吃的菜、饮料、零食，配上图片，打造专属美食地图 🍜</div>
        <div class="chip-group" id="favCatGrp" style="margin-bottom:10px;">
          ${FAV_CATS.map(c => `<button class="chip ${favCat === c.id ? 'on' : ''}" data-c="${c.id}">${c.ico} ${c.name}</button>`).join('')}
        </div>

        <!-- 添加表单 -->
        <div class="card tight" style="margin-bottom:10px;background:var(--orange-xl);border-color:var(--orange-l);">
          <span class="lbl">名称</span>
          <input class="field" id="favName" placeholder="菜名 / 饮料 / 零食..." maxlength="20">
          <div class="row" style="margin-top:8px;">
            <select class="field" id="favSelCat" style="flex:1;min-width:0;">
              ${FAV_CATS.map(c => `<option value="${c.id}" ${favCat === c.id ? 'selected' : ''}>${c.ico} ${c.name}</option>`).join('')}
            </select>
            <button class="btn sm" id="favImgBtn">${Icons.photo()}图片</button>
          </div>
          <input class="field" id="favNote" placeholder="备注（哪里吃的、为什么喜欢...）" maxlength="60" style="margin-top:8px;">
          <div class="hint" id="favImgHint" style="margin-top:4px;"></div>
          <button class="btn block" id="favAdd" style="margin-top:8px;">${Icons.plus()}加入爱吃爱喝</button>
        </div>

        <!-- 列表 -->
        <div id="favList"></div>
      </div>`;

    /* 分类筛选 */
    $$('#favCatGrp .chip').forEach(c => c.onclick = () => {
      favCat = c.dataset.c;
      $$('#favCatGrp .chip').forEach(x => x.classList.toggle('on', x === c));
      $('#favSelCat').value = favCat;
      drawFavList();
    });
    $('#favSelCat').onchange = () => { favCat = $('#favSelCat').value; };

    /* 图片选择 */
    let favImg = '';
    $('#favImgBtn').onclick = async () => {
      const img = await pickImage(1200);
      if (img) { favImg = img; $('#favImgHint').textContent = '已选 1 张图'; }
    };

    /* 添加 */
    $('#favAdd').onclick = () => {
      const name = $('#favName').value.trim();
      if (!name) { toast('先写名字呀'); return; }
      const cat = $('#favSelCat').value;
      const note = $('#favNote').value.trim();
      const favs = getFav();
      favs.unshift({
        id: uid(), name, cat,
        ico: (FAV_CAT_MAP[cat] || {}).ico || '✨',
        note, img: favImg || '',
        ts: Date.now(), date: today()
      });
      setFav(favs);
      $('#favName').value = ''; $('#favNote').value = '';
      favImg = ''; $('#favImgHint').textContent = '';
      toast(`🌟 ${name} 加入爱吃爱喝！`);
      drawFavList();
    };

    drawFavList();
  }

  function drawFavList() {
    const box = $('#favList');
    if (!box) return;
    let favs = getFav();
    if (favCat !== 'all') favs = favs.filter(f => f.cat === favCat);
    if (!favs.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.star()}</div>还没有收藏<br>把你爱吃的都记下来吧！</div>`;
      return;
    }
    box.innerHTML = favs.map(f => `
      <div class="food-item" data-fid="${f.id}">
        ${f.img ? `<img src="${f.img}" class="food-ico clickable-img" style="padding:0;overflow:hidden;border-radius:11px;object-fit:cover;" alt="${esc(f.name)}">` : `<div class="food-ico">${f.ico}</div>`}
        <div class="grow">
          <div style="font-size:13px;font-weight:700;">${esc(f.name)}</div>
          <div class="hint"><span class="chip sm" style="margin-right:4px;">${(FAV_CAT_MAP[f.cat] || {}).name || f.cat}</span>${esc(f.note)}</div>
        </div>
        <span class="todo-del" data-act="fdel">×</span>
      </div>`).join('');
    box.onclick = (e) => {
      if (e.target.dataset.act !== 'fdel') return;
      const it = e.target.closest('.food-item');
      const favs = getFav().filter(f => f.id !== it.dataset.fid);
      setFav(favs); drawFavList(); toast('已移除');
    };
  }

  window.Modules = window.Modules || {};
  window.Modules.eatsleep = { id: 'eatsleep', name: '能吃能睡', desc: '干饭要香，睡觉要沉', icon: 'pig', render };
})();
