const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('standalone.html', 'utf8');
const errors = [];
const dom = new JSDOM(html, {
  runScripts: 'dangerously', resources: 'usable', url: 'http://localhost/', pretendToBeVisual: true,
  beforeParse(window) {
    window.addEventListener('error', e => errors.push('error: ' + (e.error && e.error.stack || e.message)));
    window.addEventListener('unhandledrejection', e => errors.push('rej: ' + (e.reason && e.reason.message || e.reason)));
  }
});
const { window } = dom;
setTimeout(() => {
  const log = [];
  const doc = window.document;
  const body = () => doc.getElementById('modalBody');
  try {
    const M = window.Modules;
    const root = doc.createElement('div'); doc.body.appendChild(root);
    M.media.render(root);

    // 图标：赚一笔应为金色小猪
    log.push('pigGold exists: ' + (typeof window.Icons.pigGold === 'function'));
    log.push('earn icon: ' + M.earn.icon);
    log.push('pigGold has gold fill: ' + /#F7CF5A/.test(window.Icons.pigGold()));
    log.push('pigGold nav svg ok: ' + window.Icons.get('pigGold').startsWith('<svg'));

    // 新增一条点评
    root.querySelector('#addReviewBtn') && root.querySelector('#addReviewBtn').click();
    let b = body();
    if (!b.querySelector('#vTitle')) {
      // 找写点评按钮
      const btns = [...root.querySelectorAll('button')].filter(x => /点评/.test(x.textContent));
      log.push('review buttons: ' + btns.map(x => x.textContent.trim()).join('|'));
      btns[0].click(); b = body();
    }
    b.querySelector('#vTitle').value = '海蒂和爷爷';
    b.querySelector('#vText').value = '很治愈的一部电影';
    const st = b.querySelectorAll('#vStars span'); st[4] && st[4].click();
    b.querySelector('#vDateFrom').value = '2026-09-01';
    b.querySelector('#vDateTo').value = '2026-09-02';
    b.querySelector('#vYes').click();
    let rvs = window.DB.get('media.reviews', []);
    log.push('review added: ' + rvs.length + ' | title=' + rvs[0].title + ' | rating=' + rvs[0].rating + ' | watch=' + rvs[0].watchDateFrom + '~' + rvs[0].watchDateTo);

    // 列表里点 ✎ 编辑
    const card = root.querySelector('#revList .rec-item');
    log.push('rev card edit chip: ' + !!card.querySelector('[data-act="edit"]'));
    card.querySelector('[data-act="edit"]').click();
    b = body();
    log.push('edit dialog title: ' + doc.getElementById('modalTitle').textContent);
    log.push('prefilled title: ' + b.querySelector('#vTitle').value);
    log.push('prefilled text: ' + b.querySelector('#vText').value);
    log.push('prefilled dateFrom: ' + b.querySelector('#vDateFrom').value);
    log.push('prefilled stars on: ' + (b.querySelector('#vStars').textContent.match(/★/g) || []).length);
    b.querySelector('#vTitle').value = '海蒂和爷爷（重看）';
    b.querySelector('#vText').value = '第二遍更感动了，阿尔卑斯山风景太美';
    b.querySelectorAll('#vStars span')[2].click();
    b.querySelector('#vYes').click();
    rvs = window.DB.get('media.reviews', []);
    log.push('after edit: count=' + rvs.length + ' | title=' + rvs[0].title + ' | rating=' + rvs[0].rating);
    log.push('after edit text: ' + rvs[0].text);
    log.push('editedAt set: ' + !!rvs[0].editedAt);
    log.push('list shows 已编辑: ' + /已编辑/.test(root.querySelector('#revList').textContent));
    log.push('list title updated: ' + /海蒂和爷爷（重看）/.test(root.querySelector('#revList').textContent));

    // 从详情页编辑
    root.querySelector('#revList .rec-item .rec-main').click();
    b = body();
    log.push('detail title: ' + doc.getElementById('modalTitle').textContent);
    log.push('detail has 编辑 btn: ' + !!b.querySelector('#rdEdit'));
    b.querySelector('#rdEdit').click();
    b = body();
    log.push('reopen edit from detail: ' + doc.getElementById('modalTitle').textContent + ' | value=' + b.querySelector('#vTitle').value);
    b.querySelector('#vText').value = '改成第三段文字';
    b.querySelector('#vYes').click();
    rvs = window.DB.get('media.reviews', []);
    log.push('2nd edit text: ' + rvs[0].text + ' | count still=' + rvs.length);

    // 新增仍正常（不串数据）
    const btns2 = [...root.querySelectorAll('button')].filter(x => /写一条点评/.test(x.textContent));
    if (btns2[0]) { btns2[0].click(); b = body(); }
    if (b && b.querySelector('#vTitle')) {
      log.push('new dialog empty title: "' + b.querySelector('#vTitle').value + '" text: "' + b.querySelector('#vText').value + '"');
      b.querySelector('#vTitle').value = '新剧'; b.querySelector('#vYes').click();
      log.push('reviews now: ' + window.DB.get('media.reviews', []).length);
    } else log.push('WARN new-dialog btn not found');

    // 全模块渲染
    Object.keys(M).forEach(k => {
      const d = doc.createElement('div'); doc.body.appendChild(d);
      try { M[k].render(d); } catch (e) { errors.push('render ' + k + ': ' + e.stack); }
    });
    log.push('all modules rendered OK');
  } catch (e) { errors.push('THROW: ' + e.stack); }
  console.log(log.join('\n'));
  console.log('ERRORS: ' + errors.length);
  errors.slice(0, 10).forEach(e => console.log(' - ' + e));
  process.exit(errors.length ? 1 : 0);
}, 1200);
