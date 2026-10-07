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
  const pane = () => doc.getElementById('todoPane');
  const cardsOf = () => [...pane().querySelectorAll('.card')];
  const titles = () => [...pane().querySelectorAll('.card-title')]
    .map(t => (t.textContent.match(/[\u4e00-\u9fa5]{2,7}/g) || ['?'])[0]);
  try {
    const M = window.Modules;
    // 切到「找点乐子」
    [...doc.querySelectorAll('#todoTabs .tab')].find(t => t.dataset.t === 'fun').click();

    log.push('1) 酸奶聊天已删除: ' + !/和酸奶聊聊天/.test(pane().textContent));
    log.push('   chatBox 不存在: ' + !doc.getElementById('chatBox'));
    log.push('2) 卡片顺序: ' + titles().join(' > '));

    // 3) 想做的有趣事情
    log.push('3) 第 1 张是「想做的有趣事情」: ' + /想做的有趣事情/.test(titles()[0]));
    doc.getElementById('wishAdd').click();
    let b = body();
    b.querySelector('#rtEdit').textContent = '去公园发呆一小时';
    b.querySelector('#rtSave').click();
    doc.getElementById('wishAdd').click();
    b = body();
    b.querySelector('#rtEdit').textContent = '学会做拿手菜';
    b.querySelector('#rtSave').click();
    log.push('   添加 2 条愿望: ' + window.DB.get('wishes', []).length);
    const items = () => [...pane().querySelectorAll('.wish-item')];
    items()[0].querySelector('[data-act="week"]').click();
    log.push('   本周标记数: ' + window.DB.get('wishes', []).filter(x => x.week).length);
    log.push('   排序后首条带 ⭐: ' + items()[0].querySelector('.wish-week').textContent.includes('⭐'));
    log.push('   wishCnt: "' + doc.getElementById('wishCnt').textContent + '"');
    const fb = doc.getElementById('wishFilter');
    const seq = [];
    for (let i = 0; i < 4; i++) { fb.click(); seq.push(fb.textContent + '(' + items().length + ')'); }
    log.push('   过滤循环: ' + seq.join(' → '));

    // 4) 未来信件箱
    const idxL = cardsOf().findIndex(c => /未来信件箱/.test(c.textContent));
    const idxD = cardsOf().findIndex(c => /转个骰子/.test(c.textContent));
    const idxC = cardsOf().findIndex(c => /给你的一张小便签/.test(c.textContent));
    log.push('4) 信件箱=' + idxL + ' 骰子=' + idxD + ' 便签=' + idxC + ' | 顺序正确: ' + (idxL === 1 && idxD === 2 && idxC === 3));
    log.push('   空态: ' + /信件箱还是空的/.test(doc.getElementById('letterList').textContent));

    const addLetter = (title, stage, v) => {
      doc.getElementById('letterAdd').click();
      const bb = body();
      bb.querySelector('#ltTitle').value = title;
      bb.querySelector('#ltStage').value = stage;
      bb.querySelector('#ltRange').value = String(v);
      bb.querySelector('#ltSave').click();
    };
    addLetter('把阳台收拾出来', '收纳箱已买', 40);
    addLetter('学会游泳换气', '', 0);
    addLetter('和房东谈续租', '已经发消息了', 100);
    log.push('   添加 3 封: ' + window.DB.get('future.letters', []).length);
    log.push('   letterCnt: "' + doc.getElementById('letterCnt').textContent + '"');
    const rows = () => [...doc.getElementById('letterList').querySelectorAll('.letter-item')];
    log.push('   进度条数: ' + doc.getElementById('letterList').querySelectorAll('.lt-bar').length);
    log.push('   百分比: ' + rows().map(r => r.querySelector('.lt-pct').textContent).join(' , '));
    log.push('   完成项排最后: ' + rows()[rows().length - 1].querySelector('.t').textContent);
    log.push('   阶段文案(第2条): ' + rows()[1].querySelector('.lt-stage').textContent.trim());

    rows()[0].click();
    b = body();
    log.push('   弹窗: ' + doc.getElementById('modalTitle').textContent +
      ' | 预填标题=' + b.querySelector('#ltTitle').value +
      ' | 阶段="' + b.querySelector('#ltStage').value + '"' +
      ' | 进度=' + b.querySelector('#ltRange').value);
    [...b.querySelectorAll('.lt-quick .chip')].find(c => c.dataset.v === '75').click();
    log.push('   点「过半啦」: ' + b.querySelector('#ltRange').value + ' / ' + b.querySelector('#ltPctTxt').textContent);
    b.querySelector('#ltSave').click();
    log.push('   保存后进度: ' + window.DB.get('future.letters', []).find(x => x.title === '把阳台收拾出来').progress + '%');
    log.push('   未重复新增: ' + window.DB.get('future.letters', []).length + ' 封');

    // 5) 骰子 + 便签
    log.push('5) 骰子仍在: ' + !!doc.getElementById('dice'));
    const n1 = doc.getElementById('comfortNote').textContent;
    doc.getElementById('comfortNext').click();
    const n2 = doc.getElementById('comfortNote').textContent;
    log.push('6) 便签有内容: ' + (n1.length > 10) + ' | 换一句生效: ' + (n1 !== n2));
    log.push('   便签首句: "' + n1.split('\n')[0].slice(0, 20) + '…"');

    // 7) 其它 tab + 全模块
    [...doc.querySelectorAll('#todoTabs .tab')].find(t => t.dataset.t === 'work').click();
    log.push('7) 做点正事 OK: ' + pane().querySelectorAll('.card').length + ' 张卡');
    [...doc.querySelectorAll('#todoTabs .tab')].find(t => t.dataset.t === 'mood').click();
    log.push('   今日心情 OK: ' + pane().querySelectorAll('.card').length + ' 张卡');
    Object.keys(M).forEach(k => {
      const d = doc.createElement('div'); doc.body.appendChild(d);
      try { M[k].render(d); } catch (e) { errors.push('render ' + k + ': ' + e.stack); }
    });
    log.push('   全模块渲染 OK');
  } catch (e) { errors.push('THROW: ' + e.stack); }
  console.log(log.join('\n'));
  console.log('ERRORS: ' + errors.length);
  errors.slice(0, 10).forEach(e => console.log(' - ' + e));
  process.exit(errors.length ? 1 : 0);
}, 1200);
