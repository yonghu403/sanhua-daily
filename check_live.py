import urllib.request as u
base='https://86a832d23e064e059208c785608f19fb.bj9.agentos-app.net'
for path in ['sw.js','js/mod-travel.js']:
    try:
        r=u.urlopen(base+'/'+path,timeout=20)
        t=r.read().decode('utf-8','ignore')
        print(path, 'HTTP', r.status, 'len', len(t))
        if path=='sw.js':
            print('  CACHE v13?', 'sanhua-v13' in t)
        else:
            print('  travel-map frame?', 'travel-map' in t and 'frameRatio' in t)
            print('  zoom inside frame?', "map-zoombar" in t)
            print('  no emoji flags?', not any(e in t for e in ['🇨🇳','🌏','🏰','🗽','🌿','🦁','🐨','🌍']))
    except Exception as e:
        print(path, 'ERR', repr(e))
