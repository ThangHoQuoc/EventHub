"""Render tài sản handbook từ JSON: python docs/learning/assets/sources/render.py.
Không cài dependency; SVG và Mermaid được sinh từ cùng model.
"""
from pathlib import Path
_LAYOUT=Path(__file__).resolve().with_name('layout.py')
exec(compile(_LAYOUT.read_text(encoding='utf8'),str(_LAYOUT),'exec'),globals())
if __name__=='__main__':
    (ROOT/'rendered').mkdir(exist_ok=True)
    count=0
    for name,spec in SPECS.items():
        (ROOT/'rendered'/f'{name}.svg').write_text(render(spec),encoding='utf8')
        source=mermaid(spec)
        if source:
            (ROOT/'sources'/f'{name}.mmd').write_text(source,encoding='utf8')
            count+=1
    print(f'Rendered {len(SPECS)} SVGs and {count} Mermaid sources')
