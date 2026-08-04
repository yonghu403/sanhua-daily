/* ===== 萌趣小动物 SVG 图标库 ===== */
(function (global) {
  const S = (inner, vb) => `<svg viewBox="${vb || '0 0 64 64'}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

  const C = {
    brown: '#6B4630', brown2: '#8C6647', line: '#6B4630',
    cream: '#FFF3DE', orange: '#F2A340', orangeL: '#FFD9A0',
    pink: '#F3B0A8', pinkL: '#FCDCD6', white: '#FFFDF7',
    grey: '#C9BCAA', black: '#4A3628'
  };

  /* 通用腮红 */
  const blush = (x1, x2, y) =>
    `<ellipse cx="${x1}" cy="${y}" rx="4.6" ry="3" fill="${C.pink}" opacity=".65"/>
     <ellipse cx="${x2}" cy="${y}" rx="4.6" ry="3" fill="${C.pink}" opacity=".65"/>`;

  const Icons = {
    /* 三花猫 */
    cat: () => S(`
      <path d="M14 22 L12 8 L26 16 Z" fill="#FFE0B0" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M50 22 L52 8 L38 16 Z" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="32" cy="34" rx="22" ry="19.5" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M32 15c9 0 17 6 19 14-7 3-14 1-19-3-5 4-12 6-19 3 2-8 10-14 19-14z" fill="#FFE9C8" opacity=".9"/>
      <path d="M46 22c5 3 7 8 6 13-4 1-8-1-10-4z" fill="${C.brown2}" opacity=".85"/>
      ${blush(19, 45, 38)}
      <circle cx="24" cy="31" r="3.1" fill="${C.black}"/>
      <circle cx="40" cy="31" r="3.1" fill="${C.black}"/>
      <circle cx="25.2" cy="29.8" r="1.1" fill="#fff"/>
      <circle cx="41.2" cy="29.8" r="1.1" fill="#fff"/>
      <path d="M32 36.5l-2.6 2.2h5.2z" fill="${C.pink}" stroke="${C.brown}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M32 39.5v2m0 0c-1.6 2-4 1.6-5 .2m5-.2c1.6 2 4 1.6 5 .2" stroke="${C.brown}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M6 30h9M6 36h9M49 30h9M49 36h9" stroke="${C.brown}" stroke-width="1.6" stroke-linecap="round" opacity=".65"/>
    `),

    /* 小狗 */
    dog: () => S(`
      <ellipse cx="12" cy="26" rx="6.5" ry="11" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="52" cy="26" rx="6.5" ry="11" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="32" cy="33" rx="21" ry="19" fill="#FFEDD2" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M32 14c-7 0-13 5-15 11 5 3 11 2 15-2z" fill="${C.brown2}" opacity=".55"/>
      ${blush(18, 46, 37)}
      <circle cx="25" cy="30" r="3.1" fill="${C.black}"/>
      <circle cx="39" cy="30" r="3.1" fill="${C.black}"/>
      <circle cx="26.2" cy="28.8" r="1.1" fill="#fff"/>
      <circle cx="40.2" cy="28.8" r="1.1" fill="#fff"/>
      <ellipse cx="32" cy="39" rx="12" ry="8.5" fill="#FFF8EA" stroke="${C.brown}" stroke-width="1.8"/>
      <ellipse cx="32" cy="36" rx="4" ry="3.1" fill="${C.black}"/>
      <path d="M32 39v3m0 0c-1.4 1.8-3.6 1.5-4.6.2M32 42c1.4 1.8 3.6 1.5 4.6.2" stroke="${C.brown}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    `),

    /* 小鼠 */
    mouse: () => S(`
      <circle cx="13" cy="18" r="10" fill="${C.pinkL}" stroke="${C.brown}" stroke-width="2.4"/>
      <circle cx="51" cy="18" r="10" fill="${C.pinkL}" stroke="${C.brown}" stroke-width="2.4"/>
      <circle cx="13" cy="18" r="5.4" fill="${C.pink}"/>
      <circle cx="51" cy="18" r="5.4" fill="${C.pink}"/>
      <ellipse cx="32" cy="36" rx="19" ry="18" fill="#EFE3D2" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(19, 45, 40)}
      <circle cx="26" cy="33" r="2.9" fill="${C.black}"/>
      <circle cx="38" cy="33" r="2.9" fill="${C.black}"/>
      <circle cx="27" cy="31.9" r="1" fill="#fff"/>
      <circle cx="39" cy="31.9" r="1" fill="#fff"/>
      <ellipse cx="32" cy="40" rx="3.1" ry="2.4" fill="${C.pink}" stroke="${C.brown}" stroke-width="1.2"/>
      <path d="M32 42.5v2" stroke="${C.brown}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M26 45h5v3h-5zM33 45h5v3h-5z" fill="#fff" stroke="${C.brown}" stroke-width="1.2"/>
      <path d="M14 38H4M14 43H5M50 38h10M50 43h9" stroke="${C.brown}" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
    `),

    /* 小兔 */
    rabbit: () => S(`
      <ellipse cx="22" cy="15" rx="6" ry="14" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="42" cy="15" rx="6" ry="14" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="22" cy="15" rx="2.8" ry="9" fill="${C.pinkL}"/>
      <ellipse cx="42" cy="15" rx="2.8" ry="9" fill="${C.pinkL}"/>
      <ellipse cx="32" cy="40" rx="19" ry="17" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(19, 45, 43)}
      <path d="M23 36c1.6-2 4.4-2 6 0" stroke="${C.black}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M35 36c1.6-2 4.4-2 6 0" stroke="${C.black}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M32 41.5l-2.4 2h4.8z" fill="${C.pink}" stroke="${C.brown}" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M32 44v2m0 0c-1.4 1.8-3.5 1.5-4.4.2M32 46c1.4 1.8 3.5 1.5 4.4.2" stroke="${C.brown}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    `),

    /* 熊猫 */
    panda: () => S(`
      <circle cx="14" cy="17" r="8.5" fill="${C.black}" stroke="${C.brown}" stroke-width="2"/>
      <circle cx="50" cy="17" r="8.5" fill="${C.black}" stroke="${C.brown}" stroke-width="2"/>
      <ellipse cx="32" cy="35" rx="21" ry="19" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="23" cy="32" rx="7" ry="8.4" fill="${C.black}" transform="rotate(-14 23 32)"/>
      <ellipse cx="41" cy="32" rx="7" ry="8.4" fill="${C.black}" transform="rotate(14 41 32)"/>
      <circle cx="23.5" cy="32.5" r="3" fill="#fff"/>
      <circle cx="40.5" cy="32.5" r="3" fill="#fff"/>
      <circle cx="24.2" cy="31.6" r="1.2" fill="${C.black}"/>
      <circle cx="41.2" cy="31.6" r="1.2" fill="${C.black}"/>
      <ellipse cx="32" cy="41" rx="3.4" ry="2.6" fill="${C.black}"/>
      <path d="M32 43.6v1.8m0 0c-1.4 1.8-3.4 1.4-4.3.2M32 45.4c1.4 1.8 3.4 1.4 4.3.2" stroke="${C.black}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      ${blush(16, 48, 41)}
    `),

    /* 狐狸 */
    fox: () => S(`
      <path d="M13 24 L9 7 L26 15 Z" fill="${C.orange}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M51 24 L55 7 L38 15 Z" fill="${C.orange}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M32 16c11 0 20 8 20 17s-9 21-20 21-20-12-20-21 9-17 20-17z" fill="${C.orange}" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M32 34c7 0 13 4 15 9-3 7-9 11-15 11s-12-4-15-11c2-5 8-9 15-9z" fill="${C.white}"/>
      ${blush(19, 45, 38)}
      <circle cx="24" cy="31" r="3" fill="${C.black}"/>
      <circle cx="40" cy="31" r="3" fill="${C.black}"/>
      <circle cx="25.1" cy="29.9" r="1" fill="#fff"/>
      <circle cx="41.1" cy="29.9" r="1" fill="#fff"/>
      <ellipse cx="32" cy="42" rx="3.4" ry="2.7" fill="${C.black}"/>
      <path d="M32 44.7v2m0 0c-1.4 1.8-3.5 1.4-4.4.2M32 46.7c1.4 1.8 3.5 1.4 4.4.2" stroke="${C.brown}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    `),

    /* 小鸡 */
    chick: () => S(`
      <path d="M32 6c1 4 3 6 3 6h-6s2-2 3-6z" fill="${C.orange}" stroke="${C.brown}" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="32" cy="36" rx="20" ry="19" fill="#FFE59B" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="13" cy="38" rx="6" ry="9" fill="#FFDF8A" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="51" cy="38" rx="6" ry="9" fill="#FFDF8A" stroke="${C.brown}" stroke-width="2.2"/>
      ${blush(20, 44, 39)}
      <circle cx="26" cy="33" r="3" fill="${C.black}"/>
      <circle cx="38" cy="33" r="3" fill="${C.black}"/>
      <circle cx="27.1" cy="31.9" r="1" fill="#fff"/>
      <circle cx="39.1" cy="31.9" r="1" fill="#fff"/>
      <path d="M32 38l-4.5 3.4 4.5 3.4 4.5-3.4z" fill="${C.orange}" stroke="${C.brown}" stroke-width="1.6" stroke-linejoin="round"/>
    `),

    /* 小熊 */
    bear: () => S(`
      <circle cx="14" cy="16" r="9" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4"/>
      <circle cx="50" cy="16" r="9" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4"/>
      <circle cx="14" cy="16" r="4.6" fill="${C.pinkL}"/>
      <circle cx="50" cy="16" r="4.6" fill="${C.pinkL}"/>
      <ellipse cx="32" cy="36" rx="21" ry="19" fill="#E5C39B" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(18, 46, 40)}
      <circle cx="25" cy="33" r="3" fill="${C.black}"/>
      <circle cx="39" cy="33" r="3" fill="${C.black}"/>
      <circle cx="26.1" cy="31.9" r="1" fill="#fff"/>
      <circle cx="40.1" cy="31.9" r="1" fill="#fff"/>
      <ellipse cx="32" cy="42" rx="10" ry="7.5" fill="#F7E4C8"/>
      <ellipse cx="32" cy="39.5" rx="3.6" ry="2.8" fill="${C.black}"/>
      <path d="M32 42.3v2.2m0 0c-1.4 1.8-3.4 1.4-4.3.2M32 44.5c1.4 1.8 3.4 1.4 4.3.2" stroke="${C.brown}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    `),

    /* 小猪 */
    pig: () => S(`
      <path d="M12 20 L14 8 L26 15 Z" fill="${C.pink}" stroke="${C.brown}" stroke-width="2.3" stroke-linejoin="round"/>
      <path d="M52 20 L50 8 L38 15 Z" fill="${C.pink}" stroke="${C.brown}" stroke-width="2.3" stroke-linejoin="round"/>
      <ellipse cx="32" cy="35" rx="21" ry="18.5" fill="${C.pinkL}" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(17, 47, 38)}
      <circle cx="24" cy="30" r="2.9" fill="${C.black}"/>
      <circle cx="40" cy="30" r="2.9" fill="${C.black}"/>
      <circle cx="25.1" cy="28.9" r="1" fill="#fff"/>
      <circle cx="41.1" cy="28.9" r="1" fill="#fff"/>
      <ellipse cx="32" cy="40" rx="9" ry="7" fill="${C.pink}" stroke="${C.brown}" stroke-width="2"/>
      <ellipse cx="28.8" cy="40" rx="1.7" ry="2.4" fill="${C.brown}"/>
      <ellipse cx="35.2" cy="40" rx="1.7" ry="2.4" fill="${C.brown}"/>
    `),

    /* 绵羊 */
    sheep: () => S(`
      <circle cx="16" cy="24" r="8" fill="${C.white}" stroke="${C.brown}" stroke-width="2.2"/>
      <circle cx="48" cy="24" r="8" fill="${C.white}" stroke="${C.brown}" stroke-width="2.2"/>
      <circle cx="24" cy="15" r="9" fill="${C.white}" stroke="${C.brown}" stroke-width="2.2"/>
      <circle cx="40" cy="15" r="9" fill="${C.white}" stroke="${C.brown}" stroke-width="2.2"/>
      <circle cx="32" cy="12" r="9" fill="${C.white}" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="32" cy="37" rx="17" ry="16" fill="#F2E4D2" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="11" cy="34" rx="5" ry="7" fill="#F2E4D2" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="53" cy="34" rx="5" ry="7" fill="#F2E4D2" stroke="${C.brown}" stroke-width="2.2"/>
      ${blush(21, 43, 40)}
      <ellipse cx="27" cy="35" rx="2.2" ry="3" fill="${C.black}"/>
      <ellipse cx="37" cy="35" rx="2.2" ry="3" fill="${C.black}"/>
      <path d="M29.5 42c1.5 1.5 3.5 1.5 5 0" stroke="${C.brown}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
    `),

    /* 考拉 */
    koala: () => S(`
      <circle cx="12" cy="24" r="10" fill="#C9BFB4" stroke="${C.brown}" stroke-width="2.3"/>
      <circle cx="52" cy="24" r="10" fill="#C9BFB4" stroke="${C.brown}" stroke-width="2.3"/>
      <circle cx="12" cy="24" r="5.6" fill="${C.pinkL}"/>
      <circle cx="52" cy="24" r="5.6" fill="${C.pinkL}"/>
      <ellipse cx="32" cy="35" rx="19" ry="18" fill="#DCD3C8" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(19, 45, 39)}
      <circle cx="25" cy="32" r="2.9" fill="${C.black}"/>
      <circle cx="39" cy="32" r="2.9" fill="${C.black}"/>
      <circle cx="26.1" cy="30.9" r="1" fill="#fff"/>
      <circle cx="40.1" cy="30.9" r="1" fill="#fff"/>
      <ellipse cx="32" cy="40" rx="5" ry="6" fill="${C.black}"/>
      <ellipse cx="30.4" cy="38.6" rx="1.4" ry="1.8" fill="#fff" opacity=".45"/>
    `),

    /* 青蛙 */
    frog: () => S(`
      <circle cx="20" cy="18" r="9.5" fill="#B7D89B" stroke="${C.brown}" stroke-width="2.3"/>
      <circle cx="44" cy="18" r="9.5" fill="#B7D89B" stroke="${C.brown}" stroke-width="2.3"/>
      <circle cx="20" cy="19" r="4.4" fill="#fff"/>
      <circle cx="44" cy="19" r="4.4" fill="#fff"/>
      <circle cx="20.6" cy="19.4" r="2.3" fill="${C.black}"/>
      <circle cx="44.6" cy="19.4" r="2.3" fill="${C.black}"/>
      <ellipse cx="32" cy="38" rx="21" ry="17" fill="#A9CE8B" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(17, 47, 40)}
      <path d="M22 40c4 5 16 5 20 0" stroke="${C.brown}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle cx="27" cy="34" r="1.4" fill="${C.brown}"/>
      <circle cx="37" cy="34" r="1.4" fill="${C.brown}"/>
    `),

    /* 猫头鹰 */
    owl: () => S(`
      <ellipse cx="32" cy="36" rx="22" ry="20" fill="#E8DCC8" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M14 24 Q12 10 20 12 Q26 8 32 14 Q38 8 44 12 Q52 10 50 24" fill="#C9BCAA" stroke="${C.brown}" stroke-width="2.2" stroke-linejoin="round"/>
      <circle cx="22" cy="28" r="10" fill="#FFFDF7" stroke="${C.brown}" stroke-width="2"/>
      <circle cx="42" cy="28" r="10" fill="#FFFDF7" stroke="${C.brown}" stroke-width="2"/>
      <circle cx="22" cy="29" r="5" fill="${C.black}"/>
      <circle cx="42" cy="29" r="5" fill="${C.black}"/>
      <circle cx="23.5" cy="27.5" r="1.8" fill="#fff"/>
      <circle cx="43.5" cy="27.5" r="1.8" fill="#fff"/>
      <path d="M28 40 L36 40 L32 46 Z" fill="${C.orange}" stroke="${C.brown}" stroke-width="1.8" stroke-linejoin="round"/>
      ${blush(18, 46, 38)}
      <path d="M22 48 Q32 54 42 48" stroke="${C.brown}" stroke-width="2" fill="none" stroke-linecap="round"/>
    `),

    /* 小马 - 可爱圆润风 */
    horse: () => S(`
      <!-- 装饰：星星 -->
      <polygon points="10,10 12,14 16,14 13,17 14,21 10,18 6,21 7,17 4,14 8,14" fill="#FFD27A" stroke="none"/>
      <!-- 装饰：云朵 -->
      <g fill="#B8D4D8" stroke="${C.brown}" stroke-width="1.2">
        <ellipse cx="50" cy="11" rx="6" ry="4"/><ellipse cx="55" cy="13" rx="4" ry="3"/><ellipse cx="47" cy="14" rx="3.5" ry="2.5"/>
      </g>
      <!-- 装饰：小花 -->
      <g transform="translate(52,32)">
        <circle cx="0" cy="-4" r="3.2" fill="#E89B6A"/><circle cx="3.5" cy="-1.5" r="3.2" fill="#E89B6A"/><circle cx="3.5" cy="2.5" r="3.2" fill="#E89B6A"/><circle cx="0" cy="5" r="3.2" fill="#E89B6A"/><circle cx="-3.5" cy="2.5" r="3.2" fill="#E89B6A"/><circle cx="-3.5" cy="-1.5" r="3.2" fill="#E89B6A"/><circle cx="0" cy="0" r="2.2" fill="#FFD27A"/>
      </g>
      <!-- 装饰：小草 -->
      <g stroke="#8BA888" stroke-width="1.4" stroke-linecap="round" fill="none">
        <path d="M8 54 Q10 48 8 44"/><path d="M10 54 Q12 47 10 43"/><ellipse cx="9" cy="42" rx="3" ry="4.5" fill="#B8CC9E" stroke="#8BA888" stroke-width="1"/>
      </g>
      <!-- 鬃毛（头顶） -->
      <path d="M22 20 Q24 10 30 12 Q34 8 38 13 Q44 10 46 18" fill="#A06835" stroke="${C.brown}" stroke-width="2" stroke-linejoin="round"/>
      <!-- 左耳 -->
      <path d="M22 20 Q18 8 26 12 Q24 17 26 20Z" fill="#E8B87A" stroke="${C.brown}" stroke-width="2" stroke-linejoin="round"/>
      <!-- 右耳 -->
      <path d="M42 19 Q48 7 40 12 Q42 17 40 20Z" fill="#D4A25A" stroke="${C.brown}" stroke-width="2" stroke-linejoin="round"/>
      <!-- 头部（大圆脸） -->
      <ellipse cx="32" cy="30" rx="16" ry="14" fill="#F0BE7A" stroke="${C.brown}" stroke-width="2.4"/>
      <!-- 面部浅色区 -->
      <ellipse cx="32" cy="34" rx="11" ry="9" fill="#FFE4B5"/>
      <!-- 眼睛 -->
      <ellipse cx="25" cy="28" rx="3.2" ry="3.5" fill="${C.black}"/>
      <ellipse cx="39" cy="28" rx="3.2" ry="3.5" fill="${C.black}"/>
      <circle cx="26" cy="26.8" r="1.2" fill="#fff"/>
      <circle cx="40" cy="26.8" r="1.2" fill="#fff"/>
      <!-- 鼻子/嘴部（大椭圆） -->
      <ellipse cx="32" cy="36" rx="7" ry="5" fill="#FFD9A0" stroke="${C.brown}" stroke-width="1.4"/>
      <!-- 鼻孔 -->
      <ellipse cx="29.5" cy="35.5" rx="1.4" ry="1" fill="${C.brown2}"/>
      <ellipse cx="34.5" cy="35.5" rx="1.4" ry="1" fill="${C.brown2}"/>
      <!-- 微笑 -->
      <path d="M29 38.5 Q32 41.5 35 38.5" stroke="${C.brown2}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <!-- 腮红 -->
      ${blush(19, 45, 33)}
      <!-- 身体（圆润胖马身） -->
      <ellipse cx="32" cy="48" rx="18" ry="12" fill="#F0BE7A" stroke="${C.brown}" stroke-width="2.4"/>
      <!-- 前腿 -->
      <rect x="22" y="55" width="5" height="7" rx="2.5" fill="#E8B87A" stroke="${C.brown}" stroke-width="1.8"/>
      <rect x="37" y="55" width="5" height="7" rx="2.5" fill="#D4A25A" stroke="${C.brown}" stroke-width="1.8"/>
      <!-- 后腿（小短腿） -->
      <path d="M18 56 L17 60 Q17 62 19 62L21 58Z" fill="#D4A25A" stroke="${C.brown}" stroke-width="1.6"/>
      <path d="M46 56 L47 60 Q47 62 45 62L43 58Z" fill="#D4A25A" stroke="${C.brown}" stroke-width="1.6"/>
      <!-- 尾巴 -->
      <path d="M50 46 Q56 42 54 48 Q57 50 53 52" fill="#A06835" stroke="${C.brown}" stroke-width="2" stroke-linecap="round" fill="none"/>
    `),

    /* 小鸡 - 可爱圆头风 */
    chick: () => S(`
      <!-- 鸡冠 -->
      <path d="M26 14 Q24 6 28 8 Q30 3 34 7 Q38 4 38 12" fill="#FF6B6B" stroke="#E05555" stroke-width="1.4" stroke-linejoin="round"/>
      <!-- 身体（圆润胖鸡） -->
      <ellipse cx="32" cy="40" rx="18" ry="16" fill="#FFE566" stroke="${C.brown}" stroke-width="2.2"/>
      <!-- 肚皮浅色区 -->
      <ellipse cx="32" cy="44" rx="13" ry="11" fill="#FFF3B0"/>
      <!-- 头部（大圆） -->
      <circle cx="32" cy="24" r="14" fill="#FFE566" stroke="${C.brown}" stroke-width="2.2"/>
      <!-- 翅膀 -->
      <path d="M16 38 Q10 42 14 48 Q18 44 18 40Z" fill="#FFD93D" stroke="${C.brown}" stroke-width="1.6" stroke-linejoin="round"/>
      <!-- 眼睛（大圆眼） -->
      <circle cx="26" cy="22" r="3.5" fill="${C.black}"/>
      <circle cx="38" cy="22" r="3.5" fill="${C.black}"/>
      <circle cx="27" cy="20.8" r="1.2" fill="#fff"/>
      <circle cx="39" cy="20.8" r="1.2" fill="#fff"/>
      <!-- 喙（三角橙黄） -->
      <path d="M29 27 L32 31 L35 27Z" fill="#FF9A3C" stroke="#E07B20" stroke-width="1.2" stroke-linejoin="round"/>
      <!-- 腮红 -->
      ${blush(19, 45, 27)}
      <!-- 小脚 -->
      <path d="M26 55 L26 60 M24 60 L28 60" stroke="#FF9A3C" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M38 55 L38 60 M36 60 L40 60" stroke="#FF9A3C" stroke-width="2.2" stroke-linecap="round"}
    `),

    /* ==== 心情猫 ==== */
    moodHappy: () => S(`
      <path d="M14 22 L12 9 L25 16 Z" fill="#FFE0B0" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M50 22 L52 9 L39 16 Z" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="32" cy="35" rx="21" ry="18.5" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M45 23c5 3 7 8 6 13-4 1-8-1-10-4z" fill="${C.brown2}" opacity=".75"/>
      ${blush(18, 46, 38)}
      <path d="M20 32c1.8-3 5.4-3 7.2 0" stroke="${C.black}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M36.8 32c1.8-3 5.4-3 7.2 0" stroke="${C.black}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <path d="M25 39c3.5 5 10.5 5 14 0z" fill="${C.pink}" stroke="${C.brown}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M5 27l6 3-6 3M59 27l-6 3 6 3" stroke="${C.orange}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    moodCalm: () => S(`
      <path d="M14 22 L12 9 L25 16 Z" fill="#FFE0B0" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M50 22 L52 9 L39 16 Z" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="32" cy="35" rx="21" ry="18.5" fill="${C.white}" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M45 23c5 3 7 8 6 13-4 1-8-1-10-4z" fill="${C.brown2}" opacity=".75"/>
      ${blush(18, 46, 38)}
      <circle cx="24" cy="32" r="2.8" fill="${C.black}"/>
      <circle cx="40" cy="32" r="2.8" fill="${C.black}"/>
      <path d="M28 41h8" stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M32 36.5l-2.4 2h4.8z" fill="${C.pink}" stroke="${C.brown}" stroke-width="1.2" stroke-linejoin="round"/>
    `),
    moodEmo: () => S(`
      <path d="M13 24 L10 12 L24 17 Z" fill="#FFE0B0" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M51 24 L54 12 L40 17 Z" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <ellipse cx="32" cy="36" rx="21" ry="18.5" fill="#F3EADD" stroke="${C.brown}" stroke-width="2.4"/>
      ${blush(18, 46, 39)}
      <path d="M20 31c2 2 5 2 7 0M37 31c2 2 5 2 7 0" stroke="${C.black}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <ellipse cx="24" cy="36" rx="2" ry="2.6" fill="#8FB8D6"/>
      <path d="M27 45c2.5-3 7.5-3 10 0" stroke="${C.brown}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <path d="M32 39.5l-2.2 1.9h4.4z" fill="${C.pink}" stroke="${C.brown}" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M8 14c3 0 5 2 5 4M56 14c-3 0-5 2-5 4" stroke="#B8C9D6" stroke-width="2" fill="none" stroke-linecap="round"/>
    `),

    /* ==== 功能小图标 ==== */
    paw: () => S(`
      <ellipse cx="32" cy="42" rx="14" ry="11" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="16" cy="26" rx="6" ry="7.6" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="27" cy="18" rx="5.6" ry="7.4" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="39" cy="18" rx="5.6" ry="7.4" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
      <ellipse cx="49" cy="26" rx="6" ry="7.6" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
    `),
    gear: () => S(`
      <circle cx="32" cy="32" r="12" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.4"/>
      <circle cx="32" cy="32" r="5" fill="${C.white}" stroke="${C.brown}" stroke-width="2"/>
      <g stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round">
        <path d="M32 12v6M32 46v6M12 32h6M46 32h6M18 18l4 4M42 42l4 4M46 18l-4 4M22 42l-4 4"/>
      </g>
    `),
    star: () => S(`<path d="M32 8l7.6 15.6L57 26l-12.5 12.2L47.4 56 32 47.6 16.6 56l2.9-17.8L7 26l17.4-2.4z" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>`),
    heart: () => S(`<path d="M32 54S8 39 8 24C8 15.7 14.7 9 23 9c4.6 0 8.7 2.1 11.4 5.4C36.6 11 40.6 9 45 9c8.3 0 15 6.7 15 15 0 15-24 30-24 30z" transform="translate(-2,0)" fill="${C.pink}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>`),
    book: () => S(`
      <path d="M10 12h18c3 0 4 2 4 4v36c0-2-1-4-4-4H10z" fill="${C.cream}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M54 12H36c-3 0-4 2-4 4v36c0-2 1-4 4-4h18z" fill="#FFE9C8" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M14 22h12M14 29h12M38 22h12M38 29h12" stroke="${C.brown2}" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>
    `),
    coin: () => S(`
      <ellipse cx="32" cy="32" rx="20" ry="20" fill="#FFE08A" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="32" cy="32" rx="14" ry="14" fill="#FFEFC0" stroke="${C.brown}" stroke-width="1.8"/>
      <path d="M32 22v20M26 28h12M26 34h12" stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round"/>
    `),
    bowl: () => S(`
      <path d="M8 30h48c0 12-10 20-24 20S8 42 8 30z" fill="${C.cream}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M4 30h56" stroke="${C.brown}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M22 24c-2-4 2-6 0-10M32 22c-2-5 2-7 0-12M42 24c-2-4 2-6 0-10" stroke="${C.orange}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    `),
    moon: () => S(`
      <path d="M40 8a24 24 0 100 48 20 20 0 010-48z" fill="#FFE7B0" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="52" cy="16" r="2.6" fill="${C.orange}"/>
      <circle cx="56" cy="28" r="1.8" fill="${C.orange}"/>
      <circle cx="47" cy="46" r="2" fill="${C.orange}"/>
    `),
    shirt: () => S(`
      <path d="M24 10l8 6 8-6 14 7-4 11-6-2v26H20V26l-6 2-4-11z" fill="#FFE9C8" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M24 10c0 5 3.6 8 8 8s8-3 8-8" stroke="${C.brown}" stroke-width="2" fill="none"/>
    `),
    lipstick: () => S(`
      <rect x="23" y="30" width="18" height="24" rx="3" fill="${C.cream}" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M26 30V16c0-3 2-6 6-6s6 3 6 6v14z" fill="${C.pink}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M23 38h18" stroke="${C.brown}" stroke-width="2"/>
    `),
    globe: () => S(`
      <circle cx="32" cy="32" r="21" fill="#CDE5F2" stroke="${C.brown}" stroke-width="2.4"/>
      <ellipse cx="32" cy="32" rx="9" ry="21" fill="none" stroke="${C.brown}" stroke-width="1.8"/>
      <path d="M11 32h42M14 22h36M14 42h36" stroke="${C.brown}" stroke-width="1.8"/>
      <path d="M20 22c4 4 6 10 4 16" stroke="#8FBF7A" stroke-width="3" fill="none" stroke-linecap="round"/>
    `),
    tv: () => S(`
      <rect x="8" y="20" width="48" height="32" rx="6" fill="${C.cream}" stroke="${C.brown}" stroke-width="2.4"/>
      <rect x="14" y="26" width="36" height="20" rx="3" fill="#FFF8E8" stroke="${C.brown}" stroke-width="1.6"/>
      <path d="M22 20l8-10M42 20l-8-10" stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M26 30l10 6-10 6z" fill="${C.orange}"/>
    `),
    dumbbell: () => S(`
      <rect x="6" y="26" width="8" height="12" rx="3" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
      <rect x="50" y="26" width="8" height="12" rx="3" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.2"/>
      <rect x="14" y="22" width="10" height="20" rx="4" fill="#FFE9C8" stroke="${C.brown}" stroke-width="2.2"/>
      <rect x="40" y="22" width="10" height="20" rx="4" fill="#FFE9C8" stroke="${C.brown}" stroke-width="2.2"/>
      <rect x="24" y="29" width="16" height="6" rx="3" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2"/>
    `),
    pen: () => S(`
      <path d="M14 50l-3 3 3-11L42 14l8 8-28 28z" fill="${C.orangeL}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M42 14l4-4a4 4 0 016 0l2 2a4 4 0 010 6l-4 4z" fill="${C.pink}" stroke="${C.brown}" stroke-width="2.2" stroke-linejoin="round"/>
    `),
    dice: () => S(`
      <rect x="10" y="10" width="44" height="44" rx="10" fill="#FFF6E4" stroke="${C.brown}" stroke-width="2.6"/>
      <circle cx="22" cy="22" r="4" fill="${C.brown}"/>
      <circle cx="42" cy="42" r="4" fill="${C.brown}"/>
      <circle cx="32" cy="32" r="4" fill="${C.orange}"/>
    `),
    chat: () => S(`
      <path d="M10 16h44v28H30l-12 10v-10h-8z" fill="#FFF6E4" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <circle cx="22" cy="30" r="3" fill="${C.orange}"/>
      <circle cx="32" cy="30" r="3" fill="${C.orange}"/>
      <circle cx="42" cy="30" r="3" fill="${C.orange}"/>
    `),
    photo: () => S(`
      <rect x="8" y="14" width="48" height="36" rx="7" fill="#FFF6E4" stroke="${C.brown}" stroke-width="2.4"/>
      <circle cx="21" cy="26" r="4" fill="${C.orange}"/>
      <path d="M10 44l13-13 9 9 8-7 14 12" fill="none" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
    `),
    sun: () => S(`
      <circle cx="32" cy="32" r="13" fill="#FFD87A" stroke="${C.brown}" stroke-width="2.4"/>
      <g stroke="${C.orange}" stroke-width="3" stroke-linecap="round">
        <path d="M32 6v8M32 50v8M6 32h8M50 32h8M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6"/>
      </g>
    `),
    calendar: () => S(`
      <rect x="8" y="14" width="48" height="42" rx="8" fill="#FFF6E4" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M8 26h48" stroke="${C.brown}" stroke-width="2.4"/>
      <path d="M20 8v10M44 8v10" stroke="${C.brown}" stroke-width="3" stroke-linecap="round"/>
      <rect x="17" y="33" width="8" height="7" rx="2" fill="${C.orange}"/>
      <rect x="29" y="33" width="8" height="7" rx="2" fill="${C.orangeL}"/>
      <rect x="41" y="33" width="8" height="7" rx="2" fill="${C.orangeL}"/>
    `),
    plus: () => S(`<path d="M32 14v36M14 32h36" stroke="${C.brown}" stroke-width="5" stroke-linecap="round"/>`),
    trash: () => S(`
      <path d="M14 18h36l-3 36H17z" fill="${C.cream}" stroke="${C.brown}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M10 18h44M26 12h12M26 28v18M38 28v18" stroke="${C.brown}" stroke-width="2.4" stroke-linecap="round"/>
    `),
    empty: () => S(`
      <ellipse cx="32" cy="48" rx="18" ry="4" fill="${C.line}" opacity=".3"/>
      <ellipse cx="32" cy="30" rx="16" ry="15" fill="${C.white}" stroke="${C.brown}" stroke-width="2.2"/>
      <path d="M18 20 L16 9 L27 15 Z" fill="#FFE0B0" stroke="${C.brown}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M46 20 L48 9 L37 15 Z" fill="${C.brown2}" stroke="${C.brown}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M25 28c1 1.6 3 1.6 4 0M35 28c1 1.6 3 1.6 4 0" stroke="${C.black}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28 36h8" stroke="${C.brown}" stroke-width="1.8" stroke-linecap="round"/>
      ${blush(22, 42, 33)}
    `)
  };

  /* 彩铅小动物便签底纹（data-uri） */
  Icons.pawPattern = (() => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <g opacity="0.16" fill="none" stroke="#C99A5B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="22" cy="24" r="9"/><path d="M15 17l-2-6 7 3M29 17l2-6-7 3"/>
        <circle cx="19" cy="23" r="1.3" fill="#C99A5B"/><circle cx="25" cy="23" r="1.3" fill="#C99A5B"/>
        <path d="M20 28c1.4 1.4 2.6 1.4 4 0"/>
        <ellipse cx="82" cy="30" rx="10" ry="9"/><ellipse cx="76" cy="17" rx="3.4" ry="7"/><ellipse cx="88" cy="17" rx="3.4" ry="7"/>
        <circle cx="79" cy="29" r="1.3" fill="#D9A0A0"/><circle cx="85" cy="29" r="1.3" fill="#D9A0A0"/>
        <ellipse cx="40" cy="82" rx="7" ry="5.4"/><ellipse cx="33" cy="74" rx="2.6" ry="3.4"/><ellipse cx="39" cy="71" rx="2.6" ry="3.4"/><ellipse cx="45" cy="73" rx="2.6" ry="3.4"/>
        <circle cx="96" cy="86" r="8"/><circle cx="89" cy="79" r="4"/><circle cx="103" cy="79" r="4"/>
        <circle cx="93" cy="85" r="1.2" fill="#C99A5B"/><circle cx="99" cy="85" r="1.2" fill="#C99A5B"/>
        <path d="M10 62c3-4 8-4 11 0M52 34c3-4 8-4 11 0M58 100c3-4 8-4 11 0"/>
        <path d="M12 100l3-3 3 3-3 3z" fill="#E8B26B"/>
        <path d="M64 62l3-3 3 3-3 3z" fill="#E8B26B"/>
      </g>
    </svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  })();

  Icons.get = (name) => (Icons[name] ? Icons[name]() : Icons.paw());
  global.Icons = Icons;
})(window);
