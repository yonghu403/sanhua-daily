/* ===== 应用主控制器：初始化、导航、路由 ===== */
(function () {
  let current = null;

  function list() {
    return Object.keys(window.Modules || {}).map(id => window.Modules[id]);
  }

  function buildNav() {
    const nav = UI.$('#navList');
    nav.innerHTML = list().map(m => `
      <button class="nav-item" data-id="${m.id}">
        <span class="ico">${Icons.get(m.icon) || ''}</span>
        <span class="lb">${esc(m.name)}</span>
      </button>`).join('');
    nav.onclick = (e) => {
      const it = e.target.closest('[data-id]');
      if (it) go(it.dataset.id);
    };
  }

  function applyFont(fs) {
    const r = document.documentElement;
    r.classList.remove('fs-s', 'fs-m', 'fs-l');
    r.classList.add('fs-' + (fs || 'm'));
  }

  function tickToday() {
    const d = new Date();
    UI.$('#todayChip').textContent = `${d.getMonth() + 1}月${d.getDate()}日 周${UI.WD[d.getDay()]}`;
  }

  function go(id) {
    const m = window.Modules[id];
    if (!m) return;
    if (current && window.Modules[current] && typeof window.Modules[current].onLeave === 'function') {
      try { window.Modules[current].onLeave(); } catch (e) { /* ignore */ }
    }
    UI.$$('#navList .nav-item').forEach(b => b.classList.toggle('active', b.dataset.id === id));
    UI.$('#topIco').innerHTML = Icons.get(m.icon) || '';
    UI.$('#topTitle').textContent = m.name;
    UI.$('#topDesc').textContent = m.desc || '';
    const sc = UI.$('#pageScroll');
    if (sc) sc.scrollTop = 0;
    current = id;
    const root = UI.$('#pageRoot');
    root.innerHTML = '';
    try { m.render(root); } catch (e) { root.innerHTML = `<div class="card">页面出错啦：${esc(e && e.message || e)}</div>`; }
  }

  const esc = (s) => UI.esc(s);

  async function boot() {
    // 装饰：启动页 + logo + 设置按钮
    UI.$('#splashCat').innerHTML = Icons.cat();
    UI.$('#navLogo').innerHTML = Icons.cat();
    UI.$('#settingsIco').innerHTML = Icons.gear();
    UI.$('#btnSettings').onclick = () => go('settings');

    // 关闭弹层的通用处理
    UI.$('#modalClose').onclick = () => UI.modal.close();

    try {
      await DB.init();
    } catch (e) { /* 即使数据库失败也要能打开 */ }

    // 字号偏好
    applyFont(DB.get('pref.fontsize', 'm'));
    // 主题皮肤 + 布局偏好
    const savedTheme = DB.get('pref.theme', '');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    if (DB.get('pref.compact', false)) document.documentElement.classList.add('compact');

    // 阻止移动端长按选中/菜单对内容区的影响（仅图片可长按）
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName !== 'IMG' && e.target.tagName !== 'A') e.preventDefault();
    });

    buildNav();
    go('todo');

    setTimeout(() => UI.$('#splash').classList.add('hide'), 350);
    tickToday();

    // PWA：注册 Service Worker（仅 http/https 下生效，便于安卓“添加到主屏幕”）
    // 预览模式（URL 带 ?nosw 或 ?preview）不注册 SW，并清除旧缓存，保证每次都是最新代码
    const NO_SW = /[?&](nosw|preview)\b/.test(location.search);
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      if (NO_SW) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister().catch(()=>{})));
      } else {
        // v15：SW 脚本带版本号 + 禁用 HTTP 缓存，彻底破掉"旧 SW 循环喂旧文件"的死局
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js?v=18', { updateViaCache: 'none' })
            .then(reg => {
              // 已存在旧 SW 时，强制它立刻检查新版本
              reg.update().catch(()=>{});
              // 新 SW 安装后立刻接管，不等页面关闭
              reg.onupdatefound = () => {
                const nw = reg.installing;
                if (nw) nw.onstatechange = () => { if (nw.state === 'installed') nw.skipWaiting(); };
              };
            })
            .catch(() => {});
        });
      }
    }
  }

  window.App = { go, current: () => current };

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
