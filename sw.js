/* 三花日常 Service Worker v19 — 全网络优先 + 缓存兜底（强制破旧缓存） */
const CACHE = 'sanhua-v21';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './css/style.css?v=21',
  './js/icons.js?v=21',
  './js/db.js?v=21',
  './js/ui.js?v=21',
  './js/mod-todo.js?v=21',
  './js/mod-money.js?v=21',
  './js/mod-eatsleep.js?v=21',
  './js/mod-sport.js?v=21',
  './js/mod-outfit.js?v=21',
  './js/mod-beauty.js?v=21',
  './js/mod-deep.js?v=21',
  './js/mod-media.js?v=21',
  './js/china-rooster.js?v=21',
  './js/mod-travel.js?v=21',
  './js/mod-health.js?v=21',
  './js/mod-settings.js?v=21',
  './js/app.js?v=21'
];

/* 安装：逐文件缓存 */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(ASSETS.map((u) =>
      c.add(u).catch((err) => console.warn('SW skip:', u, err && err.message))
    ));
    await self.skipWaiting();
  })());
});

/* 激活：清理所有旧缓存（核弹级清除） */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    /* 删除所有缓存，不保留任何旧版本 */
    await Promise.all(ks.map((k) => caches.delete(k)));
    await self.clients.claim();
    /* 通知所有页面刷新 */
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((cl) => cl.navigate(cl.url).catch(() => {}));
  })());
});

/* 拦截请求 —— 全部网络优先，确保永远拿到最新文件 */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const req = e.request;

  e.respondWith((async () => {
    try {
      /* 始终先走网络 */
      const net = await fetch(req, { cache: 'no-store' });
      if (net && net.ok) {
        const cp = net.clone();
        caches.open(CACHE).then((c) => c.put(req, cp)).catch(() => {});
        return net;
      }
    } catch (err) { /* 网络失败才回退缓存 */ }

    /* 离线/失败：尝试缓存 */
    const cached = await caches.match(req);
    if (cached) return cached;

    /* 最后回退 index.html（SPA 路由） */
    const fallback = await caches.match('./index.html');
    return fallback || new Response(
      '<h1 style="font-family:sans-serif;padding:2rem">离线且无缓存，请联网后重试</h1>',
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  })());
});
