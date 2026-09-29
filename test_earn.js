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
  const log = [];
  try {
    const M = window.Modules;
    log.push('modules: ' + (M ? Object.keys(M).join(',') : 'NONE'));
    const doc = window.document;
    const root = doc.createElement('div'); doc.body.appendChild(root);

    // 1) 初次渲染（无数据）
    M.earn.render(root);
    log.push('earn hero pig: ' + !!root.querySelector('.eh-pig'));
    log.push('empty habits: ' + /还没有习惯/.test(root.textContent));

    // 2) 添加一个习惯
    root.querySelector('#addHabit').click();
    const body = doc.getElementById('modalBody');
    body.querySelector('#hbName').value = '晨跑 20 分钟';
    body.querySelector('#hbAmt').value = '2';
    body.querySelector('#hbEmo .chip').click();
    body.querySelector('#hbSave').click();
    log.push('habit added: ' + (window.DB.get('earn.habits', []).length === 1));
    log.push('habit row: ' + !!root.querySelector('.habit-row'));

    // 3) 打卡两次
    root.querySelector('[data-act="inc"]').click();
    root.querySelector('[data-act="inc"]').click();
    const logs = window.DB.get('earn.logs', []);
    log.push('logs after 2 taps: ' + logs.length + ' amount=' + logs[0].amount);
    log.push('earned hero: ' + doc.getElementById('eEarned').textContent);
    log.push('ckSum: ' + doc.getElementById('ckSum').textContent);
    log.push('row count n: ' + root.querySelector('.stp-n').textContent);

    // 4) 撤销一次
    root.querySelector('[data-act="dec"]').click();
    log.push('logs after dec: ' + window.DB.get('earn.logs', []).length);

    // 5) 记一笔花销
    root.querySelector('#spItem').value = '一杯奶茶';
    root.querySelector('#spAmt').value = '5.5';
    root.querySelector('#spAdd').click();
    log.push('spends: ' + window.DB.get('earn.spends', []).length);
    log.push('spent hero: ' + doc.getElementById('eSpent').textContent);
    log.push('left hero: ' + doc.getElementById('eLeft').textContent);

    // 6) 看板：切各区间
    ['week', 'month', 'quarter', 'year', 'all'].forEach(k => {
      const b = [...root.querySelectorAll('#kindGrp .chip')].find(x => x.dataset.k === k);
      b.click();
      const sb = doc.getElementById('statBody');
      log.push('stat ' + k + ': label=' + doc.getElementById('stLabel').textContent +
        ' | bars=' + sb.querySelectorAll('.eb-bar').length +
        ' | habitRows=' + sb.querySelectorAll('.hb-row').length +
        ' | sum=' + [...sb.querySelectorAll('.e-stat .sv')].map(x => x.textContent).join('/'));
    });

    // 7) 翻页
    [...root.querySelectorAll('#kindGrp .chip')].find(x => x.dataset.k === 'month').click();
    doc.getElementById('stPrev').click();
    log.push('prev label: ' + doc.getElementById('stLabel').textContent);
    doc.getElementById('stNow').click();
    log.push('now label: ' + doc.getElementById('stLabel').textContent);

    // 8) 收起/展开
    doc.getElementById('spendToggle').click();
    log.push('spend hidden: ' + (doc.getElementById('spendBody').style.display === 'none'));
    doc.getElementById('logToggle').click();
    log.push('log hidden: ' + (doc.getElementById('logBody').style.display === 'none'));
    doc.getElementById('spendToggle').click();
    log.push('spend shown: ' + (doc.getElementById('spendBody').style.display !== 'none'));

    // 9) 日期切换
    doc.getElementById('ckPrev').click();
    log.push('checkDate label: ' + doc.getElementById('ckLabel').textContent);
    log.push('n on yesterday (should 0): ' + root.querySelector('.stp-n').textContent);
    doc.getElementById('ckLabel').click();

    // 10) 独立账户校验
    log.push('bills untouched: ' + JSON.stringify(window.DB.get('bills', [])));
    log.push('earn keys: ' + window.DB.keys().filter(k => k.indexOf('earn') === 0 || k.indexOf('pref.earn') === 0).join(','));

    // 11) 记账模块收起
    const mroot = doc.createElement('div'); doc.body.appendChild(mroot);
    M.money.render(mroot);
    log.push('money recToggle: ' + !!doc.getElementById('recToggle'));
    doc.getElementById('recToggle').click();
    log.push('money recBody hidden: ' + (doc.getElementById('recBody').style.display === 'none'));
    log.push('money collapsed saved: ' + window.DB.get('pref.moneyRecCollapsed', null));
    doc.getElementById('recToggle').click();
    log.push('money recBody shown: ' + (doc.getElementById('recBody').style.display !== 'none'));

    // 12) 全部模块空渲染
    Object.keys(M).forEach(k => {
      const d = doc.createElement('div'); doc.body.appendChild(d);
      try { M[k].render(d); } catch (e) { errors.push('render ' + k + ': ' + e.stack); }
    });
    log.push('all modules rendered OK');
  } catch (e) { errors.push('THROW: ' + e.stack); }
  console.log(log.join('\n'));
  console.log('ERRORS: ' + errors.length);
  errors.slice(0, 15).forEach(e => console.log(' - ' + e));
  process.exit(errors.length ? 1 : 0);
}, 1200);
