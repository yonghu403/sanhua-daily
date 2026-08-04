// 走走停停 —— 中国真实地市级边界(可缩放/平移) + 其他大洲国家级彩色地图
(function () {
  let curRegion = 'china';
  let pending = null;
  // 缩放/平移状态（仅中国地图用）
  let z = { s:1, tx:0, ty:0 };
  let moved = false;

  const REGION_VIEWS = {
    china:  { name: '中国', cx: 105, cy: 36, s: 1 },
    asia:   { name: '亚洲', cx: 100, cy: 35, s: 0.55 },
    europe: { name: '欧洲', cx: 15, cy: 50, s: 0.7 },
    na:     { name: '北美', cx: -100, cy: 45, s: 0.55 },
    sa:     { name: '南美', cx: -60, cy: -15, s: 0.6 },
    africa: { name: '非洲', cx: 20, cy: 5, s: 0.55 },
    oceania:{ name: '大洋洲', cx: 135, cy: -25, s: 0.8 },
    world:  { name: '世界', cx: 15, cy: 25, s: 0.38 }
  };

  // ===== 配色 =====
  const SEA  = '#B4DCEA';   // 海洋（蓝色）
  // 中国按地理大区上不同颜色
  const REGION_COLORS = {
    ne:'#F4A9C0', // 东北·粉
    n :'#F6B26B', // 华北·橙
    e :'#F8D26A', // 华东·黄
    s :'#9FC99A', // 华南·绿
    nw:'#86B5D8', // 西北·蓝
    sw:'#B79BD8'  // 西南·紫
  };

  // ===== 国家级彩色地图数据 =====
  // 每个大洲：viewBox + 国家数组(路径+颜色+中文名+英文名/代码)
  // 颜色参考用户给的中东图：柔和粉彩，相邻国家颜色不同

  const CONTINENT_MAPS = {

    // ── 亚洲（重点：中东参照用户给的图） ──
    asia: {
      vb: '0 0 680 520',
      countries: [
        // ★ 中东地区（参照用户参考图的布局和配色）
        {p:'M365 195 L395 188 L418 195 L430 215 L425 240 L405 255 L375 250 L358 230 Z', c:'#A8D5BA', n:'土耳其', e:'TURKEY'},
        {p:'M338 242 L362 238 L375 250 L370 275 L350 282 L335 270 L330 252 Z', c:'#F5E6CA', n:'叙利亚', e:'SYRIA'},
        {p:'M320 258 L335 270 L340 290 L330 308 L310 305 L302 282 Z', c:'#B8E0F0', n:'伊拉克', e:'IRAQ'},
        {p:'M295 275 L305 280 L308 300 L298 318 L278 315 L270 292 Z', c:'#F5D5E0', n:'约旦', e:'JORDAN'},
        {p:'M268 295 L280 300 L285 325 L275 348 L252 345 L245 318 Z', c:'#FFE4B5', n:'黎巴嫩/以色列/巴勒斯坦', e:'LEBANON'},
        {p:'M250 310 L260 315 L262 340 L250 360 L228 355 L222 328 Z', c:'#DDD5F0', n:'埃及', e:'EGYPT'},
        {p:'M340 295 L372 290 L395 300 L400 330 L380 355 L345 350 L330 322 Z', c:'#F8C8DC', n:'伊朗', e:'IRAN'},
        {p:'M398 305 L430 300 L455 315 L460 348 L440 368 L405 362 L390 333 Z', c:'#E8B4BC', n:'科威特/沙特', e:'SAUDI'},
        {p:'M450 340 L472 338 L488 355 L485 380 L465 392 L445 382 Z', c:'#F0D8B0', n:'阿联酋/阿曼', e:'UAE/OMAN'},
        {p:'M430 368 L452 365 L468 382 L465 410 L442 420 L422 405 Z', c:'#C8E0D8', n:'也门', e:'YEMEN'},
        {p:'M372 290 L395 285 L408 298 L402 318 L380 322 Z', c:'#B0C8E0', n:'卡塔尔/巴林', e:'QATAR/BAHRAIN'},

        // 中亚
        {p:'M280 175 L340 168 L365 185 L358 210 L330 222 L295 215 L272 195 Z', c:'#D4E0C8', n:'哈萨克斯坦', e:'KAZAKHSTAN'},
        {p:'M255 218 L285 212 L300 230 L292 255 L268 260 L248 242 Z', c:'#F0E0B8', n:'乌兹别克斯坦', e:'UZBEKISTAN'},
        {p:'M228 235 L252 230 L268 248 L260 272 L238 275 L220 255 Z', c:'#E0D0F0', n:'土库曼斯坦', e:'TURKMENISTAN'},
        {p:'M232 268 L258 264 L270 285 L260 308 L238 310 L222 290 Z', c:'#D8F0E0', n:'塔吉克斯坦/吉尔吉斯', e:'TAJIK/KYRGYZ'},

        // 南亚
        {p:'M240 320 L295 312 L325 335 L318 385 L280 410 L235 390 L225 348 Z', c:'#F5D8C8', n:'巴基斯坦', e:'PAKISTAN'},
        {p:'M295 340 L335 332 L358 360 L348 410 L315 435 L285 410 Z', c:'#C8D8F0', n:'印度', e:'INDIA'},
        {p:'M330 398 L355 390 L368 415 L358 445 L335 452 L320 428 Z', c:'#E8F0C8', n:'孟加拉国', e:'BANGLADESH'},
        {p:'M312 425 L338 418 L348 445 L338 475 L315 480 L302 452 Z', c:'#F0C8D8', n:'斯里兰卡', e:'SRI LANKA'},
        {p:'M218 345 L242 340 L255 365 L245 390 L222 392 Z', c:'#D8E0F0', n:'阿富汗', e:'AFGHANISTAN'},
        {p:'M198 338 L222 332 L235 355 L225 378 L202 380 Z', c:'#E0F0D8', n:'尼泊尔/不丹', e:'NEPAL/BHUTAN'},

        // 东亚（不含中国）
        {p:'M465 165 L498 160 L515 178 L508 205 L482 212 L460 195 Z', c:'#F0D0D0', n:'蒙古', e:'MONGOLIA'},
        {p:'M478 208 L512 202 L532 222 L525 255 L495 262 L472 245 Z', c:'#D0D8F0', n:'朝鲜/韩国', e:'N/S KOREA'},
        {p:'M500 228 L542 220 L568 245 L558 285 L522 295 L492 275 Z', c:'#D0F0E0', n:'日本', e:'JAPAN'},

        // 东南亚
        {p:'M355 365 L405 355 L435 378 L425 420 L385 435 L348 412 Z', c:'#F0E0D0', n:'缅甸', e:'MYANMAR'},
        {p:'M408 398 L445 390 L468 412 L458 448 L422 458 L392 438 Z', c:'#E0D8F0', n:'泰国', e:'THAILAND'},
        {p:'M438 445 L468 438 L488 458 L478 490 L448 498 L425 478 Z', c:'#D8F0E0', n:'柬埔寨/越南南部', e:'CAMBODIA/VN'},
        {p:'M460 478 L490 472 L508 492 L498 518 L468 522 Z', c:'#F0D8E0', n:'马来西亚', e:'MALAYSIA'},
        {p:'M475 508 L502 502 L518 518 L508 538 L480 542 Z', c:'#E0E8F0', n:'印尼', e:'INDONESIA'},
        {p:'M382 432 L410 425 L425 445 L415 468 L388 472 Z', c:'#F0F0D0', n:'老挝', e:'LAOS'},
        {p:'M418 458 L448 450 L465 472 L455 498 L425 502 Z', c:'#D8E0F0', n:'越南', e:'VIETNAM'},
        {p:'M342 398 L368 392 L382 412 L372 438 L345 440 Z', c:'#E8D8C8', n:'孟加拉/印度东部', e:'E INDIA'},
        {p:'M422 358 L455 350 L475 368 L465 395 L435 400 Z', c:'#C8D0E8', n:'菲律宾', e:'PHILIPPINES'}
      ]
    },

    // ── 欧洲 ──
    europe: {
      vb: '0 0 520 480',
      countries: [
        // 西欧
        {p:'M145 155 L182 148 L200 168 L192 198 L162 205 L138 182 Z', c:'#F0D8D8', n:'英国/爱尔兰', e:'UK/IRELAND'},
        {p:'M175 195 L215 188 L238 210 L228 245 L195 252 L170 228 Z', c:'#D8E8F0', n:'法国', e:'FRANCE'},
        {p:'M228 172 L262 165 L282 185 L275 215 L248 222 L225 200 Z', c:'#D8F0D8', n:'德国', e:'GERMANY'},
        {p:'M200 228 L235 222 L255 245 L245 278 L215 285 Z', c:'#F0E8D8', n:'西班牙/葡萄牙', e:'SPAIN/PORTUGAL'},
        {p:'M240 258 L272 252 L290 275 L280 305 L252 312 Z', c:'#E8D8F0', n:'意大利', e:'ITALY'},
        {p:'M268 165 L298 158 L315 175 L308 200 L282 205 Z', c:'#F0F0D0', n:'波兰', e:'POLAND'},
        {p:'M215 152 L245 146 L262 162 L255 185 L228 190 Z', c:'#D0E0F0', n:'荷兰/比利时', e:'NL/BELGIUM'},
        {p:'M195 185 L225 180 L240 198 L232 220 L205 222 Z', c:'#F0D8E8', n:'瑞士/奥地利', e:'CH/AUSTRIA'},

        // 北欧
        {p:'M258 62 L310 52 L340 72 L332 115 L298 128 L262 108 Z', c:'#D8D8F0', n:'挪威/瑞典', e:'NORWAY/SWEDEN'},
        {p:'M298 105 L332 98 L352 118 L342 148 L312 152 Z', c:'#D8F0E0', n:'芬兰', e:'FINLAND'},
        {p:'M232 112 L268 105 L285 125 L275 152 L248 155 Z', c:'#E0D8D8', n:'丹麦', e:'DENMARK'},

        // 东欧
        {p:'M305 165 L345 158 L368 182 L358 218 L322 228 Z', c:'#F0E0D0', n:'乌克兰', e:'UKRAINE'},
        {p:'M345 148 L382 140 L402 162 L392 195 L358 202 Z', c:'#E0F0D8', n:'白俄罗斯', e:'BELARUS'},
        {p:'M368 175 L405 168 L425 190 L415 225 L378 232 Z', c:'#D8E0F0', n:'俄罗斯西部', e:'W RUSSIA'},
        {p:'M320 210 L355 202 L375 225 L365 258 L332 265 Z', c:'#F0D8F0', n:'罗马尼亚/保加利亚', e:'ROM/BULGARIA'},
        {p:'M285 205 L320 198 L340 218 L330 248 Z', c:'#E8F0D8', n:'捷克/匈牙利/斯洛伐克', e:'CZ/HU/SVK'},
        {p:'M348 238 L382 230 L400 252 L390 282 L358 288 Z', c:'#F0E0D8', n:'土耳其欧洲部分', e:'TURKEY(E)'},
        {p:'M255 195 L285 188 L302 208 L292 235 L265 238 Z', c:'#D8D8E0', n:'巴尔干诸国', e:'BALKANS'},

        // 南欧
        {p:'M175 252 L205 246 L222 268 L212 298 L182 302 Z', c:'#E8F0D8', n:'希腊', e:'GREECE'}
      ]
    },

    // ── 非洲 ──
    africa: {
      vb: '0 0 520 580',
      countries: [
        // 北非
        {p:'M145 185 L245 172 L285 195 L275 240 L215 255 L135 232 Z', c:'#F0E0D0', n:'阿尔及利亚/利比亚', e:'ALG/LIBYA'},
        {p:'M120 218 L165 210185 235 L175 275 L130 285 Z', c:'#D8E8F0', n:'摩洛哥', e:'MOROCCO'},
        {p:'M245 168 L295 160 318 182 308 218 275 225 Z', c:'#E8D8F0', n:'埃及', e:'EGYPT'},
        {p:'M275 228 318 220 340 245 328 280 290 265 Z', c:'#D8F0E0', n:'苏丹', e:'SUDAN'},
        {p:'M298 268 340 260 362 288 348 325 315 332 Z', c:'#F0D8D8', n:'埃塞俄比亚', e:'ETHIOPIA'},
        {p:'M325 318 365 310 385 340 372 378 340 385 Z', c:'#D0D8F0', n:'索马里/吉布提', e:'SOMALIA/DJIBOUTI'},
        {p:'M270 330 310 322 332 355 318 395 285 402 Z', c:'#E0F0D8', n:'肯尼亚/坦桑尼亚', e:'KENYA/TANZANIA'},
        {p:'M240 355 285 345 308 378 295 418 258 425 Z', c:'#F0E8D8', n:'刚果(金)/安哥拉', e:'CONGO/ANGOLA'},

        // 西非
        {p:'M135 275 185 265 208 295 195 340 155 348 Z', c:'#E8D0D8', n:'马里/布基纳法索', e:'MALI/BURKINA'},
        {p:'M155 340 200 332 225 365 210 408 170 415 Z', c:'#D8E0F0', n:'尼日利亚/加纳等', e:'NIGERIA/GHANA'},
        {p:'M115 335 158 325 178 355 165 395 128 402 Z', c:'#D8F0D8', n:'塞内加尔/几内亚', e:'SENEGAL/GUINEA'},
        {p:'M168 408 215 398 238 432 222 475 180 480 Z', c:'#F0D0E0', n:'刚果(布)/加蓬', e:'CONGO-B/GABON'},

        // 中南非
        {p:'M220 418 270 408 295 445 280 490 235 498 Z', c:'#D0E8F0', n:'赞比亚/津巴布韦', e:'ZAMBIA/ZIMBABWE'},
        {p:'M255 478 305 468 332 505 318 548 272 555 Z', c:'#E8F0D0', n:'南非/博茨瓦纳/纳米比亚', e:'S.AFRICA/BOT/NAM'},
        {p:'M295 492 332 482 355 515 342 550 308 558 Z', c:'#F0D8E8', n:'莫桑比克/马达加斯加', e:'MOZ/MADAGASCAR'},
        {p:'M185 470 228 462 248 492 235 530 195 538 Z', c:'#E0D8F0', n:'安哥拉南部/纳米比亚', e:'ANGOLA-S/NAMIBIA'}
      ]
    },

    // ── 北美 ──
    na: {
      vb: '0 0 520 520',
      countries: [
        // 加拿大
        {p:'M85 45 195 32 245 58 235 105 175 122 95 108 Z', c:'#E8E0F0', n:'加拿大', e:'CANADA'},
        {p:'M195 28 280 18 325 45 312 88 258 102 205 92 Z', c:'#D8E8F0', n:'加拿大东部', e:'CANADA-E'},
        {p:'M60 82 100 75 130 95 120 132 78 142 Z', c:'#F0E0D8', n:'阿拉斯加', e:'ALASKA'},

        // 美国
        {p:'M95 125 195 110 248 138 238 185 175 205 98 188 Z', c:'#F0D8D8', n:'美国本土', e:'USA'},
        {p:'M195 108 270 95 310 122 298 165 250 182 Z', c:'#D8F0E0', n:'美国东部', e:'USA-EAST'},
        {p:'M78 175 105 168 125 195 115 228 85 235 Z', c:'#E0D8F0', n:'墨西哥北部', e:'MEXICO-N'},

        // 墨西哥/中美
        {p:'M85 225 140 215 172 245 158 290 110 302 Z', c:'#F0E8D8', n:'墨西哥', e:'MEXICO'},
        {p:'M155 285 195 275 218 305 205 345 168 355 Z', c:'#D8E0F0', n:'中美洲诸国', e:'CENTRAL AM.'},
        {p:'M195 338 235 328 258 358 248 395 210 405 Z', c:'#E8F0D8', n:'巴拿马/哥斯达黎加', e:'PANAMA/CR'},

        // 加勒比
        {p:'M235 275 275 265 298 290 288 322 252 332 Z', c:'#F0D0E0', n:'古巴/海地等', e:'CUBA/HAITI'}
      ]
    },

    // ── 南美 ──
    sa: {
      vb: '0 0 420 620',
      countries: [
        {p:'M145 95 215 82 268 112 255 165 195 182 128 165 Z', c:'#D8E8F0', n:'哥伦比亚', e:'COLOMBIA'},
        {p:'M165 172 235 158 278 188 265 242 205 258 Z', c:'#F0E0D8', n:'委内瑞拉', e:'VENEZUELA'},
        {p:'M115 165 150 155 175 185 162 228 125 238 Z', c:'#E8F0D8', n:'厄瓜多尔/秘鲁北部', e:'ECUADOR/N-PERU'},
        {p:'M125 235 172 225 205 258 192 318 145 332 Z', c:'#F0D8D8', n:'秘鲁', e:'PERU'},
        {p:'M188 258 255 245 292 282 278 348 218 362 Z', c:'#D8D8F0', n:'巴西', e:'BRAZIL'},
        {p:'M195 348 262 335 298 372 282 435 218 448 Z', c:'#D8F0E0', n:'巴西东南部', e:'BRAZIL-SE'},
        {p:'M255 352 298 342 325 378 312 432 275 445 Z', c:'#E0F0D8', n:'巴西东部', e:'BRAZIL-E'},
        {p:'M95 322 148 310 182 348 168 408 115 422 Z', c:'#F0E0E8', n:'智利/玻利维亚', e:'CHILE/BOLIVIA'},
        {p:'M95 410 155 398 188 438 172 505 112 518 Z', c:'#E8D8F0', n:'智利南部/阿根廷', e:'CHILE-S/ARG'},
        {p:'M162 445 218 432 255 472 238 542 178 555 Z', c:'#D0E0F0', n:'阿根廷', e:'ARGENTINA'},
        {p:'M175 542 235 528 268 565 252 608 195 618 Z', c:'#F0D8D0', n:'阿根廷南部/巴塔哥尼亚', e:'PATAGONIA'},
        {p:'M268 428 308 418 335 455 322 512 280 525 Z', c:'#E0D8F0', n:'乌拉圭/巴拉圭', e:'URUGUAY/PARAGUAY'},
        {p:'M278 352 322 342 348 378 335 425 298 435 Z', c:'#F0F0D8', n:'巴西东北部', e:'BRAZIL-NE'}
      ]
    },

    // ── 大洋洲 ──
    oceania: {
      vb: '0 0 520 420',
      countries: [
        {p:'M85 165 195 145 268 178 248 248 155 272 Z', c:'#F0D8D8', n:'澳大利亚西部', e:'AUSTRALIA-W'},
        {p:'M185 148 295 128 368 162 348 235 248 258 Z', c:'#D8E8F0', n:'澳大利亚中部/东部', e:'AUSTRALIA-C/E'},
        {p:'M248 238 358 218 408 255 388 322 292 342 Z', c:'#D8F0E0', n:'澳大利亚东南部', e:'AUSTRALIA-SE'},
        {p:'M145 268 255 248 298 282 278 348 175 368 Z', c:'#E8D0D8', n:'澳大利亚南部', e:'AUSTRALIA-S'},
        {p:'M285 338 368 322 408 355 388 408 305 418 Z', c:'#F0E0D8', n:'塔斯马尼亚/新西兰', e:'TASMANIA/NZ'},
        {p:'M345 95 405 82 445 108 428 155 378 168 Z', c:'#E0D8F0', n:'巴布亚新几内亚', e:'PAPUA N.G.'},
        {p:'M385 165 438 152 472 178 455 218 408 228 Z', c:'#D8D8F0', n:'所罗门/斐济等岛国', e:'ISLANDS'},
        {p:'M95 95 155 82 195 108 178 148 125 155 Z', c:'#F0F0D8', n:'印尼群岛(大洋洲部分)', e:'INDONESIA-O'}
      ]
    },

    // ── 世界（简化版：各大洲轮廓） ──
    world: {
      vb: '0 0 680 400',
      countries: [
        {p:'M85 65 195 52 248 78 238 125 175 142 95 128 Z', c:'#E8E0F0', n:'北美洲', e:'N.AMERICA'},
        {p:'M145 175 215 162 268 192 255 245 195 262 128 245 Z', c:'#F0D8D8', n:'南美洲', e:'S.AMERICA'},
        {p:'M275 72 365 58 418 88 405 145 358 168 295 145 268 108 Z', c:'#D8E8F0', n:'欧洲', e:'EUROPE'},
        {p:'M365 85 525 65 588 108 572 185 525 228 455 245 395 215 365 165 Z', c:'#D8F0E0', n:'亚洲', e:'ASIA'},
        {p:'M295 195 405 178 455 215 442 298 395 345 332 318 305 245 Z', c:'#F0E0D8', n:'非洲', e:'AFRICA'},
        {p:'M495 245 578 228 618 262 598 325 545 345 508 305 Z', c:'#E8D8F0', n:'大洋洲', e:'OCEANIA'}
      ]
    }
  };

  /* 数据 */
  const DB_KEY = 'travel';
  const get = () => DB.get(DB_KEY, { cities:[], notes:[] });
  const set = (v) => DB.set(DB_KEY, v);
  function uid() { return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }

  /* 文本截断（按字符数，含中文）前 n 字 + 省略号 */
  function cutN(s, n) {
    if (!s) return '';
    const a = Array.from(String(s).trim());
    return a.length > n ? a.slice(0, n).join('') + '…' : a.join('');
  }

  /* 图片文件 → dataURL（压缩到合适尺寸，避免撑爆 IndexedDB） */
  function fileToDataURL(file, maxW, cb) {
    if (!file || !/^image\//.test(file.type)) { cb(null); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const w = img.width, h = img.height;
        const scale = Math.min(1, maxW / w);
        const cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
        try {
          const cv = document.createElement('canvas');
          cv.width = cw; cv.height = ch;
          cv.getContext('2d').drawImage(img, 0, 0, cw, ch);
          cb(cv.toDataURL('image/jpeg', 0.82));
        } catch (_) { cb(reader.result); }
      };
      img.onerror = () => cb(reader.result);
      img.src = reader.result;
    };
    reader.onerror = () => cb(null);
    reader.readAsDataURL(file);
  }

  /* 城市坐标查询 */
  function cityPos(region, name) {
    if (region === 'china' && window.CN_ROOSTER) {
      const idx = window.CN_ROOSTER.CITY_INDEX || [];
      let hit = idx.find(c => c.name === name);
      if (!hit) hit = idx.find(c => name && (c.name.includes(name) || name.includes(c.name)));
      return hit ? { x:hit.x, y:hit.y, prov:hit.prov } : null;
    }
    // 其他大洲：返回该区域内的随机位置
    const bounds = {
      asia:{x:340,y:260,w:200,h:180}, europe:{x:260,y:200,w:140,h:150},
      na:{x:180,y:180,w:160,h:160}, sa:{x:180,y:280,w:100,h:180},
      africa:{x:220,y:260,w:140,h:180}, oceania:{x:220,y:200,w:160,h:120}
    };
    const b = bounds[region] || {x:220,y:200,w:200,h:150};
    return { x: b.x + Math.random()*b.w, y: b.y + Math.random()*b.h };
  }

  /* 地图框宽高比：依据该区域 viewBox，框固定比例不随缩放变化 */
  function frameRatio(region) {
    if (region === 'china' && window.CN_ROOSTER) {
      const vb = window.CN_ROOSTER.vb; return (vb[2] / vb[3]).toFixed(3);
    }
    const c = CONTINENT_MAPS[region];
    if (c && c.vb) { const p = c.vb.split(' ').map(Number); return (p[2] / p[3]).toFixed(3); }
    return '1.19';
  }

  /* 渲染地图 SVG */
  function renderMapSVG(container, region) {
    z = { s:1, tx:0, ty:0 };
    moved = false;
    // 地图框用 CSS 固定比例（.travel-map），SVG 填满框；缩放只改框内 viewBox，框本身大小纹丝不动

    // ===== 中国：雄鸡造型 + 缩放/平移 =====
    if (region === 'china' && window.CN_ROOSTER) {
      const R = window.CN_ROOSTER;
      const vb = R.vb;
      const provs = R.provinces || [];

      let svg = `<svg id="cnMap" viewBox="${vb[0]} ${vb[1]} ${vb[2]} ${vb[3]}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;touch-action:none;cursor:grab;">
        <style>
          #cnMap .prov{transition:opacity .15s;}
          #cnMap .prov-lbl{transition:opacity .15s;font-family:sans-serif;}
          #cnMap .clbl{opacity:0;pointer-events:none;transition:opacity .2s;font-family:sans-serif;}
          #cnMap.zoomed .clbl{opacity:1;}
          #cnMap.hide-prov .prov-lbl{opacity:0;}
          #cnMap .city-marker{cursor:pointer;}
        </style>
        <g id="mapZoom">
          <path d="${R.base}" fill="#FBF1DD" stroke="#6B4630" stroke-width="2" vector-effect="non-scaling-stroke"/>`;

      // 各省彩色块 + 省名
      provs.forEach(pr => {
        svg += `<path class="prov" d="${pr.d}" fill="${R.RC[pr.r]||'#E8D9BC'}" stroke="#8A6A4A" stroke-width="0.8" vector-effect="non-scaling-stroke"/>`;
        svg += `<text class="prov-lbl" data-base="11" x="${pr.x}" y="${pr.y}" fill="#5A3D28" text-anchor="middle" pointer-events="none">${esc(pr.n)}</text>`;
      });
      // 城市点（放大后显示）
      provs.forEach(pr => (pr.cities||[]).forEach(c => {
        svg += `<circle class="clbl city-dot" cx="${c.x}" cy="${c.y-3}" r="2.6" fill="#FF8C5A"/>`;
        svg += `<text class="clbl" data-base="9" x="${c.x}" y="${c.y+12}" fill="#5A3D28" text-anchor="middle">${esc(c.n)}</text>`;
      }));

      // 足迹标记（猫爪印）
      const data = get();
      (data.cities||[]).filter(c => c.region === 'china').forEach(city => {
        const pos = cityPos('china', city.name);
        if (pos) {
          svg += `<g class="city-marker" data-id="${city.id}" transform="translate(${pos.x},${pos.y})">
            <ellipse cx="0" cy="-9" rx="5" ry="6.5" fill="#FF8C5A" opacity=".9"/>
            <ellipse cx="-7" cy="3" rx="4.5" ry="5.5" fill="#FF8C5A" opacity=".85"/>
            <ellipse cx="7" cy="3" rx="4.5" ry="5.5" fill="#FF8C5A" opacity=".85"/>
            <ellipse cx="-11" cy="11" rx="3.3" ry="4.3" fill="#FF8C5A" opacity=".75"/>
            <ellipse cx="0" cy="13" rx="3.3" ry="4.3" fill="#FF8C5A" opacity=".75"/>
            <ellipse cx="11" cy="11" rx="3.3" ry="4.3" fill="#FF8C5A" opacity=".75"/>
            <text class="paw-name" data-base="11" y="-19" fill="#6B4630" text-anchor="middle" font-weight="bold" style="paint-order:stroke;stroke:#fff;stroke-width:2.5px;">${esc(city.name)}</text>
          </g>`;
        }
      });

      svg += '</g></svg>';
      container.innerHTML = svg + `<div class="map-zoombar"><button id="mapZoomIn" type="button">放大</button><button id="mapZoomOut" type="button">缩小</button><button id="mapZoomReset" type="button">复位</button></div>`;
      bindZoomPan(container.querySelector('#cnMap'));
      return;
    }

    // ===== 其他大洲：国家级彩色地图 =====
    const cmap = CONTINENT_MAPS[region];
    let svg = `<svg viewBox="${cmap ? cmap.vb : '0 0 450 360'}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block;">
      <style>
        .ctr{transition:opacity .15s,fill-opacity .15s;cursor:pointer;}
        .ctr:hover{fill-opacity:.7;}
        .cnam{font-family:sans-serif;font-size:7px;fill:#4A3628;pointer-events:none;text-anchor:middle;font-weight:500;}
        .csub{font-family:sans-serif;font-size:5px;fill:#8A7A64;pointer-events:none;text-anchor:middle;}
      </style>`;

    if (cmap && cmap.countries) {
      cmap.countries.forEach(ctry => {
        svg += `<path class="ctr" d="${ctry.p}" fill="${ctry.c}" stroke="#9A8874" stroke-width="0.7" fill-rule="evenodd">
          <title>${ctry.n} (${ctry.e})</title>
        </path>`;
        // 计算简单中心放标签
        const ctr = simpleCenter(ctry.p);
        svg += `<text x="${ctr.x}" y="${ctr.y}" class="cnam">${ctry.n}</text>`;
        svg += `<text x="${ctr.x}" y="${ctr.y+9}" class="csub">${ctry.e}</text>`;
      });
    } else if (region === 'world') {
      // 世界视图用大洲轮廓
      const wmap = CONTINENT_MAPS.world;
      if (wmap) wmap.countries.forEach(ctry => {
        svg += `<path class="ctr" d="${ctry.p}" fill="${ctry.c}" stroke="#9A8874" stroke-width="1"/>`;
        const ctr = simpleCenter(ctry.p);
        svg += `<text x="${ctr.x}" y="${ctr.y}" class="cnam" font-size="10">${ctry.n}</text>`;
      });
    }

    // 足迹标记（其他大洲）
    const data = get();
    (data.cities||[]).filter(c => c.region === region).forEach(city => {
      const pos = cityPos(region, city.name);
      if (pos) {
        svg += `<g class="city-marker" data-id="${city.id}" transform="translate(${pos.x},${pos.y})" style="cursor:pointer">
          <ellipse cx="0" cy="-6" rx="3.5" ry="4.5" fill="#FF8C5A" opacity=".85"/>
          <ellipse cx="-5" cy="2" rx="3" ry="3.8" fill="#FF8C5A" opacity=".8"/>
          <ellipse cx="5" cy="2" rx="3" ry="3.8" fill="#FF8C5A" opacity=".8"/>
          <ellipse cx="-8" cy="8" rx="2.2" ry="3" fill="#FF8C5A" opacity=".7"/>
          <ellipse cx="0" cy="10" rx="2.2" ry="3" fill="#FF8C5A" opacity=".7"/>
          <ellipse cx="8" cy="8" rx="2.2" ry="3" fill="#FF8C5A" opacity=".7"/>
          <text y="-14" font-size="6" fill="#6B4630" text-anchor="middle" font-weight="bold">${esc(city.name)}</text>
        </g>`;
      }
    });

    svg += '</svg>';
    container.innerHTML = svg;
    container.onclick = (e) => {
      const marker = e.target.closest('.city-marker');
      if (marker) { showCityDetail(marker.dataset.id); return; }
      showAddCity();
    };
  }

  /* 简单路径中心估算（取所有点的平均） */
  function simpleCenter(d) {
    const nums = d.match(/[-\d.]+/g);
    if (!nums || nums.length < 4) return {x:200,y:200};
    let sx=0,sy=0,cnt=0;
    for (let i=0;i<nums.length-1;i+=2) {
      sx+=parseFloat(nums[i]); sy+=parseFloat(nums[i+1]); cnt++;
    }
    return {x: sx/cnt, y: sy/cnt};
  }

  /* 缩放/平移交互（仅中国地图）—— 基于 viewBox 缩放，地名/标记保持清晰可读大小 */
  function bindZoomPan(svg) {
    if (!svg) return;
    const vb = (window.CN_ROOSTER && window.CN_ROOSTER.vb) || [0,0,1000,840];
    const VW = vb[2], VH = vb[3], VX = vb[0], VY = vb[1];
    let zs = 1, zcx = VX + VW/2, zcy = VY + VH/2;
    const clamp = (v,a,b) => Math.min(b, Math.max(a, v));

    function apply() {
      const w = VW/zs, h = VH/zs;
      svg.setAttribute('viewBox', `${(zcx-w/2).toFixed(2)} ${(zcy-h/2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);
      // 文本与城市点保持“屏幕恒定大小”：除以当前缩放比
      const k = (1/zs).toFixed(3);
      svg.querySelectorAll('text[data-base]').forEach(t => t.setAttribute('font-size', (parseFloat(t.dataset.base) * k).toFixed(2)));
      svg.querySelectorAll('.city-dot').forEach(c => c.setAttribute('r', (2.6 * k).toFixed(2)));
      svg.classList.toggle('zoomed', zs > 1.4);
      svg.classList.toggle('hide-prov', zs > 1.9);
    }
    function clientToWorld(e) {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const m = svg.getScreenCTM(); if (!m) return null;
      return pt.matrixTransform(m.inverse());
    }
    function zoomAt(wx, wy, factor) {
      const ns = clamp(zs * factor, 1, 6);
      const ratio = ns / zs;
      zcx = wx + (zcx - wx) / ratio;
      zcy = wy + (zcy - wy) / ratio;
      zs = ns; apply();
    }
    function centerOn(x, y, s) {
      zs = clamp(s, 1, 6); zcx = x; zcy = y; apply();
    }
    window.__cnCenterOn = centerOn;

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const wpt = clientToWorld(e);
      if (wpt) zoomAt(wpt.x, wpt.y, e.deltaY < 0 ? 1.3 : 1/1.3);
    }, { passive: false });

    let dragging = false, lastX = 0, lastY = 0, downX = 0, downY = 0;
    svg.addEventListener('pointerdown', (e) => {
      dragging = true; moved = false;
      lastX = e.clientX; lastY = e.clientY; downX = e.clientX; downY = e.clientY;
      svg.style.cursor = 'grabbing';
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    });
    svg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const rect = svg.getBoundingClientRect();
      const dx = (e.clientX - lastX) / rect.width * (VW/zs);
      const dy = (e.clientY - lastY) / rect.height * (VH/zs);
      zcx -= dx; zcy -= dy; lastX = e.clientX; lastY = e.clientY;
      if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 4) moved = true;
      apply();
    });
    function endDrag(e) {
      dragging = false; svg.style.cursor = 'grab';
      try { svg.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('click', (e) => {
      if (moved) return;
      const marker = e.target.closest('.city-marker');
      if (marker) { showCityDetail(marker.dataset.id); return; }
      showAddCity();
    });

    const zin = document.getElementById('mapZoomIn');
    const zout = document.getElementById('mapZoomOut');
    const zreset = document.getElementById('mapZoomReset');
    if (zin) zin.onclick = () => { const c = svg.viewBox.baseVal; zoomAt(c.x + c.width/2, c.y + c.height/2, 1.5); };
    if (zout) zout.onclick = () => { const c = svg.viewBox.baseVal; zoomAt(c.x + c.width/2, c.y + c.height/2, 1/1.5); };
    if (zreset) zreset.onclick = () => { zs = 1; zcx = VX + VW/2; zcy = VY + VH/2; apply(); };
    apply();
  }

  /* 添加 / 编辑足迹弹窗（感想改为分类长文本） */
  function showCityDialog(existing, presetName) {
    const data = get();
    const isEdit = !!existing;
    const g = (k) => existing && existing[k] ? esc(existing[k]) : '';
    const nameVal = presetName ? esc(presetName) : g('name');
    const html = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:900;display:flex;align-items:center;justify-content:center;" id="cityDlg">
        <div class="card" style="max-width:440px;width:94%;max-height:88vh;overflow-y:auto;padding:20px;">
          <div class="card-title"><span class="ci">${Icons.globe()}</span>${isEdit?'✏️ 编辑旅行足迹':'✨ 添加旅行足迹'}</div>
          <div style="margin-top:12px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">📍 城市 / 地点名称</label>
            <input id="ciName" type="text" placeholder="例如：北京、东京、巴黎..." value="${nameVal}" style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;font-size:.95rem;background:#FFFBF5;">
          </div>
          <div style="margin-top:10px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">📅 到访日期</label>
            <input id="ciDate" type="date" value="${isEdit?(existing.date||today()):today()}" style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;font-size:.95rem;background:#FFFBF5;">
          </div>
          <div style="margin-top:12px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">👫 遇到的人</label>
            <textarea id="ciMeet" rows="2" placeholder="旅途中遇见的有趣的人..." style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;font-size:.92rem;background:#FFFBF5;resize:vertical;font-family:inherit;">${g('meet')}</textarea>
          </div>
          <div style="margin-top:10px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">💡 遇到的事</label>
            <textarea id="ciEvent" rows="2" placeholder="路上发生的故事、趣事..." style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;font-size:.92rem;background:#FFFBF5;resize:vertical;font-family:inherit;">${g('event')}</textarea>
          </div>
          <div style="margin-top:10px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">🍜 吃到的美食</label>
            <textarea id="ciFood" rows="2" placeholder="好吃的当地小吃、餐厅..." style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;font-size:.92rem;background:#FFFBF5;resize:vertical;font-family:inherit;">${g('food')}</textarea>
          </div>
          <div style="margin-top:10px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">🏞️ 看到的风景</label>
            <textarea id="ciScenery" rows="2" placeholder="难忘的风景、日落、街角..." style="width:100%;box-sizing:border-box;padding:8px 12px;border:2px solid #E8D9BC;border-radius:8px;font-size:.92rem;background:#FFFBF5;resize:vertical;font-family:inherit;">${g('scenery')}</textarea>
          </div>
          <div style="margin-top:12px;">
            <label style="font-size:.85rem;color:#8C6647;display:block;margin-bottom:4px;">🖼️ 上传图片</label>
            <input id="ciImg" type="file" accept="image/*" multiple style="width:100%;font-size:.85rem;color:#6B4630;">
            <div id="ciImgPrev" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;"></div>
          </div>
          <div style="margin-top:16px;display:flex;gap:8px;">
            <button class="btn primary" id="ciSave" style="flex:1">✅ 保存</button>
            ${isEdit?'<button class="btn" id="ciDel" style="flex:0 0 auto;color:#c0392b;border-color:#e7a;">🗑 删除</button>':''}
            <button class="btn" id="ciCancel" style="flex:1">取消</button>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', html);

    /* 图片上传：压缩 + 预览 + 删除 */
    let curImgs = existing && existing.images ? existing.images.slice() : [];
    const imgPrev = $('#ciImgPrev');
    function renderImgPrev() {
      if (!imgPrev) return;
      imgPrev.innerHTML = curImgs.map((src,i) =>
        `<div class="img-thumb" data-i="${i}"><img src="${src}" alt=""><span class="img-x" data-i="${i}">×</span></div>`
      ).join('');
      imgPrev.querySelectorAll('.img-x').forEach(x => x.onclick = () => {
        curImgs.splice(+x.dataset.i, 1); renderImgPrev();
      });
    }
    renderImgPrev();
    const ciImg = $('#ciImg');
    if (ciImg) ciImg.onchange = (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      files.forEach(f => fileToDataURL(f, 1200, (url) => { if (url) { curImgs.push(url); renderImgPrev(); } }));
      e.target.value = '';
    };

    $('#ciSave').onclick = () => {
      const name = $('#ciName').value.trim();
      if (!name) return toast('请输入地名');
      const rec = {
        id: isEdit ? existing.id : uid(),
        name, date: $('#ciDate').value, region: curRegion,
        meet: $('#ciMeet').value.trim(), event: $('#ciEvent').value.trim(),
        food: $('#ciFood').value.trim(), scenery: $('#ciScenery').value.trim(),
        images: curImgs.slice(),
        notes: existing && existing.notes ? existing.notes : []  // 兼容旧数据
      };
      data.cities = data.cities || [];
      if (isEdit) {
        const i = data.cities.findIndex(c => c.id === existing.id);
        if (i >= 0) data.cities[i] = rec;
      } else {
        data.cities.push(rec);
      }
      set(data);
      $('#cityDlg').remove();
      paint();
      toast(isEdit ? '🐾 已更新！' : '🐾 足迹已点亮！');
    };
    $('#ciCancel').onclick = () => $('#cityDlg').remove();
    if (isEdit) $('#ciDel').onclick = () => {
      if (!confirmBox('删除这个足迹？')) return;
      data.cities = data.cities.filter(c => c.id !== existing.id);
      set(data); $('#cityDlg').remove(); paint(); toast('已删除');
    };
  }

  /* 城市详情（展示分类游记，可点编辑） */
  const CAT_DEFS = [['👫','meet','遇到的人'],['💡','event','遇到的事'],['🍜','food','吃到的美食'],['🏞️','scenery','看到的风景']];
  function showCityDetail(id) {
    const data = get();
    const city = (data.cities||[]).find(c=>c.id===id);
    if (!city) return;
    const dlg = document.createElement('div');
    dlg.id = 'cityDetail';
    dlg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:900;display:flex;align-items:center;justify-content:center;';
    const cats = CAT_DEFS.map(([ic,k,label]) => city[k] ? `
      <div class="food-item" style="padding:10px 12px;margin-bottom:6px;">
        <div style="font-weight:600;color:#E07B20;">${ic} ${label}</div>
        <div style="font-size:.9rem;color:#4A3628;margin-top:3px;white-space:pre-wrap;line-height:1.5;">${esc(city[k])}</div>
      </div>` : '').join('');
    const imgs = (city.images||[]).length ? `
      <div class="city-img-gallery" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px;">
        ${(city.images||[]).map(src=>`<img class="city-img" src="${src}" alt="" style="width:74px;height:74px;object-fit:cover;border-radius:8px;border:1px solid #E8D9BC;">`).join('')}
      </div>` : '';
    dlg.innerHTML = `
      <div class="card" style="max-width:480px;width:94%;max-height:85vh;overflow-y:auto;padding:20px;">
        <div class="card-title"><span class="ci">${Icons.paw()}</span>${esc(city.name)} <small style="color:#9A8874;font-weight:normal">${city.date||''} · ${REGION_VIEWS[city.region]?REGION_VIEWS[city.region].name:''}</small></div>
        ${imgs}
        ${cats || '<p style="color:#9A8874;font-size:.85rem;margin-top:8px;">这次旅行还没记录任何内容～</p>'}
        <div style="margin-top:14px;display:flex;gap:8px;">
          <button class="btn primary" id="dlgEdit" style="flex:1">✏️ 编辑</button>
          <button class="btn" id="dlgClose" style="flex:1">关闭</button>
        </div>
      </div>`;
    document.body.appendChild(dlg);
    $('#dlgEdit').onclick = () => { dlg.remove(); showCityDialog(city); };
    $('#dlgClose').onclick = () => dlg.remove();
  }

  /* 主渲染 */
  function paint() {
    const pane = $('#trPane'); if(!pane)return;
    const data = get();
    const isCN = curRegion === 'china' && !!window.CN_ROOSTER;

    pane.innerHTML = `
      <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
        ${Object.entries(REGION_VIEWS).map(([k,v]) =>
          `<button class="chip sm ${curRegion===k?'on':''}" data-r="${k}">${v.name}</button>`
        ).join('')}
      </div>

      ${isCN ? `
      <div style="display:flex;gap:6px;margin-bottom:8px;align-items:center;flex-wrap:wrap;">
        <input id="citySearch" type="text" placeholder="🔍 搜索城市/县城，定位并点亮足迹" style="flex:1;min-width:160px;padding:7px 10px;border:2px solid #E8D9BC;border-radius:8px;font-size:.88rem;background:#FFFBF5;">
        <button class="chip sm" id="citySearchBtn" style="background:${document.documentElement.style.getPropertyValue('--orange')||'#F2A340'};color:#fff;border:none;">定位</button>
      </div>` : ''}

      <!-- 地图区域：固定比例框，缩放只在框内发生 -->
      <div id="mapArea" class="travel-map" style="aspect-ratio:${frameRatio(curRegion)};"></div>

      <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px;">
        <span style="font-size:.8rem;color:#9A8874;">已点亮 ${(data.cities||[]).filter(c=>c.region===curRegion).length} 个足迹 🐾${isCN?' ｜ 滚轮缩放 / 拖拽平移':''}</span>
        <button class="chip sm" id="addCityBtn" style="background:${document.documentElement.style.getPropertyValue('--orange')||'#F2A340'};color:#fff;border:none;">＋ 添加足迹</button>
      </div>

      <!-- 时间轴：只用它来体现足迹 -->
      <div style="margin-top:16px;">
        <b style="font-size:.9rem">🕒 足迹时间轴</b>
        <div id="timeline" style="margin-top:8px;">
          ${renderTimeline(data, curRegion)}
        </div>
      </div>
    `;

    renderMapSVG($('#mapArea'), curRegion);

    // 区域切换
    $$('#trPane .chip[data-r]').forEach(btn => {
      btn.onclick = () => { curRegion = btn.dataset.r; paint(); };
    });
    $('#addCityBtn').onclick = () => showCityDialog(null);
    $$('#timeline .tl-item').forEach(el => {
      el.onclick = () => showCityDetail(el.dataset.id);
    });

    // 搜索定位（中国）
    if (isCN) {
      const doSearch = () => {
        const q = $('#citySearch').value.trim();
        if (!q) return;
        const idx = (window.CN_ROOSTER && window.CN_ROOSTER.CITY_INDEX) || [];
        let hit = idx.find(c => c.name === q) || idx.find(c => c.name.includes(q) || q.includes(c.name));
        if (hit && window.__cnCenterOn) {
          window.__cnCenterOn(hit.x, hit.y, 4);
          showCityDialog(null, hit.name);
        } else {
          toast('未找到该地名，试试输入省份或城市名（如：广东省、杭州市）');
        }
      };
      $('#citySearchBtn').onclick = doSearch;
      $('#citySearch').addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
    }
  }

  /* 时间轴：日记式 —— 左侧纵向时间轴(日期+地点)，右侧卡片(分类前15字+图片)，右下「走进故事」 */
  function renderTimeline(data, region) {
    const items = (data.cities||[])
      .filter(c => c.region === region)
      .slice()
      .sort((a,b) => (b.date||'').localeCompare(a.date||''));
    if (!items.length) return '<p style="color:#9A8874;font-size:.82rem;margin-top:6px;">还没有足迹，点地图或「＋ 添加足迹」记录第一站吧～</p>';
    return `<div class="tl-diary">` + items.map(c => {
      const cats = CAT_DEFS.map(([ic,k,label]) => c[k] ? `
        <div class="tl-cat"><span class="tl-ic">${ic}</span><span class="tl-txt">${cutN(c[k], 15)}</span></div>` : '').join('');
      const hasImg = c.images && c.images.length;
      const photo = hasImg
        ? `<div class="tl-photo"><img src="${c.images[0]}" alt=""></div>`
        : `<div class="tl-photo empty">📷</div>`;
      return `<div class="tl-item" data-id="${c.id}">
        <div class="tl-axis">
          <div class="tl-dot"></div>
          <div class="tl-date">${c.date||'未填日期'}</div>
          <div class="tl-place">🐾 ${esc(c.name)}</div>
        </div>
        <div class="tl-card">
          <div class="tl-row">
            <div class="tl-texts">${cats || '<span class="tl-empty">（这次还没写点什么）</span>'}</div>
            ${photo}
          </div>
          <div class="tl-foot"><span class="tl-more">走进故事 →</span></div>
        </div>
      </div>`;
    }).join('') + `</div>`;
  }

  function render(root) {
    root.innerHTML = `<div id="trPane"></div>`;
    paint();
  }

  window.Modules = window.Modules || {};
  window.Modules.travel = { id: 'travel', name: '走走停停', desc: '用猫爪点亮世界每个角落', icon: 'horse', render };
})();
