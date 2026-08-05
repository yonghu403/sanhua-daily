/* ===== 模块 4：运动养生（汇总 / 体态矫正 / 增肌塑形 / 长寿养生） ===== */
(function () {
  const { $, $$, esc, uid, today, ymd, parseYMD, wdOf, WD, monthMatrix, nowHM, toast, modal, confirmBox } = UI;

  const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const todayIdx = () => (new Date().getDay() + 6) % 7;

  /* ---------------- 体态矫正（10 条） ---------------- */
  const DEF_POSTURE = [
    { id: 'p1', problem: '圆肩驼背', plan: '成因：长期伏案、胸小肌与胸大肌紧张、菱形肌/中下斜方无力。\n\n方案：\n· 胸小肌墙角拉伸 30 秒 ×3\n· 泡沫轴放松胸椎 2 分钟\n· YTWL 俯卧激活 12 次 ×3\n· 弹力带面拉 15 次 ×3\n· 每工作 45 分钟起身开肩 1 分钟' },
    { id: 'p2', problem: '头前引（乌龟颈）', plan: '成因：枕下肌群紧张、深层颈屈肌无力。\n\n方案：\n· 收下巴（Chin Tuck）10 次 ×3，每次保持 5 秒\n· 枕下肌按摩球放松 1 分钟/侧\n· 屏幕抬高到与视线平齐\n· 靠墙站立贴后脑勺 1 分钟 ×3' },
    { id: 'p3', problem: '骨盆前倾', plan: '成因：髂腰肌+竖脊肌紧张、臀大肌+腹肌无力。\n\n方案：\n· 弓步髂腰肌拉伸 30 秒 ×3/侧\n· 死虫式 12 次 ×3\n· 臀桥 20 次 ×3（顶峰夹臀 2 秒）\n· 平板支撑 30-45 秒 ×3\n· 避免长时间穿高跟鞋' },
    { id: 'p4', problem: '骨盆后倾', plan: '成因：腘绳肌+臀大肌紧张、髂腰肌无力。\n\n方案：\n· 腘绳肌拉伸 30 秒 ×3/侧\n· 站姿提膝 15 次 ×3\n· 竖脊肌激活：俯卧超人 12 次 ×3\n· 纠正"葛优瘫"坐姿，坐骨坐正' },
    { id: 'p5', problem: '大小脸', plan: '成因：单侧咀嚼、长期侧睡/托腮，导致一侧咬肌或颊脂更发达，也可能伴随颞下颌关节偏移。\n\n方案：\n· 改成双侧均衡咀嚼，吃饭记得换边\n· 戒掉托腮、趴着侧睡，尽量仰卧\n· 发达侧咬肌用手指轻揉放松 1 分钟\n· 张口操：缓慢张到无痛最大，保持 3 秒 ×10\n· 明显不对称或张口有弹响，去口腔科/正畸评估' },
    { id: 'p6', problem: '肩关节失稳弹响', plan: '成因：肩袖肌群（冈上肌、肩胛下肌等）无力、关节囊松弛，或肩胛骨稳定差导致肱骨头轨迹异常，活动时出现弹响或"咔哒"感。\n\n方案：\n· 弹力带肩外旋 15 次 ×3（强化冈下肌、小圆肌）\n· 墙面滑行（Wall Slide）12 次 ×3\n· 前锯肌俯卧撑（Push-up Plus）10 次 ×3\n· 避免过顶猛甩、突然发力\n· 弹响伴疼痛/交锁请就医，警惕肩袖损伤' },
    { id: 'p7', problem: '翼状肩胛', plan: '成因：前锯肌无力、肩胛稳定性差。\n\n方案：\n· 墙面滑行（Wall Slide）12 次 ×3\n· 前锯肌俯卧撑（Push-up Plus）10 次 ×3\n· 四足支撑肩胛前伸 15 次 ×3' },
    { id: 'p8', problem: '扁平足 / 足弓塌陷', plan: '方案：\n· 短足练习（Short Foot）10 次 ×3\n· 脚趾抓毛巾 15 次 ×3\n· 提踵 20 次 ×3\n· 选有足弓支撑的鞋，避免久穿平底软鞋' },
    { id: 'p9', problem: '长短腿 / 高低肩', plan: '先区分结构性还是功能性（多为骨盆旋转导致）。\n\n方案：\n· 单侧臀中肌激活\n· 腰方肌拉伸 30 秒/侧\n· 避免单肩背包、跷二郎腿\n· 差异 >1cm 建议去康复科评估' },
    { id: 'p10', problem: '骨盆侧倾侧旋', plan: '成因：左右臀中肌/腰方肌力量不均、功能性长短腿、习惯性翘二郎腿或单肩负重，使骨盆在冠状面倾斜、水平面旋转。\n\n方案：\n· 弱侧臀中肌激活：侧卧抬腿 15 次 ×3\n· 腰方肌拉伸 30 秒/侧\n· 鸟狗式、死虫式强化核心对称 12 次 ×3\n· 纠正翘二郎腿、单肩背包\n· 站立时双足均匀承重，照镜子看两侧髂嵴是否水平' }
  ];

  /* ---------------- 增肌塑形：周计划模板（每周轮换，不固定） ---------------- */
  const GYM_TEMPLATES = [
    [ // 模板 1：力量主线
      { theme: '臀腿日（前链）', items: ['深蹲 4×10', '保加利亚分腿蹲 3×12/侧', '臀桥 4×15'] },
      { theme: '上肢推（胸肩三头）', items: ['哑铃卧推 4×10', '坐姿肩推 3×12', '侧平举 4×15'] },
      { theme: '瑜伽舒缓', items: ['瑜伽·下犬式 1 分钟', '瑜伽·鸽子式 每侧 1 分钟', '瑜伽·猫牛式 12 次'] },
      { theme: '臀腿日（后链）', items: ['罗马尼亚硬拉 4×10', '臀推 4×12', '腿弯举 3×15'] },
      { theme: '上肢拉（背二头）', items: ['引体/高位下拉 4×10', '坐姿划船 4×12', '哑铃弯举 3×12'] },
      { theme: '芭杆 + 有氧', items: ['芭杆·Plié 深蹲 15×3', '芭杆·抬腿外展 每侧 12', '快走/骑行 30 分钟'] },
      { theme: '休息 + 拉伸放松', items: ['全身静态拉伸 15 分钟', '泡沫轴放松 10 分钟', '散步 30 分钟'] }
    ],
    [ // 模板 2：循环 + 核心
      { theme: '全身循环', items: ['壶铃摆荡 4×15', '波比跳 4×10', '登山跑 4×30 秒'] },
      { theme: '瑜伽 + 核心', items: ['瑜伽·平板流动 3 轮', '死虫式 3×12', '侧平板 每侧 30 秒'] },
      { theme: '臀腿', items: ['深蹲 4×12', '罗马尼亚硬拉 4×10', '提踵 4×20'] },
      { theme: '芭杆塑形', items: ['芭杆·Plié 15×3', '芭杆·抬腿外展 每侧 12', '芭杆·立姿腹肌 20'] },
      { theme: '上肢', items: ['俯卧撑 4×12', '弹力带划船 4×15', '面拉 3×15'] },
      { theme: '户外 + 瑜伽', items: ['爬山/骑行 60 分钟', '瑜伽·婴儿式放松', '瑜伽·桥式 15 次'] },
      { theme: '休息', items: ['散步 30 分钟', '拉伸 15 分钟', '早睡让肌肉长大'] }
    ],
    [ // 模板 3：增肌强化
      { theme: '胸肩', items: ['哑铃卧推 5×8', '上斜推 4×10', '侧平举 5×15'] },
      { theme: '背', items: ['引体 5×8', '硬拉 4×8', '坐姿划船 4×12'] },
      { theme: '瑜伽恢复', items: ['瑜伽·阴瑜伽 20 分钟', '瑜伽·开髋 每侧 2 分钟', '腹式呼吸 5 分钟'] },
      { theme: '腿', items: ['深蹲 5×8', '腿举 4×12', '腿弯举 4×15'] },
      { theme: '手臂 + 核心', items: ['哑铃弯举 4×12', '绳索下压 4×15', '卷腹 3×20'] },
      { theme: '芭杆 + 有氧', items: ['芭杆·Plié 15×3', '芭杆·Relevé 提踵 20', '快走 30 分钟'] },
      { theme: '休息', items: ['泡沫轴放松', '散步 30 分钟', '早睡'] }
    ]
  ];

  /* ---------------- 长寿养生：周计划（a/b/c，含泡脚/艾灸/刮肝经） ---------------- */
  const DEF_HEALTH_PLAN = [
    { items: ['八段锦全套（12 分钟）', '拍八虚：肘窝', '刮肝经 5 分钟'] },
    { items: ['五禽戏：虎戏 + 鹿戏', '艾灸 足三里/关元 15 分钟', '散步 30 分钟'] },
    { items: ['八段锦全套', '拍八虚：腘窝', '泡脚 15 分钟（40℃）'] },
    { items: ['五禽戏：熊戏 + 猿戏', '瑜伽·舒展拉伸', '揉腹 5 分钟'] },
    { items: ['八段锦全套', '拍八虚：腋窝', '刮肝经 5 分钟'] },
    { items: ['五禽戏：鸟戏', '户外/爬山 60 分钟', '艾灸 命门 15 分钟'] },
    { items: ['拍八虚全套', '泡脚 20 分钟（40℃）', '静坐调息 10 分钟'] }
  ];

  /* ---------------- 知识讲堂（原"动作库"） ---------------- */
  const HEALTH_LIB = {
    baxu: { name: '拍八虚', ico: '👐', link: '', intro: '“八虚”出自《黄帝内经》，指两腋窝、两肘窝、两髀窝（腹股沟）、两腘窝（膝盖后窝），是气血最容易淤堵的八个凹陷处。拍打可疏通经络、排浊气。',
      items: [['腋窝（极泉穴）', '心经所过。空掌轻拍或弹拨 3-5 分钟/侧，可缓解心慌胸闷、上肢麻。有心脏病者力度要轻。'], ['肘窝（曲池、尺泽）', '肺经心经交汇。空掌拍打 5 分钟/侧，拍到微微发红发热为宜，可清肺热、缓解咳嗽。'], ['髀窝（腹股沟）', '肝经所过。轻拍或推按 3-5 分钟/侧，有助疏肝理气、改善下肢循环。力度要轻柔。'], ['腘窝（委中穴）', '膀胱经要穴，“腰背委中求”。拍打 5 分钟/侧，缓解腰背酸痛、下肢沉重。']],
      tips: '拍打要点：空心掌、由轻到重、每处 3-5 分钟；饭后一小时内、过饥过饱、孕期、皮肤破损处不宜拍打。拍完喝一杯温水。' },
    baduanjin: { name: '八段锦', ico: '🧘', link: '', intro: '国家体育总局推广的健身气功，全套约 12-15 分钟，动作柔和舒展，适合每天练。',
      items: [['双手托天理三焦', '两手交叉上托，拉伸躯干，调理三焦、改善肩颈僵硬。上托时吸气，落下时呼气，重复 6-8 次。'], ['左右开弓似射雕', '马步开弓，扩胸展肩，增强肺活量、纠正含胸。左右各 6 次。'], ['调理脾胃须单举', '一手上举一手下按，牵拉腹腔，促进消化。左右各 6 次。'], ['五劳七伤往后瞧', '转头后瞧，活动颈椎胸椎，缓解久坐劳损。左右各 6 次。'], ['摇头摆尾去心火', '马步摇转，泻心火、强腰肾。左右各 6 次，高血压者幅度放小。'], ['两手攀足固肾腰', '俯身攀足，拉伸后链、固肾强腰。重复 6-8 次，腰椎间盘突出者慎做。'], ['攒拳怒目增气力', '马步冲拳、怒目而视，增强肝气与力量。左右各 6 次。'], ['背后七颠百病消', '提踵颠足，震动脊柱、放松全身。连续 7 次为一组，做 3 组收功。']],
      tips: '要点：呼吸自然、动作匀缓、意守丹田。早上练提神，晚上练助眠（晚上动作放缓）。' },
    wuqinxi: { name: '五禽戏', ico: '🐅', link: '', intro: '华佗所创，模仿虎、鹿、熊、猿、鸟五种动物的姿态，各归五脏，全套约 15 分钟。',
      items: [['虎戏（主肝）', '虎举 + 虎扑。舒筋活络、增强腰背力量，肝气郁结、易怒者多练。各做 3-5 遍。'], ['鹿戏（主肾）', '鹿抵 + 鹿奔。活动腰胯、强肾健腰，久坐腰酸者受益最大。各做 3-5 遍。'], ['熊戏（主脾）', '熊运 + 熊晃。摩运腹部、健脾和胃，消化不好、腹胀者多练。各做 3-5 遍。'], ['猿戏（主心）', '猿提 + 猿摘。灵活关节、宁心安神，改善注意力与手眼协调。各做 3-5 遍。'], ['鸟戏（主肺）', '鸟伸 + 鸟飞。扩张胸廓、增强肺功能，改善呼吸浅短。各做 3-5 遍。']],
      tips: '要点：形神兼备，模仿神态而非单纯动作。练完静立调息 1 分钟。' },
    paojiao: { name: '泡脚', ico: '🦶', link: '', intro: '中医外治法，借温热与药液刺激足底经络与反射区，温阳散寒、促进循环、安神助眠。',
      items: [['水温与时长', '水温 40-43℃，泡 15-20 分钟，微微出汗即可，忌大汗。水位过脚踝最佳。'], ['最佳时间', '睡前 1 小时、饭后 1 小时后再泡。经期、低血糖、下肢静脉曲张严重者慎用。'], ['加料', '生姜（驱寒）、艾叶（温经）、花椒（祛湿）、盐（杀菌）任选其一，每样一小把。']],
      tips: '泡完立即擦干、穿上袜子保暖；可配合按揉涌泉穴 1 分钟。糖尿病人温度要低、时间要短，避免烫伤。' },
    aiJiu: { name: '艾灸', ico: '🔥', link: '', intro: '用艾绒燃烧温灼穴位，温通经络、扶阳祛寒，适合阳虚、怕冷、易疲劳人群。',
      items: [['足三里', '脾胃保健要穴，膝下 3 寸。每周 2-3 次，每次 10-15 分钟，健脾胃、增免疫。'], ['关元 / 神阙', '腹部培元固本，适合畏寒、痛经、乏力。温和灸，避免烫出水泡。'], ['命门', '后腰正中，补肾壮阳，改善腰膝酸冷。'], ['大椎', '颈部，驱风寒，外感初期灸之可缓解。']],
      tips: '要点：距离皮肤 3-5 厘米、温热不烫；灸后 2 小时不洗澡、避风；高热、阴虚火旺、孕妇腹部腰骶部禁灸。' },
    guaGanJing: { name: '刮肝经', ico: '🌿', link: '', intro: '沿大腿内侧肝经循行部位刮痧/推刮，疏肝理气、解郁降火，适合熬夜、易怒、经期不调者。',
      items: [['部位', '大腿内侧（从腹股沟向膝盖方向），以及两肋。可配合少量精油或刮痧油。'], ['手法', '由轻到重、单向刮拭，每处 20-30 下，出痧（红点）即止，不必强行出重痧。'], ['频率', '每周 1-2 次，同部位痧退后再刮。']],
      tips: '刮后喝温水、4 小时内不洗澡；皮肤破损、凝血障碍、孕妇及经期量大时不做。肝火旺者可配合早睡、少熬夜。' }
  };

  /* ---------------- 每日养生小知识（按日期轮换，怎么不生病/食补/养生茶） ---------------- */
  const HEALTH_TIPS = [
    { t: '脾胃是免疫之本', b: '七分饱、细嚼慢咽，少吃冰饮与甜食。脾胃强，气血足，才不容易反复感冒。' },
    { t: '食补·山药莲子粥', b: '山药健脾、莲子安神，每周喝 3 次，气色与睡眠都会变好。痰湿重可加茯苓。' },
    { t: '养生茶·陈皮茯苓水', b: '陈皮理气、茯苓祛湿，适合早起脸肿、舌苔厚腻的人，温水冲泡代茶饮。' },
    { t: '早睡就是大补', b: '23 点前入睡，肝胆在子时排毒修复。连续一周早睡，黑眼圈与情绪都会改善。' },
    { t: '怕风先护颈背', b: '风从颈后入。换季出门围条薄围巾，空调不对着后颈吹，能少生一半病。' },
    { t: '食补·黑芝麻核桃', b: '黑芝麻补肝肾、核桃益脑，打成粉每天一勺，头发与记性都受益。' },
    { t: '养生茶·枸杞菊花', b: '枸杞养肝、菊花清肝明目，盯屏幕多的人喝它，眼睛没那么干涩。' },
    { t: '每天晒太阳 15 分钟', b: '补阳气、助钙吸收、稳情绪。上午 9-10 点最舒服，别暴晒。' },
    { t: '泡脚引火归元', b: '睡前 40℃ 泡脚 15 分钟，手脚冰凉、睡不踏实的人坚持一周就见效。' },
    { t: '养生茶·生姜红枣', b: '生姜驱寒、红枣补血，经期前后或淋雨后喝一杯，暖身又护宫。' },
    { t: '情绪是隐形药', b: '怒伤肝、思伤脾、忧伤肺。遇事先深呼吸六次，少生病先从少生气开始。' },
    { t: '食补·南瓜小米', b: '南瓜小米粥养胃，胃胀、反酸的人早餐吃它最稳当。' },
    { t: '揉腹通六腑', b: '睡前顺时针揉腹 5 分钟，助消化、促排便，肠鸣胀气都缓解。' },
    { t: '养生茶·玫瑰花', b: '玫瑰疏肝解郁，情绪低落、胸闷胁胀时泡水喝，气顺了人就好看了。' },
    { t: '运动出汗排寒邪', b: '每周 3 次微微出汗的运动（八段锦、快走、瑜伽），比吃补药更防感冒。' },
    { t: '食补·银耳百合', b: '银耳润肺、百合安神，秋燥咽干、睡不安的人炖一碗，皮肤也水润。' },
    { t: '叩齿吞津养肾', b: '晨起叩齿 36 下、津液慢咽，中医称"金津玉液"，固肾健齿。' },
    { t: '养生茶·山楂麦芽', b: '吃撑了来一杯山楂麦芽水，消食化积，比健胃消食片温和。' },
    { t: '梳头百下醒脑', b: '用木梳从前往后梳 100 下，疏通头部经络，头痛昏沉都减轻。' },
    { t: '腹式呼吸安神', b: '吸气鼓腹、呼气收腹，每天 5 分钟，副交感神经激活，焦虑睡不好的人必学。' }
  ];

  /* ---------------- 状态与工具 ---------------- */
  let tab = 'sum';
  let selPosture = 'p1';
  let calY = new Date().getFullYear(), calM = new Date().getMonth();

  const getLogs = () => DB.get('sport.logs', {});
  const setLogs = (v) => DB.set('sport.logs', v);
  const getDone = () => DB.get('sport.done', { gym: {}, posture: {}, health: {} });
  const setDone = (v) => DB.set('sport.done', v);

  function toggleDone(type, key) {
    const d = getDone(); d[type] = d[type] || {};
    const arr = d[type][today()] || [];
    const i = arr.indexOf(key);
    if (i >= 0) arr.splice(i, 1); else arr.push(key);
    d[type][today()] = arr; setDone(d);
  }
  function isDone(type, key) { const d = getDone(); return (d[type] && d[type][today()] || []).indexOf(key) >= 0; }
  function weekNo() { const d = new Date(); const j = new Date(d.getFullYear(), 0, 1); return Math.floor((d - j) / 604800000); }
  function gymTplIdx() { const o = DB.get('sport.gymTpl', null); return o != null ? o : weekNo() % GYM_TEMPLATES.length; }
  function weekDates() {
    const d = new Date(); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd);
    const out = []; for (let i = 0; i < 7; i++) { out.push(ymd(d)); d.setDate(d.getDate() + 1); } return out;
  }
  function dayOfYear() { const d = new Date(); const j = new Date(d.getFullYear(), 0, 0); return Math.floor((d - j) / 86400000); }

  function render(root) {
    tab = DB.get('sport.tab', 'sum');
    root.innerHTML = `
      <div class="tabs sub" id="spTabs" style="margin-bottom:12px;">
        <div class="tab ${tab === 'sum' ? 'active' : ''}" data-t="sum">🏃 汇总打卡</div>
        <div class="tab ${tab === 'pos' ? 'active' : ''}" data-t="pos">🧍 体态矫正</div>
        <div class="tab ${tab === 'gym' ? 'active' : ''}" data-t="gym">💪 增肌塑形</div>
        <div class="tab ${tab === 'health' ? 'active' : ''}" data-t="health">🧘 长寿养生</div>
      </div>
      <div id="spPane"></div>`;
    $$('#spTabs .tab').forEach(el => el.onclick = () => {
      tab = el.dataset.t; DB.set('sport.tab', tab);
      $$('#spTabs .tab').forEach(x => x.classList.toggle('active', x === el));
      paint();
    });
    paint();
  }
  function paint() {
    const p = $('#spPane');
    if (tab === 'sum') renderSum(p);
    else if (tab === 'pos') renderPosture(p);
    else if (tab === 'gym') renderGym(p);
    else renderHealth(p);
  }
  function refreshSumIfOpen() { if (tab === 'sum') { const p = $('#spPane'); if (p) renderSum(p); } }

  /* ============ 汇总打卡 ============ */
  function renderSum(p) {
    const t = today();
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.dumbbell()}</span>今天动了吗 <small>${t} 星期${wdOf(t)}</small></div>
        <div class="chip-group" id="quickSport" style="margin-bottom:9px;">
          ${['跑步', '快走', '骑行', '游泳', '力量训练', '瑜伽', '拉伸', '八段锦', '五禽戏', '跳绳', '羽毛球', '爬山', '通勤步行', '打扫卫生'].map(s => `<button class="chip sm" data-s="${s}">${s}</button>`).join('')}
        </div>
        <div class="row">
          <input class="field grow" id="spName" placeholder="今天做了什么运动">
          <input class="field" id="spMin" type="number" inputmode="numeric" placeholder="分钟" style="width:84px;">
        </div>
        <input class="field" id="spNote" placeholder="感受 / 组数备注（可选）" style="margin-top:8px;">
        <button class="btn block" id="spAdd" style="margin-top:10px;">${Icons.plus()}打卡</button>
      </div>

      <div class="card">
        <div class="stat-row">
          <div class="stat"><div class="v" id="stDays">0</div><div class="k">本月打卡天数</div></div>
          <div class="stat"><div class="v" id="stMins">0</div><div class="k">本月总分钟</div></div>
          <div class="stat"><div class="v" id="stStreak">0</div><div class="k">连续天数</div></div>
        </div>
      </div>

      <div class="card" id="sumProg">
        <div class="card-title"><span class="ci">${Icons.star()}</span>本周计划完成情况 <small>在各板块勾选自动同步</small></div>
        <div id="progBody"></div>
      </div>

      <div class="card tip-card">
        <div class="tip-ico">${HEALTH_TIPS[dayOfYear() % HEALTH_TIPS.length].ico || '🌿'}</div>
        <div class="grow">
          <div class="tip-t">今日养生 · ${HEALTH_TIPS[dayOfYear() % HEALTH_TIPS.length].t}</div>
          <div class="tip-b">${HEALTH_TIPS[dayOfYear() % HEALTH_TIPS.length].b}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>今日记录</div>
        <div id="spToday"></div>
      </div>

      <div class="card">
        <div class="cal-head">
          <button class="cal-nav" id="cpm">‹</button><div class="m" id="spCalT"></div><button class="cal-nav" id="cnm">›</button>
        </div>
        <div class="cal-grid" id="spCal"></div>
        <div class="hint" style="text-align:center;margin-top:7px;">有打卡的日子会亮起小爪印 🐾 点击查看当天记录</div>
      </div>`;

    drawProg();
    $$('#quickSport .chip').forEach(c => c.onclick = () => { $('#spName').value = c.dataset.s; $('#spMin').focus(); });
    $('#spAdd').onclick = () => {
      const n = $('#spName').value.trim();
      if (!n) { toast('写一下做了什么运动'); return; }
      const all = getLogs();
      const arr = all[t] || [];
      arr.push({ id: uid(), name: n, mins: Number($('#spMin').value) || 0, note: $('#spNote').value.trim(), time: nowHM() });
      all[t] = arr; setLogs(all);
      $('#spName').value = ''; $('#spMin').value = ''; $('#spNote').value = '';
      drawSumToday(); drawSpCal(); toast('打卡成功，你真棒！💪');
    };
    $('#cpm').onclick = () => { calM--; if (calM < 0) { calM = 11; calY--; } drawSpCal(); };
    $('#cnm').onclick = () => { calM++; if (calM > 11) { calM = 0; calY++; } drawSpCal(); };
    drawSumToday(); drawSpCal();
  }

  function drawProg() {
    const wd = weekDates(); const gi = gymTplIdx();
    const gymTotal = GYM_TEMPLATES[gi].length * 3;
    const posTotal = DB.get('sport.posture', DEF_POSTURE).length;
    const hTotal = 7 * 3;
    let g = 0, ps = 0, h = 0;
    wd.forEach(d => {
      (getDone().gym[d] || []).forEach(k => { if (k.indexOf('g' + gi + '_') === 0) g++; });
      (getDone().posture[d] || []).forEach(() => { ps++; });
      (getDone().health[d] || []).forEach(k => { if (k.indexOf('h_') === 0) h++; });
    });
    const rows = [
      ['💪 增肌塑形', g, gymTotal],
      ['🧍 体态矫正', ps, posTotal],
      ['🧘 长寿养生', h, hTotal]
    ];
    const pb = $('#progBody');
    if (pb) pb.innerHTML = rows.map(([nm, v, tot]) => {
      const pct = tot ? Math.min(100, Math.round(v / tot * 100)) : 0;
      return `<div class="prog-row"><span class="nm">${nm}</span>
        <div class="pbar"><i style="width:${pct}%"></i></div>
        <span class="pv">${v}/${tot}</span></div>`;
    }).join('');
  }

  function drawSumToday() {
    const t = today();
    const arr = getLogs()[t] || [];
    const box = $('#spToday');
    if (!arr.length) box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.rabbit()}</div>今天还没动～<br>哪怕散步 10 分钟也算数！</div>`;
    else box.innerHTML = arr.map(x => `
      <div class="food-item" data-id="${x.id}">
        <div class="food-ico">🏃</div>
        <div class="grow"><div style="font-size:13px;font-weight:700;">${esc(x.name)}${x.mins ? ` · ${x.mins} 分钟` : ''}</div>
        <div class="hint">${x.time || ''}${x.note ? ' · ' + esc(x.note) : ''}</div></div>
        <span class="todo-del" data-act="del">×</span>
      </div>`).join('');
    box.onclick = (e) => {
      if (e.target.dataset.act !== 'del') return;
      const id = e.target.closest('.food-item').dataset.id;
      const all = getLogs(); all[t] = (all[t] || []).filter(x => x.id !== id);
      if (!all[t].length) delete all[t];
      setLogs(all); drawSumToday(); drawSpCal();
    };
  }

  function drawSpCal() {
    $('#spCalT').textContent = `${calY} 年 ${calM + 1} 月`;
    const logs = getLogs();
    const cells = monthMatrix(calY, calM);
    const t = today();
    let days = 0, mins = 0;
    let html = WD.map(w => `<div class="cal-w">${w}</div>`).join('');
    cells.forEach(d => {
      if (!d) { html += `<div class="cal-d blank"></div>`; return; }
      const arr = logs[d];
      if (arr && arr.length) { days++; mins += arr.reduce((a, b) => a + Number(b.mins || 0), 0); }
      html += `<div class="cal-d ${d === t ? 'today' : ''}" data-d="${d}">
        ${parseYMD(d).getDate()}${arr && arr.length ? `<span class="mini">🐾${arr.reduce((a, b) => a + Number(b.mins || 0), 0) || ''}</span>` : ''}</div>`;
    });
    $('#spCal').innerHTML = html;
    $('#stDays').textContent = days; $('#stMins').textContent = mins;
    let streak = 0; const d = new Date();
    for (; ;) {
      const k = ymd(d);
      if (logs[k] && logs[k].length) { streak++; d.setDate(d.getDate() - 1); }
      else break;
      if (streak > 999) break;
    }
    $('#stStreak').textContent = streak;
    $$('#spCal .cal-d[data-d]').forEach(c => c.onclick = () => {
      const arr = logs[c.dataset.d] || [];
      modal.open(c.dataset.d + ' 的运动', arr.length
        ? arr.map(x => `<div class="rec-item"><div class="rec-ico">🏃</div><div class="rec-main"><div class="t">${esc(x.name)}${x.mins ? ' · ' + x.mins + '分钟' : ''}</div><div class="s">${esc(x.note || '')}</div></div></div>`).join('')
        : `<div class="empty"><div class="e-ico">${Icons.empty()}</div>这天没有记录</div>`);
    });
  }

  /* ============ 体态矫正 ============ */
  function renderPosture(p) {
    let list = DB.get('sport.posture', null);
    if (!list) { list = DEF_POSTURE; DB.set('sport.posture', list); }
    const cur = list.find(x => x.id === selPosture) || list[0];
    selPosture = cur ? cur.id : null;
    const donePosture = getDone().posture[today()] || [];
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.sheep()}</span>今日体态打卡 <small>勾选今天练过的</small></div>
        <div id="posTicks"></div>
        <div class="hint" style="margin-top:5px;">勾选会自动同步到「汇总打卡 · 本周计划完成情况」</div>
      </div>
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.sheep()}</span>体态自查与矫正 <small>左选问题 · 右写方案</small></div>
        <div style="display:grid;grid-template-columns:96px 1fr;gap:9px;">
          <div id="posList" style="max-height:420px;overflow-y:auto;"></div>
          <div>
            <input class="field" id="posName" value="${cur ? esc(cur.problem) : ''}" placeholder="体态问题名称" style="margin-bottom:7px;font-weight:800;">
            <textarea class="field" id="posPlan" style="min-height:250px;" placeholder="写下你的矫正方案：成因、动作、组数、频率…">${cur ? esc(cur.plan) : ''}</textarea>
            <div class="row" style="margin-top:8px;">
              <button class="btn ghost sm grow" id="posDel">删除</button>
              <button class="btn sm grow" id="posSave">保存方案</button>
            </div>
          </div>
        </div>
        <button class="btn ghost block sm" id="posAdd" style="margin-top:9px;">${Icons.plus()}新增一个体态问题</button>
      </div>
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>通用小贴士</div>
        <ul class="bullet">
          <li>体态矫正 = 放松紧张肌 + 激活无力肌 + 重建日常习惯，三步缺一不可。</li>
          <li>频率比强度重要：每天 10 分钟，坚持 6 周才看得到变化。</li>
          <li>久坐每 45 分钟起身活动 2 分钟，比周末狂练一次有用。</li>
          <li>疼痛、麻木、明显不对称，请先去康复科/骨科做专业评估。</li>
        </ul>
      </div>`;

    $('#posTicks').innerHTML = list.map(x => `
      <label class="wp-item ${donePosture.includes(x.id) ? 'wp-done' : ''}">
        <span class="wp-txt">${esc(x.problem)}</span>
        <span class="tick ${donePosture.includes(x.id) ? 'on' : ''}" data-key="p_${x.id}"></span>
      </label>`).join('');
    $$('#posTicks .tick').forEach(el => el.onclick = (e) => {
      e.preventDefault();
      toggleDone('posture', el.dataset.key);
      const on = isDone('posture', el.dataset.key);
      el.classList.toggle('on', on);
      el.closest('.wp-item').classList.toggle('wp-done', on);
      drawProg();
    });

    const drawList = () => {
      const l = DB.get('sport.posture', []);
      $('#posList').innerHTML = l.map(x => `
        <div class="chip ${x.id === selPosture ? 'on' : ''}" data-id="${x.id}"
          style="display:block;width:100%;text-align:left;margin-bottom:5px;padding:8px 8px;line-height:1.35;">${esc(x.problem)}</div>`).join('');
      $$('#posList .chip').forEach(c => c.onclick = () => { selPosture = c.dataset.id; renderPosture(p); });
    };
    drawList();

    $('#posSave').onclick = () => {
      const l = DB.get('sport.posture', []);
      const i = l.findIndex(x => x.id === selPosture);
      if (i < 0) return;
      l[i].problem = $('#posName').value.trim() || l[i].problem;
      l[i].plan = $('#posPlan').value;
      DB.set('sport.posture', l); renderPosture(p); toast('方案已保存');
    };
    $('#posDel').onclick = async () => {
      if (!(await confirmBox('删除这个体态问题及方案？'))) return;
      const l = DB.get('sport.posture', []).filter(x => x.id !== selPosture);
      DB.set('sport.posture', l); selPosture = l[0] ? l[0].id : null; renderPosture(p); toast('已删除');
    };
    $('#posAdd').onclick = () => {
      const l = DB.get('sport.posture', []);
      const id = uid();
      l.push({ id, problem: '新的体态问题', plan: '' });
      DB.set('sport.posture', l); selPosture = id; renderPosture(p);
    };
  }

  /* ============ 增肌塑形 ============ */
  function renderGym(p) {
    const gi = gymTplIdx();
    const tpl = GYM_TEMPLATES[gi];
    const ti = todayIdx();
    const doneGym = getDone().gym[today()] || [];
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.dumbbell()}</span>本周训练排班 <small>第 ${gi + 1} 套 · 每周自动轮换</small>
          <button class="btn ghost sm" id="gShuffle" style="float:right;margin-top:-2px;">${Icons.dice()}换一套</button></div>
        <div id="gymList"></div>
        <div class="hint" style="margin-top:6px;">建议：同一肌群间隔 48 小时；每个动作留 1-2 次 RIR（力竭余量）；蛋白质每天每公斤体重 1.6g。勾选完成的动作会同步到汇总。</div>
      </div>
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.star()}</span>增肌要点 & 吃什么</div>
        <div class="acc open" data-a="1"><div class="acc-h">🍗 增肌饮食原则<span class="ar">▾</span></div>
          <div class="acc-b">· 蛋白质 1.6–2.2 g/kg/天：鸡胸、牛肉、鱼虾、蛋、豆腐、希腊酸奶、乳清蛋白。\n· 碳水是训练燃料：粗粮为主（燕麦、红薯、糙米），训练前后适量快碳（香蕉、白米饭）。\n· 脂肪别省：坚果、牛油果、橄榄油，占总热量 20–30%。\n· 每天喝水 2–3L，训练日多加 500ml。\n· 可考虑： creatine 肌酸 3–5g/天（需持续、多饮水），维生素 D 视情况补。</div></div>
        <div class="acc" data-a="2"><div class="acc-h">⚠️ 增肌注意事项<span class="ar">▾</span></div>
          <div class="acc-b">· 渐进超负荷：每周试着加一点重量或次数，肌肉才会长。\n· 动作质量 > 重量：宁轻勿歪，避免借力代偿伤关节。\n· 睡眠 7–9 小时，肌肉在休息时合成。\n· 出现持续关节疼、头晕、过度训练（心率高、情绪低落）= 该休息。\n· 女生不必怕练粗，睾酮低很难，力量训练只会让线条更好看。</div></div>
        <div class="acc" data-a="3"><div class="acc-h">🧘 芭杆运动 / 瑜伽 怎么练<span class="ar">▾</span></div>
          <div class="acc-b">· 芭杆（Barre）：把杆辅助的小幅孤立动作，提踵、外开、plié，塑形+体态+核心，低冲击适合每天。\n· 瑜伽：练前做拜日热身，练后做婴儿式/摊尸式放松；柔韧与呼吸同练，缓解增肌的僵硬。\n· 两者都可作为力量日的"主动恢复"，减少受伤。</div></div>
        <div class="acc" data-a="4"><div class="acc-h">🫃 减脂期怎么吃<span class="ar">▾</span></div>
          <div class="acc-b">· 热量缺口 300–500 kcal 即可，不要极端。\n· 蛋白质维持高位（保肌肉），碳水优先练后吃。\n· 每周体重降 0.5–1% 为健康速度，掉太快容易掉肌肉。</div></div>
      </div>`;

    $('#gymList').innerHTML = tpl.map((s, i) => `
      <div class="plan-day ${i === ti ? 'today' : ''}">
        <div class="pd">${DAYS[i].replace('周', '')}</div>
        <div class="grow">
          <div style="font-size:13px;font-weight:800;margin-bottom:5px;">${esc(s.theme)}${i === ti ? ' <span class="tag t-fast">今天</span>' : ''}</div>
          ${s.items.map((it, si) => { const key = 'g' + gi + '_' + i + '_' + si; const on = doneGym.indexOf(key) >= 0; return `
            <label class="wp-item ${on ? 'wp-done' : ''}">
              <span class="wp-key">${'abc'[si]}</span>
              <span class="wp-txt">${esc(it)}</span>
              <span class="tick ${on ? 'on' : ''}" data-key="${key}"></span>
            </label>`; }).join('')}
        </div>
      </div>`).join('');
    $$('#gymList .tick').forEach(el => el.onclick = (e) => {
      e.preventDefault();
      toggleDone('gym', el.dataset.key);
      const on = isDone('gym', el.dataset.key);
      el.classList.toggle('on', on);
      el.closest('.wp-item').classList.toggle('wp-done', on);
      drawProg();
    });
    $$('#spPane .acc').forEach(a => a.querySelector('.acc-h').onclick = () => a.classList.toggle('open'));
    $('#gShuffle').onclick = () => {
      DB.set('sport.gymTpl', (gymTplIdx() + 1) % GYM_TEMPLATES.length);
      renderGym(p); toast('已换一套本周排班');
    };
  }

  /* ============ 长寿养生 ============ */
  function renderHealth(p) {
    let plan = DB.get('sport.healthPlan', null);
    if (!plan) { plan = DEF_HEALTH_PLAN; DB.set('sport.healthPlan', plan); }
    const ti = todayIdx();
    const doneH = getDone().health[today()] || [];
    p.innerHTML = `
      <div class="card">
        <div class="card-title"><span class="ci">${Icons.panda()}</span>一周养生排班 <small>每天 a/b/c，点圆圈打卡</small></div>
        <div id="hpList"></div>
        <div class="hint" style="margin-top:6px;">排班原则：八段锦 + 五禽戏 + 拍八虚 打底，穿插泡脚 / 艾灸 / 刮肝经。打卡会同步到汇总「本周计划完成情况」。</div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.book()}</span>知识讲堂 <small>养生方法库 · 可加链接</small>
          <button class="btn ghost sm" id="kAdd" style="float:right;margin-top:-2px;">${Icons.plus()}新增</button></div>
        <div id="libBox"></div>
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.heart()}</span>日常养生小事</div>
        <ul class="bullet">
          <li>晨起一杯温水，睡前 40℃ 泡脚 15 分钟。</li>
          <li>子时（23:00 前）入睡，午时小憩 20 分钟。</li>
          <li>饭吃七分饱，细嚼 20 下再咽。</li>
          <li>每天梳头 100 下、揉腹 5 分钟、搓耳 1 分钟。</li>
          <li>情志养生：怒伤肝、思伤脾，遇事先深呼吸六次。</li>
        </ul>
      </div>`;

    const drawPlan = () => {
      const pl = DB.get('sport.healthPlan', []);
      const dn = getDone().health[today()] || [];
      $('#hpList').innerHTML = pl.map((x, i) => `
        <div class="plan-day ${i === ti ? 'today' : ''}">
          <div class="pd">${DAYS[i].replace('周', '')}</div>
          <div class="grow">
            ${x.items.map((it, si) => { const key = 'h_' + i + '_' + si; const on = dn.indexOf(key) >= 0; return `
              <label class="wp-item ${on ? 'wp-done' : ''}">
                <span class="wp-key">${'abc'[si]}</span>
                <span class="wp-txt">${esc(it)}</span>
                <span class="tick ${on ? 'on' : ''}" data-key="${key}"></span>
              </label>`; }).join('')}
          </div>
        </div>`).join('');
      $$('#hpList .tick').forEach(el => el.onclick = (e) => {
        e.preventDefault();
        toggleDone('health', el.dataset.key);
        const on = isDone('health', el.dataset.key);
        el.classList.toggle('on', on);
        el.closest('.wp-item').classList.toggle('wp-done', on);
        drawProg();
      });
      $$('#hpList .plan-day .grow').forEach((g, i) => g.ondblclick = () => editHealth(i));
    };
    drawPlan();

    function editHealth(i) {
      const pl = DB.get('sport.healthPlan', []);
      modal.open(DAYS[i] + ' 养生安排', `
        <span class="lbl">每行一项（a/b/c）</span>
        <textarea class="field" id="hpTxt" style="min-height:130px;">${esc(pl[i].items.join('\n'))}</textarea>
        <button class="btn block" id="hpSave" style="margin-top:12px;">保存</button>`, (b) => {
        $('#hpSave', b).onclick = () => {
          pl[i].items = $('#hpTxt', b).value.split('\n').map(x => x.trim()).filter(Boolean);
          DB.set('sport.healthPlan', pl); modal.close(); drawPlan(); toast('已保存');
        };
      });
    }

    /* 知识讲堂 */
    const userLib = DB.get('sport.knowledge', []);
    const allLib = Object.assign({}, HEALTH_LIB, {});
    let libHtml = Object.keys(HEALTH_LIB).map(k => libCard(HEALTH_LIB[k])).join('');
    if (userLib.length) libHtml += userLib.map(k => libCard(k, true)).join('');
    $('#libBox').innerHTML = libHtml;
    $$('#libBox .acc').forEach(a => a.querySelector('.acc-h').onclick = () => a.classList.toggle('open'));
    $$('#libBox .klink').forEach(b => b.onclick = () => {
      const u = b.dataset.u; if (u) window.open(u, '_blank', 'noopener');
    });
    $$('#libBox .kdel').forEach(b => b.onclick = async () => {
      if (!(await confirmBox('删除这个养生方法？'))) return;
      const arr = DB.get('sport.knowledge', []).filter(x => x.id !== b.dataset.id);
      DB.set('sport.knowledge', arr); renderHealth(p); toast('已删除');
    });

    function libCard(L, isUser) {
      return `<div class="acc" data-k="${isUser ? L.id : L.name}">
        <div class="acc-h">${L.ico || '🌿'} ${esc(L.name)}
          ${L.link ? `<span class="klink" data-u="${esc(L.link)}">打开链接 ↗</span>` : ''}
          ${isUser ? `<span class="kdel" data-id="${L.id}">删除</span>` : ''}
          <span class="ar">▾</span></div>
        <div class="acc-b">${esc(L.intro || '')}
${L.items ? L.items.map(([n, d]) => `\n▸ <b>${esc(n)}</b>\n${esc(d)}`).join('\n') : ''}
${L.tips ? '\n\n💡 ' + esc(L.tips) : ''}</div>
      </div>`;
    }

    $('#kAdd').onclick = () => {
      modal.open('新增养生方法', `
        <span class="lbl">名称</span>
        <input class="field" id="nkName" placeholder="如：拍打胆经">
        <span class="lbl" style="margin-top:8px;">说明（可选）</span>
        <textarea class="field" id="nkIntro" style="min-height:80px;" placeholder="一句话介绍做法与好处"></textarea>
        <span class="lbl" style="margin-top:8px;">链接（可选，可跳转到文章/视频）</span>
        <input class="field" id="nkLink" placeholder="https://...">
        <button class="btn block" id="nkSave" style="margin-top:12px;">保存</button>`, (b) => {
        $('#nkSave', b).onclick = () => {
          const name = $('#nkName', b).value.trim();
          if (!name) { toast('写个名称吧'); return; }
          const arr = DB.get('sport.knowledge', []);
          arr.push({ id: uid(), name, ico: '🌟', intro: $('#nkIntro', b).value.trim(), items: [], tips: '', link: $('#nkLink', b).value.trim() });
          DB.set('sport.knowledge', arr); modal.close(); renderHealth(p); toast('已添加，可点链接跳转');
        };
      });
    };
  }

  window.Modules = window.Modules || {};
  window.Modules.sport = { id: 'sport', name: '运动养生', desc: '兔兔陪你蹦跶起来', icon: 'rabbit', render };
})();
