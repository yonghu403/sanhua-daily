const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('standalone.html', 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost/',
  pretendToBeVisual: true,
  beforeParse(window) {
    window.addEventListener('error', e => errors.push('error: ' + (e.error && e.error.stack || e.message)));
    window.addEventListener('unhandledrejection', e => errors.push('rej: ' + (e.reason && e.reason.message || e.reason)));
  }
});
const { window } = dom;
setTimeout(() => {
  try {
    const M = window.Modules;
    console.log('modules:', M ? Object.keys(M).join(',') : 'NONE');
    console.log('CN_ROOSTER loaded:', !!window.CN_ROOSTER, 'provinces', window.CN_ROOSTER && window.CN_ROOSTER.provinces.length, 'cities', window.CN_ROOSTER && window.CN_ROOSTER.CITY_INDEX.length);

    const tdiv = window.document.createElement('div'); window.document.body.appendChild(tdiv);
    M.travel.render(tdiv);
    const svg = tdiv.querySelector('#cnMap');
    console.log('TRAVEL china svg id cnMap:', !!svg);
    console.log('TRAVEL province paths (prov):', tdiv.querySelectorAll('path.prov').length);
    console.log('TRAVEL province name labels:', tdiv.querySelectorAll('#cnMap text').length);
    console.log('TRAVEL base rooster path present:', !!tdiv.querySelector('#cnMap path[fill="#FBF1DD"]'));
    console.log('TRAVEL zoom buttons:', !!tdiv.querySelector('#mapZoomIn'), !!tdiv.querySelector('#mapZoomOut'), !!tdiv.querySelector('#mapZoomReset'));
    console.log('TRAVEL search box:', !!tdiv.querySelector('#citySearch'));
    window.__cnCenterOn && window.__cnCenterOn(500,400,3);
    console.log('TRAVEL after zoom, zoomed class:', svg && svg.classList.contains('zoomed'));

    // 测试其他大洲国家级地图
    const tdiv2 = window.document.createElement('div'); window.document.body.appendChild(tdiv2);
    M.travel.render(tdiv2);
    // 切到亚洲
    const asiaBtn = [...tdiv2.querySelectorAll('.chip[data-r]')].find(b => b.dataset.r === 'asia');
    asiaBtn && asiaBtn.click();
    const ctrPaths = tdiv2.querySelectorAll('#mapArea svg path.ctr');
    console.log('TRAVEL asia country paths:', ctrPaths.length);
    console.log('TRAVEL asia has Turkey label:', [...tdiv2.querySelectorAll('text.cnam')].some(t => t.textContent.includes('土耳其')));

    // 测试添加足迹 + 游记
    const addBtn = tdiv.querySelector('#addCityBtn');
    addBtn && addBtn.click();
    const dlg = window.document.getElementById('addCityDlg');
    console.log('TRAVEL add-city dialog opens:', !!dlg);
    if (dlg) { dlg.remove(); }

    // ===== 健康管理 =====
    const hdiv = window.document.createElement('div'); window.document.body.appendChild(hdiv);
    M.health.render(hdiv);
    const cats = hdiv.querySelectorAll('#hdCats [data-cat]');
    console.log('HEALTH cats (should be 3, no lock):', cats.length);
    cats.forEach(c => console.log('  cat', c.dataset.cat, 'lock=', c.textContent.includes('🔒'), 'disabled=', c.disabled));
    // 默认 gi 应加深（有 box-shadow / 深色背景）
    const giStyle = cats[0].getAttribute('style') || '';
    console.log('HEALTH default gi has deepen style:', /box-shadow|inset/.test(giStyle) || giStyle.includes('font-weight:700'));
    // 点击切到 ext，验证 re-render 后 ext 加深、gi 不再加深
    cats[1].click();
    const cats2 = hdiv.querySelectorAll('#hdCats [data-cat]');
    const extDeep = /box-shadow|inset/.test(cats2[1].getAttribute('style')||'') || (cats2[1].getAttribute('style')||'').includes('font-weight:700');
    const giDeep = /box-shadow|inset/.test(cats2[0].getAttribute('style')||'') || (cats2[0].getAttribute('style')||'').includes('font-weight:700');
    console.log('HEALTH after switch -> ext deepen:', extDeep, '| gi deepen (should be false):', giDeep);
  } catch (e) { errors.push('render throw: ' + e.stack); }
  console.log('ERRORS:', errors.length);
  errors.slice(0, 20).forEach(e => console.log(' -', e));
  process.exit(errors.length ? 1 : 0);
}, 1500);
