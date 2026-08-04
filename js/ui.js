/* ===== 通用 UI 工具 ===== */
(function (global) {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* 只保留安全的富文本标签 */
  function safeHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = String(html == null ? '' : html);
    const allow = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, BR: 1, DIV: 1, SPAN: 1, P: 1, FONT: 1, IMG: 1, UL: 1, OL: 1, LI: 1 };
    (function walk(node) {
      Array.from(node.childNodes).forEach((c) => {
        if (c.nodeType === 1) {
          if (!allow[c.tagName]) {
            const txt = document.createTextNode(c.textContent || '');
            node.replaceChild(txt, c); return;
          }
          Array.from(c.attributes).forEach((a) => {
            const n = a.name.toLowerCase();
            const okStyle = n === 'style';
            const okSrc = n === 'src' && c.tagName === 'IMG' && /^data:image\//.test(a.value);
            if (!okStyle && !okSrc) c.removeAttribute(a.name);
          });
          walk(c);
        }
      });
    })(div);
    return div.innerHTML;
  }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  /* ---------- 日期 ---------- */
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  const parseYMD = (s) => { const a = String(s).split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
  const WD = ['日', '一', '二', '三', '四', '五', '六'];
  const wdOf = (s) => WD[parseYMD(s).getDay()];
  function monthMatrix(year, month) { // month:0-11
    const first = new Date(year, month, 1);
    const days = new Date(year, month + 1, 0).getDate();
    const lead = first.getDay();
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let i = 1; i <= days; i++) cells.push(`${year}-${pad(month + 1)}-${pad(i)}`);
    while (cells.length % 7) cells.push(null);
    return cells;
  }
  function weekOf(dateStr) { // 周一 ~ 周日
    const d = parseYMD(dateStr || today());
    const dow = (d.getDay() + 6) % 7;
    const mon = new Date(d); mon.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return ymd(x); });
  }
  const nowHM = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  function niceDate(s) {
    if (!s) return '';
    const t = today();
    if (s === t) return '今天';
    const d = parseYMD(s), n = parseYMD(t);
    const diff = Math.round((n - d) / 86400000);
    if (diff === 1) return '昨天';
    if (diff === 2) return '前天';
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  }

  /* ---------- Toast ---------- */
  function toast(msg, ms) {
    const w = $('#toastWrap');
    const d = document.createElement('div');
    d.className = 'toast'; d.textContent = msg;
    w.appendChild(d);
    setTimeout(() => { d.style.transition = '.3s'; d.style.opacity = '0'; d.style.transform = 'translateY(-10px)'; }, (ms || 1800) - 300);
    setTimeout(() => d.remove(), ms || 1800);
  }

  /* ---------- Modal ---------- */
  const modal = {
    open(title, html, onMount) {
      $('#modalTitle').textContent = title;
      $('#modalBody').innerHTML = html;
      $('#modalMask').classList.add('show');
      if (onMount) onMount($('#modalBody'));
    },
    close() {
      $('#modalMask').classList.remove('show');
      $('#modalBody').innerHTML = '';
    }
  };

  function confirmBox(msg, okText) {
    return new Promise((resolve) => {
      modal.open('确认一下', `
        <p style="font-size:13.5px;line-height:1.7;margin:2px 0 14px;">${esc(msg)}</p>
        <div class="row"><button class="btn ghost grow" id="cfNo">再想想</button>
        <button class="btn danger grow" id="cfYes">${esc(okText || '确定')}</button></div>`, (b) => {
        $('#cfNo', b).onclick = () => { modal.close(); resolve(false); };
        $('#cfYes', b).onclick = () => { modal.close(); resolve(true); };
      });
    });
  }

  function promptBox(title, defVal, ph) {
    return new Promise((resolve) => {
      modal.open(title, `
        <input class="field" id="pbInp" value="${esc(defVal || '')}" placeholder="${esc(ph || '')}">
        <div class="row" style="margin-top:12px;">
          <button class="btn ghost grow" id="pbNo">取消</button>
          <button class="btn grow" id="pbYes">确定</button>
        </div>`, (b) => {
        const inp = $('#pbInp', b); inp.focus();
        $('#pbNo', b).onclick = () => { modal.close(); resolve(null); };
        $('#pbYes', b).onclick = () => { const v = inp.value.trim(); modal.close(); resolve(v || null); };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#pbYes', b).click(); });
      });
    });
  }

  /* ---------- 图片选择 + 压缩 ---------- */
  function pickImage(maxW) {
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*';
      inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (!f) return resolve(null);
        const fr = new FileReader();
        fr.onload = () => {
          const img = new Image();
          img.onload = () => {
            const MW = maxW || 900;
            let w = img.width, h = img.height;
            if (w > MW) { h = Math.round(h * MW / w); w = MW; }
            const cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(img, 0, 0, w, h);
            let out;
            try { out = cv.toDataURL('image/jpeg', 0.78); } catch (e) { out = fr.result; }
            resolve(out);
          };
          img.onerror = () => resolve(fr.result);
          img.src = fr.result;
        };
        fr.onerror = () => resolve(null);
        fr.readAsDataURL(f);
      };
      inp.click();
    });
  }

  function pickFile(accept) {
    return new Promise((resolve) => {
      const inp = document.createElement('input');
      inp.type = 'file'; if (accept) inp.accept = accept;
      inp.onchange = () => {
        const f = inp.files && inp.files[0];
        if (!f) return resolve(null);
        const fr = new FileReader();
        fr.onload = () => resolve({ name: f.name, text: fr.result });
        fr.readAsText(f);
      };
      inp.click();
    });
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* ---------- 长按 ---------- */
  function longPress(elm, cb, ms) {
    let t = null, moved = false;
    const start = (e) => {
      moved = false;
      elm.classList.add('pressing');
      t = setTimeout(() => { if (!moved) { elm.classList.remove('pressing'); cb(e); } }, ms || 600);
    };
    const cancel = () => { moved = true; clearTimeout(t); elm.classList.remove('pressing'); };
    elm.addEventListener('touchstart', start, { passive: true });
    elm.addEventListener('touchend', cancel);
    elm.addEventListener('touchmove', cancel, { passive: true });
    elm.addEventListener('mousedown', start);
    elm.addEventListener('mouseup', cancel);
    elm.addEventListener('mouseleave', cancel);
  }

  const money = (n) => (Number(n) || 0).toFixed(2);

  global.UI = { $, $$, esc, safeHTML, uid, pad, ymd, today, parseYMD, wdOf, WD, monthMatrix, weekOf, nowHM, niceDate, toast, modal, confirmBox, promptBox, pickImage, pickFile, download, longPress, money };

  /* 同时挂成真正的全局变量，方便各模块直接裸用 $ / $$ / esc / today 等
     （老模块若用 const $ = UI.$ 本地别名，会覆盖全局，互不影响） */
  global.$ = $;
  global.$$ = $$;
  global.esc = esc;
  global.safeHTML = safeHTML;
  global.uid = uid;
  global.pad = pad;
  global.ymd = ymd;
  global.today = today;
  global.parseYMD = parseYMD;
  global.wdOf = wdOf;
  global.WD = WD;
  global.monthMatrix = monthMatrix;
  global.weekOf = weekOf;
  global.nowHM = nowHM;
  global.niceDate = niceDate;
  global.toast = toast;
  global.confirmBox = confirmBox;
  global.promptBox = promptBox;
  global.pickImage = pickImage;
  global.pickFile = pickFile;
  global.download = download;
  global.longPress = longPress;
  global.money = money;
})(window);
