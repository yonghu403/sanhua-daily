#!/usr/bin/env python3
# 把多文件 PWA 打包成单文件 standalone.html（内联 css + 全部 js），便于直接双击预览。
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
HTML = (ROOT / "index.html").read_text(encoding="utf-8")

# 1) 内联 css（兼容带 ?v= 版本戳的链接）
css = (ROOT / "css" / "style.css").read_text(encoding="utf-8")
HTML = re.sub(r'<link rel="stylesheet" href="css/style\.css[^"]*">',
              f"<style>\n{css}\n</style>", HTML)

# 2) 去掉 manifest 链接（单文件预览不需要）
HTML = re.sub(r'<link rel="manifest"[^>]*>\n?', '', HTML)

# 3) 内联每个 <script src="...">（剥离 ?v= 版本戳后读取本地文件）
def inline(m):
    src = m.group(1).split('?')[0]
    code = (ROOT / src).read_text(encoding="utf-8")
    code = code.replace("</script>", "<\\/script>")  # 防止提前闭合
    return f"<script>\n{code}\n</script>"

HTML = re.sub(r'<script src="([^"]+)"></script>', inline, HTML)

out = ROOT / "standalone.html"
out.write_text(HTML, encoding="utf-8")
print("written", out, len(HTML), "bytes")
