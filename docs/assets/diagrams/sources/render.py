"""Render SVG tài liệu từ diagrams.json, chỉ dùng thư viện chuẩn Python."""
from pathlib import Path
from html import escape
import json
import textwrap

BASE = Path(__file__).resolve().parent.parent


def render(spec):
    width, height = spec['size']
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
             f'<title id="title">{escape(spec["title"])}</title>',
             f'<desc id="desc">{escape(spec["description"])}</desc>',
             '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#526579"/></marker></defs>',
             '<rect width="100%" height="100%" fill="#f6f8fc"/>',
             '<g font-family="Segoe UI, Arial, sans-serif">',
             f'<text x="{width/2}" y="36" text-anchor="middle" font-size="23" font-weight="700" fill="#142c46">{escape(spec["title"])}</text>']
    nodes = {n['id']: n for n in spec['nodes']}
    for edge in spec['edges']:
        a, b = nodes[edge['from']], nodes[edge['to']]
        if edge.get('horizontal'):
            x1, y1 = a['x'] + a['w'], a['y'] + a['h']/2
            x2, y2 = b['x'], b['y'] + b['h']/2
            d = f'M{x1},{y1} L{x2-10},{y2}'
        else:
            x1, y1 = a['x'] + a['w']/2, a['y'] + a['h']
            x2, y2 = b['x'] + b['w']/2, b['y']
            mid = (y1+y2)/2
            d = f'M{x1},{y1} L{x1},{mid} L{x2},{mid} L{x2},{y2-8}'
        parts.append(f'<path d="{d}" fill="none" stroke="#526579" stroke-width="2" marker-end="url(#arrow)"/>')
        if edge.get('label'):
            lx, ly = edge.get('labelAt', [(x1+x2)/2, (y1+y2)/2-7])
            parts.append(f'<text x="{lx}" y="{ly}" text-anchor="middle" font-size="14" fill="#334d68">{escape(edge["label"])}</text>')
    palette = {'normal': ('#e8f1fc', '#3872ac'), 'data': ('#e0f4ed', '#24836d'), 'guard': ('#fff1d9', '#ad791e'), 'risk': ('#fce8e6', '#b65349')}
    for n in spec['nodes']:
        fill, stroke = palette[n.get('kind', 'normal')]
        parts.append(f'<rect x="{n["x"]}" y="{n["y"]}" width="{n["w"]}" height="{n["h"]}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="1.6"/>')
        lines = []
        for line in n['text'].split('\n'):
            lines.extend(textwrap.wrap(line, width=max(20, int(n['w']/10))) or [''])
        start = n['y']+n['h']/2-(len(lines)-1)*11+6
        for i, line in enumerate(lines):
            parts.append(f'<text x="{n["x"]+n["w"]/2}" y="{start+i*22}" text-anchor="middle" font-size="17" fill="#18334e">{escape(line)}</text>')
    parts.append(f'<text x="{width/2}" y="{height-18}" text-anchor="middle" font-size="13" fill="#53667b">Working tree 09/10/2026 · Mũi tên theo quan hệ/luồng được ghi trong bài</text>')
    parts.append('</g></svg>')
    return '\n'.join(parts)+'\n'


def main():
    specs = json.loads((BASE/'sources/diagrams.json').read_text(encoding='utf-8'))
    output = BASE/'rendered'
    output.mkdir(exist_ok=True)
    for name, spec in specs.items():
        (output/f'{name}.svg').write_text(render(spec), encoding='utf-8')
    print(f'Rendered {len(specs)} SVG diagrams.')


if __name__ == '__main__':
    main()
