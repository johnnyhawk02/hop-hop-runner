#!/usr/bin/env python3
"""Bake Hop Hop Runner into one self-contained HTML file (for the claude.ai Artifact).

The game itself runs straight from index.html + css/ + js/ with no build step. This script makes
the single-file copy: the stylesheet and every game script are inlined (the scripts wrapped in one
function, as before the split), and the drum loops, billboard photo and cottage model become data:
URLs. The app-install bits (manifest, icons, service worker) are left out, since an Artifact can't use them.

    python3 tools/build.py [out.html]      (default: dist/hop-hop-runner.html)
"""
import base64, mimetypes, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIME = {'.mp3': 'audio/mpeg', '.jpg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary'}
# head lines that only matter for the installable web app
DROP = ('<!doctype', '<html', '<meta charset', '<meta name="viewport"', '<meta name="description"',
        '<meta name="mobile-web-app-capable"', '<meta name="apple-mobile-web-app-title"',
        '<meta name="apple-mobile-web-app-status-bar-style"', '<meta name="theme-color"', '<link rel="icon"')


def read(path):
    with open(os.path.join(ROOT, path), encoding='utf-8') as f:
        return f.read()


def data_url(m):
    path = m.group(2)
    with open(os.path.join(ROOT, path), 'rb') as f:
        b64 = base64.b64encode(f.read()).decode()
    mime = MIME.get(os.path.splitext(path)[1]) or mimetypes.guess_type(path)[0]
    return f"{m.group(1)}data:{mime};base64,{b64}{m.group(1)}"


def indent(text):
    return '\n'.join(('  ' + l) if l else l for l in text.rstrip('\n').split('\n'))


def build():
    out, scripts = [], []
    for line in read('index.html').split('\n'):
        if line.startswith(DROP):
            continue
        if line.startswith('<title>'):
            out += [line, '<meta name="claude:viewport-fit-sides" content="cover">']
            continue
        css = re.fullmatch(r'<link rel="stylesheet" href="(css/[^"]+)">', line)
        if css:
            out += ['<style>', indent(read(css.group(1))), '</style>']
            continue
        js = re.fullmatch(r'<script src="(js/[^"]+)"></script>', line)
        if js:
            if not scripts:
                out.append('\0SCRIPTS\0')
            body = read(js.group(1))
            body = body.split('\n', 2)[2] if body.startswith('// Hop Hop Runner:') else body  # drop the file's title line
            scripts.append(indent(body))
            continue
        out.append(line)
    game = '<script>\n(() => {\n' + '\n\n'.join(scripts) + '\n})();\n</script>'
    html = '\n'.join(out).replace('\0SCRIPTS\0', game)
    # local files the game loads become data: URLs
    return re.sub(r"""(['"])((?:audio|img|models)/[\w.-]+\.(?:mp3|jpg|png|glb))\1""", data_url, html)


if __name__ == '__main__':
    dest = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist', 'hop-hop-runner.html')
    os.makedirs(os.path.dirname(os.path.abspath(dest)), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(build())
    print(f'wrote {dest} ({os.path.getsize(dest) / 1e6:.1f} MB)')
