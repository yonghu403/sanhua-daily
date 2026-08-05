/* ===== 模块 8：影视文娱 ===== */
(function () {
  const { $, $$, esc, uid, today, niceDate, toast, modal, confirmBox, promptBox, pickImage } = UI;

  const TYPE_EMO = { '动漫': '📺', '综艺': '🎤', '电影': '🎬', '剧集': '🎞', '纪录': '🐾' };
  const emoOf = (t) => TYPE_EMO[t] || '🎬';

  // 默认 TMDB v3 Key（你已申请：联网即显示真实中文海报）；设置里可覆盖
  const DEFAULT_TMDB_KEY = '8ea047f84452f7bdb9cd5e9e7bfcdb67';
  try { if (!DB.get('pref.tmdbKey', '')) DB.set('pref.tmdbKey', DEFAULT_TMDB_KEY); } catch (e) {}

  // ===== 剧集封面系统 =====
  // 联网时：尝试从海报源获取真实封面；离线时：生成仿视频平台风格的精美占位卡
  const POSTER_COLORS = {
    '动漫': { from: '#7B68EE', to: '#FF69B4', accent: '#E8D0FF' },
    '综艺': { from: '#FF6B35', to: '#F7C948', accent: '#FFF0D4' },
    '电影': { from: '#1A1A2E', to: '#16213E', accent: '#0F3460' },
    '剧集': { from: '#2E86AB', to: '#A23B72', accent: '#F18F01' },
    '纪录': { from: '#2D6A4F', to: '#40916C', accent: '#B7E4C7' }
  };
  const defaultColor = { from: '#667eea', to: '#764ba2', accent: '#e0c3fc' };

  function posterColor(type) { return POSTER_COLORS[type] || defaultColor; }

  // 生成仿爱奇艺/腾讯视频风格的 SVG 封面（离线兜底 + 默认展示）
  function genPoster(it) {
    const c = posterColor(it.type);
    const emo = emoOf(it.type);
    // 根据类型选不同装饰图案
    let decor = '';
    if (it.type === '动漫') {
      decor = `<circle cx="280" cy="40" r="60" fill="white" opacity="0.06"/><circle cx="20" cy="380" r="80" fill="white" opacity="0.04"/>`;
    } else if (it.type === '综艺') {
      decor = `<polygon points="260,30 300,90 220,90" fill="white" opacity="0.07"/><polygon points="40,350 90,420 10,420" fill="white" opacity="0.05"/>`;
    } else {
      decor = `<rect x="240" y="20" width="70" height="70" rx="12" fill="white" opacity="0.05" transform="rotate(15 275 55)"/>
               <rect x="-10" y="340" width="80" height="80" rx="12" fill="white" opacity="0.04" transform="rotate(-10 30 380)"/>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.from}"/>
          <stop offset="100%" stop-color="${c.to}"/>
        </linearGradient>
        <linearGradient id="pgo" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(0,0,0,0)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,0.55)"/>
        </linearGradient>
      </defs>
      <rect width="300" height="420" rx="12" fill="url(#pg)"/>
      ${decor}
      <!-- 底部渐变遮罩 -->
      <rect y="280" width="300" height="140" fill="url(#pgo)" rx="12"/>
      <!-- 类型标签 -->
      <rect x="14" y="340" width="46" height="22" rx="6" fill="rgba(255,255,255,0.25)"/>
      <text x="37" y="355" text-anchor="middle" fill="white" font-size="11" font-family="system-ui">${it.type || ''}</text>
      <!-- 热度角标 -->
      ${it.hot ? `<rect x="240" y="14" width="46" height="22" rx="6" fill="rgba(255,215,0,0.85)"/>
        <text x="263" y="29" text-anchor="middle" fill="#333" font-size="11" font-weight="700" font-family="system-ui">${it.hot}</text>` : ''}
      <!-- 标题 -->
      <text x="150" y="378" text-anchor="middle" fill="white" font-size="18" font-weight="700" font-family="system-ui,sans-serif">${(it.title || '').length > 10 ? (it.title || '').slice(0, 10) + '…' : (it.title || '')}</text>
      <!-- 中央大图标 -->
      <text x="150" y="210" text-anchor="middle" font-size="72" opacity="0.3">${emo}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ===== 联网真实封面 =====
  // 优先 TMDB（填了免费 Key 后中文剧名也能出真实海报）→ 退化 TVmaze（英文名更全）→ 生成的占位卡
  async function fetchCoverUrl(title) {
    if (!title) return null;
    const key = DB.get('pref.tmdbKey', '') || DEFAULT_TMDB_KEY;
    if (key) {
      try {
        const q = encodeURIComponent(title);
        const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${encodeURIComponent(key)}&language=zh-CN&query=${q}`);
        if (res.ok) {
          const data = await res.json();
          const results = (data && data.results) || [];
          const r = results.find(x => x.media_type === 'tv' || x.media_type === 'movie') || results[0];
          if (r && r.poster_path) return `https://image.tmdb.org/t/p/w300${r.poster_path}`;
        }
      } catch (e) { /* 落到 TVmaze */ }
    }
    try {
      const q = encodeURIComponent(title);
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${q}`);
      if (res.ok) {
        const arr = await res.json();
        if (Array.isArray(arr) && arr.length) {
          const hit = arr.find(d => d.show && d.show.name === title) || arr[0];
          const img = hit && hit.show && hit.show.image;
          if (img && (img.medium || img.original)) return img.original || img.medium;
        }
      }
    } catch (e) {}
    return null;
  }

  // 异步增强：联网后把生成的占位卡替换为真实海报，并缓存 URL
  async function enhanceCovers(box) {
    if (!navigator.onLine) return;
    const cards = box ? $$('.mcard', box) : $$('.mcard');
    for (const card of cards) {
      const img = card.querySelector('.mimg');
      if (!img || img.dataset.enhanced) continue;
      img.dataset.enhanced = '1';
      const id = card.dataset.id;
      const it = allItems().find(x => x.id === id);
      if (!it || it.img) continue;            // 用户自定义图已优先
      const url = await fetchCoverUrl(it.title || '');
      if (url) {
        try { it.online = url; setRecs(getRecs()); } catch (e) {}
        img.src = url;                         // 直接显示真实海报
      }
    }
  }

  // 初始封面：用户图 > 已缓存的联网图(在线时) > 生成的精美占位
  function coverOf(it) {
    if (it.img) return it.img;
    if (navigator.onLine && it.online) return it.online;
    return genPoster(it);
  }

  const getRecs = () => DB.get('media.recs', null);
  const setRecs = (v) => DB.set('media.recs', v);
  const getReviews = () => DB.get('media.reviews', []);
  const setReviews = (v) => DB.set('media.reviews', v);

  // 分类词条：每个词条下约 10 部作品推荐（示例种子，可自由增删）
  const SEED_CATS = [
    { cat: '搞笑', emoji: '😂', items: [
      { id: 'a1', title: '齐木楠雄的灾难', type: '动漫', tag: '吐槽·日常', hot: 9.2, desc: '只想低调却处处翻车的超能力者。' },
      { id: 'a2', title: '碧蓝之海', type: '动漫', tag: '爆笑·社团', hot: 9.0, desc: '潜水社的醉酒爆笑日常。' },
      { id: 'a3', title: '武林外传', type: '剧集', tag: '情景喜剧', hot: 9.3, desc: '同福客栈的众生相。' },
      { id: 'a4', title: '快乐再出发', type: '综艺', tag: '友情·慢综', hot: 9.1, desc: '几个老友的穷游，笑中带泪。' },
      { id: 'a5', title: '一年一度喜剧大赛', type: '综艺', tag: '新喜剧', hot: 8.8, desc: '新喜剧人的脑洞舞台。' },
      { id: 'a6', title: '西虹市首富', type: '电影', tag: '荒诞', hot: 8.3, desc: '突然暴富的荒诞喜剧。' },
      { id: 'a7', title: '爱情公寓', type: '剧集', tag: '合租', hot: 8.4, desc: '一幢公寓的爆笑合租生活。' },
      { id: 'a8', title: '唐人街探案', type: '电影', tag: '喜剧·悬疑', hot: 8.5, desc: '搞笑与推理的混搭。' },
      { id: 'a9', title: '日常', type: '动漫', tag: '平凡·荒诞', hot: 8.7, desc: '平凡到荒诞的高中生活。' }
    ] },
    { cat: '爱情', emoji: '💕', items: [
      { id: 'b1', title: '你的名字', type: '电影', tag: '奇幻·纯爱', hot: 9.4, desc: '跨越时空的羁绊。' },
      { id: 'b2', title: '月色真美', type: '动漫', tag: '校园纯爱', hot: 9.0, desc: '纯爱教科书级演出。' },
      { id: 'b3', title: '情书', type: '电影', tag: '暗恋·温柔', hot: 9.1, desc: '关于暗恋的温柔告白。' },
      { id: 'b4', title: '堀与宫村', type: '动漫', tag: '校园甜恋', hot: 8.9, desc: '表面反差下的甜恋。' },
      { id: 'b5', title: '我可能不会爱你', type: '剧集', tag: '都市暧昧', hot: 9.0, desc: '暧昧与成长的拉扯。' },
      { id: 'b6', title: '怦然心动', type: '电影', tag: '青春', hot: 8.9, desc: '少年少女的青春悸动。' },
      { id: 'b7', title: '偷偷藏不住', type: '剧集', tag: '甜宠', hot: 8.6, desc: '甜到上头的暗恋。' },
      { id: 'b8', title: '爱在黎明破晓前', type: '电影', tag: '文艺', hot: 8.8, desc: '一夜的对话与心动。' },
      { id: 'b9', title: '月刊少女野崎君', type: '动漫', tag: '反套路', hot: 8.7, desc: '恋爱喜剧的反套路。' }
    ] },
    { cat: '悬疑', emoji: '🔍', items: [
      { id: 'c1', title: '漫长的季节', type: '剧集', tag: '跨年代谜案', hot: 9.4, desc: '跨越几十年的真相交织。' },
      { id: 'c2', title: '隐秘的角落', type: '剧集', tag: '暗黑', hot: 9.2, desc: '三个孩子与一个秘密。' },
      { id: 'c3', title: '异度侵入 ID:INVADED', type: '动漫', tag: '烧脑', hot: 9.2, desc: '潜入杀意者的内心世界。' },
      { id: 'c4', title: '沉默的真相', type: '剧集', tag: '现实', hot: 9.1, desc: '追寻真相的代价。' },
      { id: 'c5', title: '看不见的客人', type: '电影', tag: '反转', hot: 9.0, desc: '反转再反转的密室。' },
      { id: 'c6', title: '开端', type: '剧集', tag: '时间循环', hot: 8.7, desc: '公交车上的无限循环。' },
      { id: 'c7', title: '死亡笔记', type: '动漫', tag: '天才对决', hot: 9.0, desc: '两个天才的极致博弈。' },
      { id: 'c8', title: '禁闭岛', type: '电影', tag: '心理', hot: 8.8, desc: '真假难辨的孤岛。' },
      { id: 'c9', title: '名侦探柯南', type: '动漫', tag: '经典推理', hot: 8.5, desc: '真相永远只有一个。' }
    ] },
    { cat: '治愈', emoji: '🌿', items: [
      { id: 'd1', title: '葬送的芙莉莲', type: '动漫', tag: '奇幻·治愈', hot: 9.6, desc: '魔法旅途后的温柔长篇。' },
      { id: 'd2', title: '夏目友人帐', type: '动漫', tag: '妖怪·温情', hot: 9.3, desc: '妖怪与人之间的羁绊。' },
      { id: 'd3', title: '小森林', type: '电影', tag: '慢生活', hot: 9.0, desc: '自给自足的田园四季。' },
      { id: 'd4', title: '人生果实', type: '纪录', tag: '生活', hot: 9.1, desc: '一对老人的庭院人生。' },
      { id: 'd5', title: '白兔糖', type: '动漫', tag: '父女', hot: 8.9, desc: '大叔与小女孩的日常。' },
      { id: 'd6', title: '去有风的地方', type: '剧集', tag: '田园', hot: 8.6, desc: '大理慢生活的治愈。' },
      { id: 'd7', title: '工作细胞', type: '动漫', tag: '科普', hot: 8.8, desc: '把身体里的细胞拟人化。' },
      { id: 'd8', title: '樱桃小丸子', type: '动漫', tag: '童真', hot: 8.7, desc: '最朴素的童真日常。' },
      { id: 'd9', title: '非人哉', type: '动漫', tag: '神仙打工', hot: 8.5, desc: '神仙们的现代打工记。' }
    ] },
    { cat: '热血', emoji: '🔥', items: [
      { id: 'e1', title: '排球少年', type: '动漫', tag: '运动', hot: 9.4, desc: '向顶峰跃起的青春。' },
      { id: 'e2', title: '灌篮高手', type: '动漫', tag: '运动', hot: 9.2, desc: '永远的热血篮球。' },
      { id: 'e3', title: '进击的巨人', type: '动漫', tag: '史诗', hot: 9.1, desc: '为自由而战的执念。' },
      { id: 'e4', title: '海贼王', type: '动漫', tag: '冒险', hot: 9.0, desc: '驶向大航海的梦想。' },
      { id: 'e5', title: '强风吹拂', type: '动漫', tag: '长跑', hot: 9.0, desc: '箱根驿传的接力热血。' },
      { id: 'e6', title: '摔跤吧爸爸', type: '电影', tag: '励志', hot: 9.0, desc: '父女共同的追梦路。' },
      { id: 'e7', title: '一拳超人', type: '动漫', tag: '反差', hot: 8.9, desc: '一拳解决所有烦恼。' },
      { id: 'e8', title: '火影忍者', type: '动漫', tag: '羁绊', hot: 8.8, desc: '绝不放弃的忍道。' },
      { id: 'e9', title: '飞驰人生', type: '电影', tag: '赛车', hot: 8.4, desc: '老车手的热血回归。' }
    ] },
    { cat: '科幻', emoji: '🚀', items: [
      { id: 'f1', title: '星际穿越', type: '电影', tag: '太空', hot: 9.4, desc: '爱与时空的尺度。' },
      { id: 'f2', title: '攻壳机动队', type: '动漫', tag: '赛博', hot: 9.1, desc: '义体与灵魂的追问。' },
      { id: 'f3', title: '命运石之门', type: '动漫', tag: '时间线', hot: 9.2, desc: '在时间线间狂奔。' },
      { id: 'f4', title: '银翼杀手2049', type: '电影', tag: '赛博', hot: 9.0, desc: '复制人的自我追问。' },
      { id: 'f5', title: '三体', type: '剧集', tag: '硬科幻', hot: 8.7, desc: '宇宙社会学的宏大。' },
      { id: 'f6', title: '降临', type: '电影', tag: '语言', hot: 8.8, desc: '语言即思维的边界。' },
      { id: 'f7', title: '心理测量者', type: '动漫', tag: '反乌托邦', hot: 8.9, desc: '系统与自由意志。' },
      { id: 'f8', title: '灵笼', type: '动漫', tag: '末世', hot: 8.6, desc: '末世求生的灯塔。' },
      { id: 'f9', title: '雪国列车', type: '电影', tag: '末日', hot: 8.3, desc: '永动列车上的阶级。' }
    ] },
    { cat: '美食', emoji: '🍜', items: [
      { id: 'g1', title: '孤独的美食家', type: '剧集', tag: '一人食', hot: 9.0, desc: '一个人吃饭的幸福。' },
      { id: 'g2', title: '风味人间', type: '纪录', tag: '全球风味', hot: 9.2, desc: '脚下的风味地图。' },
      { id: 'g3', title: '人生一串', type: '纪录', tag: '烧烤', hot: 9.3, desc: '深夜里的烧烤江湖。' },
      { id: 'g4', title: '食戟之灵', type: '动漫', tag: '料理对决', hot: 8.9, desc: '料理人的巅峰对决。' },
      { id: 'g5', title: '寿司之神', type: '纪录', tag: '匠人', hot: 9.0, desc: '一生只做一件事。' },
      { id: 'g6', title: '饮食男女', type: '电影', tag: '家宴', hot: 8.8, desc: '餐桌上的家庭温情。' },
      { id: 'g7', title: '中华小当家', type: '动漫', tag: '中华料理', hot: 8.4, desc: '中华料理的魂。' },
      { id: 'g8', title: '街头美食斗士', type: '纪录', tag: '街头', hot: 8.7, desc: '世界各地的街头滋味。' },
      { id: 'g9', title: '小森林', type: '电影', tag: '自给自足', hot: 9.0, desc: '自己种自己吃。' }
    ] },
    { cat: '综艺', emoji: '🎤', items: [
      { id: 'h1', title: '快乐再出发', type: '综艺', tag: '友情', hot: 9.1, desc: '老友穷游笑中带泪。' },
      { id: 'h2', title: '种地吧', type: '综艺', tag: '劳作', hot: 8.9, desc: '十个年轻人的真实种地。' },
      { id: 'h3', title: '一年一度喜剧大赛', type: '综艺', tag: '喜剧', hot: 8.8, desc: '新喜剧的舞台。' },
      { id: 'h4', title: '向往的生活', type: '综艺', tag: '慢综', hot: 8.7, desc: '蘑菇屋的慢生活。' },
      { id: 'h5', title: '名侦探学院', type: '综艺', tag: '脑力', hot: 8.8, desc: '好友间的脑力游戏。' },
      { id: 'h6', title: '声生不息', type: '综艺', tag: '音乐', hot: 8.7, desc: '港乐之夜的合唱。' },
      { id: 'h7', title: '五十公里桃花坞', type: '综艺', tag: '社交', hot: 8.5, desc: '一场社交实验。' },
      { id: 'h8', title: '中餐厅', type: '综艺', tag: '开店', hot: 8.4, desc: '海外开中餐馆。' },
      { id: 'h9', title: '你好生活', type: '综艺', tag: '治愈旅行', hot: 8.6, desc: '在路上找回生活。' }
    ] }
  ];

  function ensureSeed() {
    if (!DB.get('media.recs', null)) setRecs(JSON.parse(JSON.stringify(SEED_CATS)));
  }

  let curCat = '全部';
  // 最新推荐：折叠 / 筛选状态（折叠状态持久化）
  let recCollapsed = DB.get('pref.mediaRecCollapsed', false);
  let recType = '全部';      // 剧集类型：动漫/综艺/电影/剧集/纪录
  let recLimit = 12;         // 显示个数，0 = 全部
  // 我的点评：筛选状态
  let revTime = 'all';       // all | month | 3m | year | 具体年份
  let revType = '全部';

  function totalCount() { return getRecs().reduce((s, c) => s + c.items.length, 0); }
  function allItems() { return getRecs().flatMap(c => c.items); }
  function itemsOf(cat) { return cat === '全部' ? allItems() : (getRecs().find(c => c.cat === cat) || { items: [] }).items; }
  // 应用「分类 + 类型」筛选后的完整结果（未截断）
  function filteredItems() {
    let arr = itemsOf(curCat);
    if (recType !== '全部') arr = arr.filter(it => it.type === recType);
    return arr;
  }

  function render(root) {
    ensureSeed();
    const cats = getRecs();
    root.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg,#FCEFE2,#F7F1E4);border-color:#F0D8C2;">
        <div class="card-title"><span class="ci">${Icons.tv()}</span>影视文娱</div>
        <div class="hint" style="line-height:1.75;">追番、看综艺、刷电影，把心动的安利和你的点评都收在这里。上面按<b>分类词条</b>整理了热门推荐（联网时自动显示封面图），下面是你的私人片单与心得。</div>
      </div>

      <div class="card">
        <div class="card-title" style="display:flex;align-items:center;">
          <span class="ci">${Icons.star()}</span>最新推荐 <small>${totalCount()} 部</small>
          <button class="chip sm" id="recToggle" style="margin-left:auto;font-weight:700;">${recCollapsed ? '▶ 展开' : '▼ 收起'}</button>
        </div>
        <div id="recBody" style="${recCollapsed ? 'display:none;' : ''}">
          <div class="hint" style="margin-bottom:4px;font-size:.74rem;">🗂 观看分类</div>
          <div class="chip-group" id="catGrp" style="margin-bottom:9px;"></div>
          <div class="row" style="gap:6px;margin-bottom:9px;flex-wrap:wrap;align-items:center;">
            <select class="field" id="recTypeSel" style="flex:1;min-width:104px;padding:6px 8px;font-size:.82rem;">
              <option value="全部">🎬 全部类型</option>
              ${Object.keys(TYPE_EMO).map(t => `<option value="${esc(t)}" ${recType === t ? 'selected' : ''}>${TYPE_EMO[t]} ${esc(t)}</option>`).join('')}
            </select>
            <select class="field" id="recLimitSel" style="flex:1;min-width:104px;padding:6px 8px;font-size:.82rem;">
              ${[6, 12, 24].map(n => `<option value="${n}" ${recLimit === n ? 'selected' : ''}>显示 ${n} 部</option>`).join('')}
              <option value="0" ${recLimit === 0 ? 'selected' : ''}>显示全部</option>
            </select>
          </div>
          <div class="mgrid" id="recGrid"></div>
          <div class="hint" id="recCountTip" style="margin-top:6px;text-align:center;font-size:.75rem;"></div>
          <div class="row" style="margin-top:9px;gap:6px;">
            <button class="btn ghost grow sm" id="addWork">${Icons.plus()}加作品</button>
            <button class="btn ghost grow sm" id="addCat">🗂 加分类</button>
            <button class="btn ghost grow sm" id="manCat">✏️ 管分类</button>
          </div>
        </div>
        ${recCollapsed ? `<div class="hint" style="text-align:center;font-size:.78rem;padding:2px 0;">推荐内容已收起，点「展开」查看 ${totalCount()} 部作品</div>` : ''}
      </div>

      <div class="card">
        <div class="card-title"><span class="ci">${Icons.pen()}</span>我的点评 <small>${getReviews().length} 篇</small></div>
        <div class="row" style="gap:6px;margin-bottom:8px;flex-wrap:wrap;">
          <select class="field" id="revTimeSel" style="flex:1;min-width:112px;padding:6px 8px;font-size:.82rem;">
            ${timeOptions().map(o => `<option value="${esc(o.v)}" ${revTime === o.v ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}
          </select>
          <select class="field" id="revTypeSel" style="flex:1;min-width:104px;padding:6px 8px;font-size:.82rem;">
            <option value="全部">🎬 全部类型</option>
            ${Object.keys(TYPE_EMO).map(t => `<option value="${esc(t)}" ${revType === t ? 'selected' : ''}>${TYPE_EMO[t]} ${esc(t)}</option>`).join('')}
          </select>
        </div>
        <div id="revList"></div>
        <button class="btn block" id="addRev" style="margin-top:9px;">${Icons.plus()}写一条点评</button>
      </div>`;
    drawChips();
    if (!recCollapsed) drawRecs($('#recGrid')); // 收起时不渲染，省流量也更快
    $('#catGrp').onclick = (e) => { const c = e.target.closest('[data-c]'); if (!c) return; curCat = c.dataset.c; drawChips(); drawRecs($('#recGrid')); };
    $('#recToggle').onclick = () => {
      recCollapsed = !recCollapsed;
      DB.set('pref.mediaRecCollapsed', recCollapsed);
      render(root);
    };
    const tSel = $('#recTypeSel');
    if (tSel) tSel.onchange = () => { recType = tSel.value; drawRecs($('#recGrid')); };
    const lSel = $('#recLimitSel');
    if (lSel) lSel.onchange = () => { recLimit = +lSel.value; drawRecs($('#recGrid')); };
    const addW = $('#addWork'); if (addW) addW.onclick = addWork;
    const addC = $('#addCat'); if (addC) addC.onclick = addCat;
    const manC = $('#manCat'); if (manC) manC.onclick = manCat;
    drawReviews($('#revList'));
    $('#revTimeSel').onchange = (e) => { revTime = e.target.value; drawReviews($('#revList')); };
    $('#revTypeSel').onchange = (e) => { revType = e.target.value; drawReviews($('#revList')); };
    $('#addRev').onclick = addReview;
  }

  // 时间阶段筛选项（含动态年份）
  function timeOptions() {
    const years = [...new Set(getReviews().map(r => (r.date || '').slice(0, 4)).filter(Boolean))].sort().reverse();
    const cy = String(new Date().getFullYear());
    const base = [
      { v: 'all', t: '🕐 全部时间' },
      { v: 'month', t: '📅 本月' },
      { v: '3m', t: '📆 近三个月' },
      { v: 'year', t: '🗓 今年' }
    ];
    years.filter(y => y !== cy).forEach(y => base.push({ v: y, t: `📚 ${y} 年` }));
    return base;
  }

  // 按时间阶段 + 类型过滤点评
  function filterReviews(list) {
    const now = new Date();
    const ymNow = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const yNow = String(now.getFullYear());
    const d3 = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10);
    return list.filter(rv => {
      const d = rv.date || '';
      if (revTime === 'month' && !d.startsWith(ymNow)) return false;
      if (revTime === '3m' && d < d3) return false;
      if (revTime === 'year' && !d.startsWith(yNow)) return false;
      if (/^\d{4}$/.test(revTime) && !d.startsWith(revTime)) return false;
      if (revType !== '全部' && rv.type !== revType) return false;
      return true;
    });
  }

  function drawChips() {
    const cats = getRecs();
    const list = ['全部', ...cats.map(c => c.cat)];
    $('#catGrp').innerHTML = list.map(c =>
      `<button class="chip sm ${curCat === c ? 'on' : ''}" data-c="${esc(c)}">${c === '全部' ? '🌟 全部' : (cats.find(x => x.cat === c).emoji + ' ' + esc(c))}</button>`).join('');
  }

  function drawRecs(box) {
    if (!box) return;
    const all = filteredItems();
    const tip = $('#recCountTip');
    if (!all.length) {
      box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.rabbit()}</div>${recType !== '全部' ? `「${esc(curCat)}」里没有<b>${esc(recType)}</b>类作品～<br>换个筛选条件试试` : '这个分类还没有作品～<br>点“加作品”添加你想安利的'}</div>`;
      if (tip) tip.textContent = '';
      return;
    }
    const items = recLimit > 0 ? all.slice(0, recLimit) : all;
    if (tip) {
      tip.innerHTML = all.length > items.length
        ? `已显示 <b>${items.length}</b> / 共 ${all.length} 部 · 想看更多可把「显示个数」调大`
        : `共 ${all.length} 部`;
    }
    box.innerHTML = items.map(it => {
      const base = genPoster(it); // 兜底用生成的精美海报
      const poster = it.img || (navigator.onLine && it.online ? it.online : base);
      return `<div class="mcard" data-id="${it.id}">
        <div class="mimg-wrap">
          <img class="mimg clickable-img" src="${poster}" alt="" data-base="${base}" onerror="if(!this.dataset.fb){this.dataset.fb='1';this.src=this.dataset.base;}">
        </div>
        <div class="mt">${esc(it.title)}</div>
        <div class="row" style="margin:3px 9px 0;gap:5px;flex-wrap:wrap;">
          <span class="chip sm on">${esc(it.type)}</span>
          ${it.tag ? `<span class="hint" style="font-size:10px;">${esc(it.tag)}</span>` : ''}
        </div>
        <div class="ms">${esc(it.desc || '')}</div>
        <div class="row" style="margin:5px 9px 0;gap:8px;align-items:center;">
          ${it.hot ? `<span class="hint" style="font-size:10px;">🔥 ${it.hot}</span>` : ''}
          <span class="chip sm" data-act="del" style="margin-left:auto;">× 删除</span>
        </div>
      </div>`;
    }).join('');
    box.onclick = async (e) => {
      const card = e.target.closest('[data-id]'); if (!card) return;
      if (e.target.dataset.act === 'del') {
        const cat = getRecs().find(c => c.items.some(x => x.id === card.dataset.id));
        if (cat && await confirmBox('删除这部推荐？', '删除')) {
          cat.items = cat.items.filter(x => x.id !== card.dataset.id); setRecs(getRecs()); drawChips(); drawRecs($('#recGrid'));
        }
      }
    };
    // 联网时异步增强封面为真实图片
    setTimeout(() => enhanceCovers(box), 300);
  }

  function addWork() {
    const cats = getRecs();
    modal.open('添加一部作品', `
      <select class="field" id="wCat">${cats.map(c => `<option value="${esc(c.cat)}">${c.emoji} ${esc(c.cat)}</option>`).join('')}</select>
      <input class="field" id="wTitle" style="margin-top:8px;" placeholder="作品名称">
      <div class="row" style="margin-top:8px;gap:6px;">
        <select class="field grow" id="wType">${Object.keys(TYPE_EMO).map(t => `<option>${t}</option>`).join('')}</select>
        <input class="field" id="wHot" style="width:74px;" type="number" step="0.1" min="0" max="10" placeholder="热度">
      </div>
      <input class="field" id="wTag" style="margin-top:8px;" placeholder="标签，如：治愈·奇幻">
      <textarea class="field" id="wDesc" style="margin-top:8px;min-height:60px;" placeholder="一句话安利…"></textarea>
      <button class="btn ghost block sm" id="wImg" style="margin-top:8px;">${Icons.photo()}选一张封面图（可选）</button>
      <div id="wImgPrev" style="margin-top:6px;"></div>
      <div class="row" style="margin-top:12px;">
        <button class="btn ghost grow" id="wNo">取消</button>
        <button class="btn grow" id="wYes">添加</button>
      </div>`, (b) => {
      let img = '';
      $('#wNo', b).onclick = () => modal.close();
      $('#wImg', b).onclick = async () => {
        const im = await pickImage(1200);
        if (im) { img = im; $('#wImgPrev', b).innerHTML = `<img src="${img}" style="width:100%;border-radius:10px;">`; }
      };
      $('#wYes', b).onclick = () => {
        const title = $('#wTitle', b).value.trim();
        if (!title) { toast('写个名字吧'); return; }
        const hot = parseFloat($('#wHot', b).value);
        const cat = getRecs().find(c => c.cat === $('#wCat', b).value);
        cat.items.unshift({ id: uid(), title, type: $('#wType', b).value, tag: $('#wTag', b).value.trim(), hot: isNaN(hot) ? 0 : hot, desc: $('#wDesc', b).value.trim(), img });
        setRecs(getRecs()); modal.close(); drawChips(); drawRecs($('#recGrid')); toast('已添加 🎬');
      };
    });
  }

  function addCat() {
    promptBox('新分类名称', '', '如：悬疑、纪录片…').then(async (name) => {
      if (!name) return;
      const cats = getRecs();
      if (cats.some(c => c.cat === name)) { toast('已有这个分类啦'); return; }
      const emo = (await promptBox('给这个分类选个 emoji', '🎬', '粘贴一个 emoji')) || '🎬';
      cats.push({ cat: name, emoji: emo, items: [] });
      setRecs(cats); curCat = name; drawChips(); drawRecs($('#recGrid')); toast('分类已添加');
    });
  }

  function manCat() {
    const cats = getRecs();
    modal.open('管理分类', `
      <div id="catList"></div>
      <div class="hint" style="margin-top:6px;">删除分类会同时删除该分类下的作品。</div>`, (b) => {
      const box = $('#catList', b);
      box.innerHTML = cats.map(c => `
        <div class="row" style="margin-bottom:6px;">
          <span style="font-size:16px;">${c.emoji}</span>
          <span class="grow" style="font-size:13px;font-weight:700;">${esc(c.cat)} <span class="hint">${c.items.length} 部</span></span>
          <span class="chip sm" data-del="${esc(c.cat)}">删除</span>
        </div>`).join('');
      $$('#catList [data-del]', b).forEach(x => x.onclick = async () => {
        if (await confirmBox(`删除分类「${x.dataset.del}」及其作品？`, '删除')) {
          setRecs(getRecs().filter(c => c.cat !== x.dataset.del));
          if (curCat === x.dataset.del) curCat = '全部';
          manCat(); drawChips(); drawRecs($('#recGrid'));
        }
      });
    });
  }

  function stars(n) {
    n = Math.max(0, Math.min(5, n | 0));
    let s = '';
    for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">☆</span>';
    return `<span class="stars">${s}</span>`;
  }

  // 观看日期文案：8-1 至 8-3 / 8-1
  function watchText(rv) {
    if (!rv.watchDateFrom) return '';
    const cut = (s) => s.slice(5).replace(/^0/, '').replace('-0', '-');
    const df = cut(rv.watchDateFrom);
    const dt = cut(rv.watchDateTo || rv.watchDateFrom);
    return (rv.watchDateTo && rv.watchDateTo !== rv.watchDateFrom) ? `${df} 至 ${dt}` : df;
  }

  function drawReviews(box) {
    if (!box) return;
    const total = getReviews().length;
    const reviews = filterReviews(getReviews().slice()).sort((a, b) => b.ts - a.ts);
    if (!total) { box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.chick()}</div>还没有点评～<br>看完一部好作品，来记一笔吧</div>`; return; }
    if (!reviews.length) { box.innerHTML = `<div class="empty"><div class="e-ico">${Icons.rabbit()}</div>这个时间段/类型下还没有点评～<br>换个筛选条件看看</div>`; return; }
    box.innerHTML = `
      <div class="hint" style="margin-bottom:6px;font-size:.75rem;">筛选出 <b>${reviews.length}</b> 篇（共 ${total} 篇）· 点击任意一条查看完整点评</div>
      ${reviews.map(rv => {
        const w = watchText(rv);
        const full = rv.text || '';
        const brief = full.length > 42 ? esc(full.slice(0, 42)) + '…' : esc(full);
        return `
        <div class="rec-item rev-card" data-id="${rv.id}" style="cursor:pointer;">
          <div class="rec-ico">${emoOf(rv.type)}</div>
          <div class="rec-main">
            <div class="t">${esc(rv.title)} ${stars(rv.rating || 0)}</div>
            <div class="s">${brief || '<span style="color:#C9BCAA;">（没写正文）</span>'}</div>
            ${rv.imgs && rv.imgs.length ? `<div class="rthumbs">${rv.imgs.map(i => `<img class="rthumb-img" src="${i}">`).join('')}</div>` : ''}
            <div class="hint" style="margin-top:2px;">${niceDate(rv.date)}${rv.type ? ' · ' + esc(rv.type) : ''}${w ? ' · 📅 ' + w : ''}${full.length > 42 ? ' · <b style="color:#E07B20;">查看全文 ›</b>' : ''}</div>
          </div>
          <span class="chip sm" data-act="del">×</span>
        </div>`;
      }).join('')}`;
    box.onclick = async (e) => {
      const it = e.target.closest('[data-id]'); if (!it) return;
      if (e.target.dataset.act === 'del') {
        if (await confirmBox('删除这条点评？', '删除')) { setReviews(getReviews().filter(x => x.id !== it.dataset.id)); drawReviews($('#revList')); }
        return;
      }
      if (e.target.classList.contains('rthumb-img')) return; // 缩略图交给灯箱
      showReviewDetail(it.dataset.id);
    };
    $$('#revList .rec-item').forEach(card => {
      const rv2 = reviews.find(r => r.id === card.dataset.id);
      if (rv2 && rv2.imgs && rv2.imgs.length) {
        $$('.rthumb-img', card).forEach((im, i) => { im.onclick = (e) => { e.stopPropagation(); openLightbox(rv2.imgs.slice(), i); }; });
      }
    });
  }

  // ===== 点评详情 =====
  function showReviewDetail(id) {
    const rv = getReviews().find(x => x.id === id);
    if (!rv) { toast('这条点评找不到了'); return; }
    const w = watchText(rv);
    modal.open('点评详情', `
      <div style="text-align:center;margin-bottom:8px;">
        <div style="font-size:34px;line-height:1.1;">${emoOf(rv.type)}</div>
        <div style="font-size:1.12rem;font-weight:700;color:#6B4630;margin-top:2px;">${esc(rv.title)}</div>
        <div style="margin-top:3px;">${stars(rv.rating || 0)} <span class="hint" style="font-size:.78rem;">${rv.rating || 0}/5</span></div>
      </div>
      <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:9px;">
        <span class="chip sm on">${emoOf(rv.type)} ${esc(rv.type || '未分类')}</span>
        ${w ? `<span class="chip sm">📅 观看 ${esc(w)}</span>` : ''}
        <span class="chip sm">✍️ ${esc(niceDate(rv.date))} 写下</span>
      </div>
      <div style="padding:10px 12px;background:#FFFBF5;border:2px solid #E8D9BC;border-radius:10px;font-size:.9rem;line-height:1.8;color:#4A3628;white-space:pre-wrap;word-break:break-word;">${rv.text ? esc(rv.text) : '<span style="color:#C9BCAA;">这条点评没有写正文～</span>'}</div>
      ${rv.imgs && rv.imgs.length ? `
        <div class="hint" style="margin:9px 0 4px;font-size:.76rem;">🖼 配图 ${rv.imgs.length} 张（点击看大图）</div>
        <div class="rthumbs" id="rdImgs">${rv.imgs.map(i => `<img class="rthumb-img" src="${i}" style="width:64px;height:64px;object-fit:cover;border-radius:9px;border:1.4px solid var(--line);cursor:zoom-in;">`).join('')}</div>` : ''}
      <div class="row" style="margin-top:12px;gap:6px;">
        <button class="btn ghost grow" id="rdDel" style="color:#CC6666;border-color:#CC6666;">删除</button>
        <button class="btn grow" id="rdOk">关闭</button>
      </div>`, (b) => {
      $('#rdOk', b).onclick = () => modal.close();
      $('#rdDel', b).onclick = async () => {
        if (await confirmBox('删除这条点评？', '删除')) {
          setReviews(getReviews().filter(x => x.id !== id));
          modal.close();
          drawReviews($('#revList'));
          toast('已删除');
        }
      };
      if (rv.imgs && rv.imgs.length) {
        $$('#rdImgs .rthumb-img', b).forEach((im, i) => { im.onclick = () => openLightbox(rv.imgs.slice(), i); });
      }
    });
  }

  function addReview() {
    const now = new Date();
    const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0'), d = String(now.getDate()).padStart(2,'0');
    modal.open('写一条点评', `
      <input class="field" id="vTitle" placeholder="作品名称">
      <div class="row" style="margin-top:8px;gap:6px;">
        <select class="field grow" id="vType">${Object.keys(TYPE_EMO).map(t => `<option>${t}</option>`).join('')}</select>
        <div class="grow row" style="gap:2px;justify-content:flex-end;" id="vStars"></div>
      </div>
      <div class="hint" style="margin-top:2px;">点击星星打分（1–5）</div>

      <!-- 观看时间 -->
      <div style="margin-top:10px;">
        <label style="font-size:.85rem;color:#6B4630;font-weight:600;display:block;margin-bottom:4px;">📅 观看时间</label>
        <div class="row" style="gap:6px;align-items:center;">
          <input type="date" class="field" id="vDateFrom" value="${y}-${m}-${d}" style="flex:1;">
          <span style="color:#9A8874;font-size:.82rem;">至</span>
          <input type="date" class="field" id="vDateTo" value="${y}-${m}-${d}" style="flex:1;">
        </div>
        <div class="hint" style="margin-top:2px;font-size:.75rem;">可填写观看的起止日期，只看了一天则保持相同即可</div>
      </div>

      <textarea class="field" id="vText" style="margin-top:8px;min-height:80px;" placeholder="你的心得、体会、名场面…"></textarea>
      <button class="btn ghost block sm" id="vImg" style="margin-top:8px;">${Icons.photo()}添加图片（最多 3 张）</button>
      <div class="rthumbs" id="vImgPrev" style="margin-top:6px;"></div>
      <div class="row" style="margin-top:12px;">
        <button class="btn ghost grow" id="vNo">取消</button>
        <button class="btn grow" id="vYes">保存</button>
      </div>`, (b) => {
      let rating = 0; const imgs = [];
      const drawStars = () => {
        $('#vStars', b).innerHTML = [1, 2, 3, 4, 5].map(i => `<span data-st="${i}" style="font-size:20px;cursor:pointer;color:${i <= rating ? 'var(--orange-d)' : 'var(--grey)'};">${i <= rating ? '★' : '☆'}</span>`).join('');
        $$('#vStars span', b).forEach(s => s.onclick = () => { rating = +s.dataset.st; drawStars(); });
      };
      drawStars();
      $('#vNo', b).onclick = () => modal.close();
      $('#vImg', b).onclick = async () => {
        if (imgs.length >= 3) { toast('最多 3 张啦'); return; }
        const im = await pickImage(1400);
        if (im) { imgs.push(im); $('#vImgPrev', b).innerHTML = imgs.map((i, idx) => `<span style="position:relative;display:inline-block;"><img src="${i}" style="width:46px;height:46px;object-fit:cover;border-radius:9px;border:1.4px solid var(--line);"><span data-x="${idx}" style="position:absolute;top:-5px;right:-5px;background:var(--brown);color:#fff;border-radius:50%;width:16px;height:16px;line-height:16px;text-align:center;font-size:11px;">×</span></span>`).join('');
          $$('#vImgPrev [data-x]', b).forEach(x => x.onclick = () => { imgs.splice(+x.dataset.x, 1); $('#vImgPrev', b).innerHTML = imgs.map((i, idx) => `<span style="position:relative;display:inline-block;"><img src="${i}" style="width:46px;height:46px;object-fit:cover;border-radius:9px;border:1.4px solid var(--line);"><span data-x="${idx}" style="position:absolute;top:-5px;right:-5px;background:var(--brown);color:#fff;border-radius:50%;width:16px;height:16px;line-height:16px;text-align:center;font-size:11px;">×</span></span>`).join(''); });
        }
      };
      $('#vYes', b).onclick = () => {
        const title = $('#vTitle', b).value.trim();
        if (!title) { toast('写个名字吧'); return; }
        const dateFrom = $('#vDateFrom', b).value || today();
        const dateTo = $('#vDateTo', b).value || dateFrom;
        // 确保 dateTo >= dateFrom
        const watchStart = dateFrom <= dateTo ? dateFrom : dateTo;
        const watchEnd = dateFrom <= dateTo ? dateTo : dateFrom;
        const reviews = getReviews();
        reviews.unshift({ id: uid(), title, type: $('#vType', b).value, rating, text: $('#vText', b).value.trim(), imgs: imgs.slice(), date: today(), ts: Date.now(), watchDateFrom: watchStart, watchDateTo: watchEnd });
        setReviews(reviews); modal.close(); drawReviews($('#revList')); toast('点评已记下 ✍️');
      };
    });
  }

  window.Modules = window.Modules || {};
  window.Modules.media = {
    id: 'media', name: '影视文娱', desc: '猫头鹰的片单与点评', icon: 'owl',
    render
  };
})();
