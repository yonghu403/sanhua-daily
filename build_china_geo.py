#!/usr/bin/env python3
# 拉取全国地市级(地级行政区)边界 GeoJSON，投影为 SVG 路径，baked 进 vendor/maps/china-cities.js
import urllib.request, json, math, os, sys

OUT_DIR = os.path.join(os.path.dirname(__file__), 'vendor', 'maps')
os.makedirs(OUT_DIR, exist_ok=True)

# 省级 adcode -> (省名, 大区)
PROV = {
 '110000':('北京','n'),'120000':('天津','n'),'130000':('河北','n'),'140000':('山西','n'),'150000':('内蒙古','nw'),
 '210000':('辽宁','ne'),'220000':('吉林','ne'),'230000':('黑龙江','ne'),
 '310000':('上海','e'),'320000':('江苏','e'),'330000':('浙江','e'),'340000':('安徽','e'),'350000':('福建','s'),'360000':('江西','s'),'370000':('山东','e'),
 '410000':('河南','n'),'420000':('湖北','s'),'430000':('湖南','s'),'440000':('广东','s'),'450000':('广西','s'),'460000':('海南','s'),
 '500000':('重庆','sw'),'510000':('四川','sw'),'520000':('贵州','sw'),'530000':('云南','sw'),'540000':('西藏','sw'),
 '610000':('陕西','nw'),'620000':('甘肃','nw'),'630000':('青海','nw'),'640000':('宁夏','nw'),'650000':('新疆','nw'),
 '710000':('台湾','s'),'810000':('香港','s'),'820000':('澳门','s')
}
PROV_CODES = list(PROV.keys())

def fetch(adcode):
    url = f'https://geo.datav.aliyun.com/areas_v3/bound/{adcode}_full.json'
    try:
        req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
        return json.loads(urllib.request.urlopen(req, timeout=30).read())
    except Exception as e:
        print('  fetch fail', adcode, repr(e))
        return None

def r2(v):  # round to 2 decimals to shrink
    return round(v, 2)

features = []
for code in PROV_CODES:
    j = fetch(code)
    if not j: continue
    for f in j.get('features', []):
        p = f.get('properties', {})
        name = p.get('name')
        adcode = str(p.get('adcode', code+'0000'))
        center = p.get('center') or p.get('centroid')
        geom = f.get('geometry')
        if not name or not geom: continue
        prefix = adcode[:2]
        prov_name, region = PROV.get(prefix, ('其他','nw'))
        features.append({'name':name,'adcode':adcode,'center':center,
                         'prov':prov_name,'region':region,'geom':geom})
    print('  done', code, PROV[code][0], '累计', len(features))

# ---- 投影：先算原始投影(等距圆柱+纬度余弦校正)，再归一化进 viewBox ----
lngs=[]; lats=[]
for f in features:
    c = f['center']
    if c: lngs.append(c[0]); lats.append(c[1])
    g = f['geom']
    polys = g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    for poly in polys:
        for ring in poly:
            for pt in ring:
                lngs.append(pt[0]); lats.append(pt[1])
lngMin, lngMax = min(lngs), max(lngs)
latMin, latMax = min(lats), max(lats)
latMid = (latMin+latMax)/2
kx = math.cos(math.radians(latMid))

def proj_raw(lng, lat):
    return ((lng-lngMin)*kx, (latMax-lat))   # y 翻转

# 归一化范围
raw=[]; raw_cities=[]
for f in features:
    c=f['center']
    if c: rx,ry=proj_raw(c[0],c[1]); raw_cities.append((f['name'],rx,ry))
    g=f['geom']
    polys = g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    rp=[]
    for poly in polys:
        for ring in poly:
            for pt in ring:
                rx,ry=proj_raw(pt[0],pt[1]); rp.append((rx,ry))
    raw.append(rp)
allx=[p[0] for r in raw for p in r]+[c[1] for c in raw_cities]
ally=[p[1] for r in raw for p in r]+[c[2] for c in raw_cities]
minX,maxX=min(allx),max(allx); minY,maxY=min(ally),max(ally)

W,H=1000,800
pad=8
scale=min((W-2*pad)/(maxX-minX),(H-2*pad)/(maxY-minY))
def norm(rx,ry):
    return (pad+(rx-minX)*scale, pad+(ry-minY)*scale)

# 生成路径 + 城市坐标
paths=[]; cities=[]
for i,f in enumerate(features):
    dparts=[]
    for poly in (f['geom']['coordinates'] if f['geom']['type']=='MultiPolygon' else [f['geom']['coordinates']]):
        pts=[norm(*p) for p in poly[0]]  # 外环
        s='M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in pts)+' Z'
        # 孔洞
        for hole in poly[1:]:
            hp=[norm(*p) for p in hole]
            s+=' M'+' L'.join(f'{x:.1f} {y:.1f}' for x,y in hp)+' Z'
        dparts.append(s)
    d=''.join(dparts)
    # 标签中心 = 外环平均
    g=f['geom']
    outer = g['coordinates'][0][0] if g['type']=='MultiPolygon' else g['coordinates'][0]
    cx=sum(p[0] for p in outer)/len(outer); cy=sum(p[1] for p in outer)/len(outer)
    ncx,ncy=norm(cx,cy)
    paths.append({'name':f['name'],'d':d,'region':f['region'],'cx':round(ncx,1),'cy':round(ncy,1),'prov':f['prov']})

for name,rx,ry in raw_cities:
    x,y=norm(rx,ry)
    cities.append({'name':name,'x':round(x,1),'y':round(y,1)})

data = {'paths':paths,'cities':cities,'vb':[0,0,W,H]}
out = 'window.CN_GEO = '+json.dumps(data, ensure_ascii=False, separators=(',',':'))+';'
with open(os.path.join(OUT_DIR,'china-cities.js'),'w',encoding='utf-8') as fp:
    fp.write(out)
print('written china-cities.js  paths=%d cities=%d bytes=%d' % (len(paths),len(cities),len(out)))
