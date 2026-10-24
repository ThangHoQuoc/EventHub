"""Kiểm tĩnh giáo trình; không chạy/sửa source hoặc test ứng dụng.

Chạy từ repository: python docs/learning/assets/sources/verify.py
Baseline phạm vi là tùy chọn, dùng biến EVENTHUB_LEARNING_BASELINE trỏ JSON SHA256.
"""
from pathlib import Path
import os,re,json,hashlib,xml.etree.ElementTree as ET

LEARNING=Path(__file__).resolve().parents[2]
REPO=LEARNING.parents[1]
ERRORS=[]
STATS={}
def check(condition,description):
    if not condition:ERRORS.append(description)

markdown=list((REPO/'docs').rglob('*.md'))+[REPO/'README.md',REPO/'AGENTS.md']
links=images=0
for p in markdown:
    s=p.read_text(encoding='utf-8-sig')
    for m in re.finditer(r'(!?\[[^\]]*\]\()([^\s)]+)\)',s):
        target=m.group(2)
        if re.match(r'https?:|mailto:',target):continue
        filename,sep,anchor=target.partition('#')
        q=(p.parent/filename).resolve() if filename else p
        links+=1;images+=m.group(1).startswith('!')
        check(q.exists(),f'Broken link: {p.relative_to(REPO)} -> {target}')
        if not q.exists() or not anchor:continue
        if q.suffix=='.java' and re.fullmatch(r'L\d+',anchor):
            check(1<=int(anchor[1:])<=len(q.read_text(encoding='utf8').splitlines()),f'Bad source line: {target}')
        elif q.suffix=='.md':
            slugs=[]
            for title in re.findall(r'^#{1,6}\s+(.+?)\s*$',q.read_text(encoding='utf-8-sig'),re.M):
                slug=re.sub(r'[^\w\-\s]','',title.lower()).replace(' ','-')
                slugs.append(slug)
            check(anchor in slugs,f'Unknown anchor: {p.relative_to(REPO)} -> {target}')
STATS.update(markdown_checked=len(markdown),local_links_checked=links,image_references_checked=images)

lessons=sorted((LEARNING/'modules').glob('*/[0-9][0-9]-*.md'))+[LEARNING/'start-here.md']
check(len(lessons)==45,f'Expected 45 lessons, got {len(lessons)}')
for p in lessons:
    s=p.read_text(encoding='utf8')
    for token in ['Câu hỏi trung tâm','Sau bài này','biết trước','<details>','<summary>','Học tiếp']:
        check(token in s,f'Missing {token}: {p.relative_to(LEARNING)}')
    check(s.count('<details>')==s.count('</details>'),f'Unbalanced details: {p}')
    check(s.count('```')%2==0,f'Unbalanced code fence: {p}')
    match=re.search(r'## Tự nhớ lại[^\n]*\n(.*?)(?=\n<details>)',s,re.S)
    check(bool(match),f'No recall section: {p}')
    if match:
        number=len(re.findall(r'^\d+\. ',match.group(1),re.M))
        check(3<=number<=6,f'Recall count {number}: {p}')
STATS['lessons_checked']=len(lessons)
manifest=json.loads((LEARNING/'assets/sources/lesson-manifest.json').read_text(encoding='utf8'))
check({m['path'] for m in manifest}=={p.relative_to(LEARNING).as_posix() for p in lessons},
      'Lesson manifest does not match reading pages')

excerpts=json.loads((LEARNING/'assets/sources/source-excerpts.json').read_text(encoding='utf8'))
for ex in excerpts:
    source=(REPO/ex['source']).read_text(encoding='utf8')
    lesson=(LEARNING/'modules'/ex['lesson']).read_text(encoding='utf8')
    check(ex['code'] in source,f'Source excerpt mismatch: {ex["source"]}')
    check(ex['code'] in lesson,f'Lesson excerpt mismatch: {ex["lesson"]}')
    actual='\n'.join(source.splitlines()[ex['line']-1:ex['line']-1+len(ex['code'].split('\n'))])
    check(actual==ex['code'],f'Excerpt line drift: {ex["source"]}')
STATS['verbatim_excerpts_checked']=len(excerpts)

renderer=LEARNING/'assets/sources/render.py'
ns={'__file__':str(renderer),'__name__':'verify_only'}
exec(compile(renderer.read_text(encoding='utf8'),str(renderer),'exec'),ns)
svgfiles=list((LEARNING/'assets/rendered').glob('*.svg'))
for p in svgfiles:
    root=ET.fromstring(p.read_text(encoding='utf8'))
    check(root.find('{http://www.w3.org/2000/svg}title') is not None,f'No SVG title: {p}')
    check(root.find('{http://www.w3.org/2000/svg}desc') is not None,f'No SVG description: {p}')
    check(p.read_text(encoding='utf8')==ns['render'](ns['SPECS'][p.stem]),f'SVG/source drift: {p}')
    embedded=any(f'{p.stem}.svg)' in l.read_text(encoding='utf8') for l in lessons)
    check(embedded,f'SVG not embedded in lesson: {p}')
STATS['learning_svg_checked']=len(svgfiles)
mermaid_count=0
for name,spec in ns['SPECS'].items():
    expected=ns['mermaid'](spec)
    if expected is None:continue
    p=LEARNING/'assets/sources'/f'{name}.mmd'
    check(p.exists() and p.read_text(encoding='utf8')==expected,f'Mermaid/source drift: {name}')
    mermaid_count+=1
    for evidence in spec.get('evidence',[]):
        check((REPO/evidence).is_file(),f'Missing diagram evidence: {evidence}')
STATS['mermaid_sources_checked']=mermaid_count

baseline=os.environ.get('EVENTHUB_LEARNING_BASELINE')
if baseline:
    before=json.loads(Path(baseline).read_text(encoding='utf8'))
    after={};skip={'.git','node_modules','target','.idea','dist','.next'}
    for base,dirs,files in os.walk(REPO):
        dirs[:]=[d for d in dirs if d not in skip]
        for name in files:
            p=Path(base)/name;after[p.relative_to(REPO).as_posix()]=hashlib.sha256(p.read_bytes()).hexdigest()
    changed=sorted(k for k in before.keys()|after.keys() if before.get(k)!=after.get(k))
    outside=[k for k in changed if not k.startswith('docs/learning/')]
    # Report every observed outside change. A shared workspace can change independently;
    # never silently discard/revert such files. Application changes still fail this audit.
    application=[k for k in outside if k.startswith(('backend/','frontend/'))]
    check(not application,f'Application changes during docs work: {application}')
    STATS.update(changed_files=len(changed),outside_learning_changes=len(outside),
                 outside_learning_paths=outside,application_changes=len(application))
STATS['errors']=len(ERRORS)
print(json.dumps({'stats':STATS,'errors':ERRORS},ensure_ascii=True,indent=2))
raise SystemExit(bool(ERRORS))
