"""Bố cục SVG cho preview rộng 880px; không dùng thư viện ngoài.

render.py nạp file này, giữ JSON là nguồn biên tập chung của SVG và Mermaid.
"""
from pathlib import Path
import html,json,textwrap
ROOT=Path(__file__).resolve().parent.parent
SPECS={}
for filename in ('figures.json','flows.json'):
    SPECS.update(json.loads((ROOT/'sources'/filename).read_text(encoding='utf8')))
W=880

def wrap(value,limit):
    return [s for part in value.split('\n') for s in (textwrap.wrap(part,width=limit,break_long_words=True,break_on_hyphens=False) or [''])]

class Canvas:
    def __init__(self,spec,height):
        self.parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{height}" viewBox="0 0 {W} {height}" role="img">',
          f'<title>{html.escape(spec["title"])}</title><desc>{html.escape(spec["read"])}</desc>',
          '<defs><marker id="arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#54728f"/></marker><marker id="error-arrow" markerWidth="9" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8Z" fill="#ad4b38"/></marker></defs>',
          f'<rect width="{W}" height="{height}" rx="12" fill="#f8fafc"/>']
        self.text(28,38,spec['title'],26,58,bold=True)
        if spec.get('scope'):self.text(28,92,spec['scope'],18,82,color='#52667d')

    def text(self,x,y,value,size=22,limit=38,bold=False,color='#172b45',anchor='start',owner=None):
        attr=f' data-owner="{owner}"' if owner else ''
        self.parts.append(f'<text x="{x}" y="{y}" font-family="Segoe UI,Arial,sans-serif" font-size="{size}" font-weight="{600 if bold else 400}" fill="{color}" text-anchor="{anchor}"{attr}>')
        for i,line in enumerate(wrap(value,limit)):
            self.parts.append(f'<tspan x="{x}" dy="{0 if i==0 else size*1.35}">{html.escape(line)}</tspan>')
        self.parts.append('</text>')

    def box(self,x,y,w,h,fill='white',stroke='#bacdde',id=None):
        ident=f' id="{id}"' if id else ''
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" stroke="{stroke}" stroke-width="1.5"{ident}/>')

    def arrow(self,x,y,x2,y2,error=False,dashed=False):
        dash=' stroke-dasharray="6 5"' if dashed else ''
        self.parts.append(f'<path d="M{x} {y} L{x2} {y2}" fill="none" stroke="{"#ad4b38" if error else "#54728f"}" stroke-width="2" marker-end="url(#{"error-arrow" if error else "arrow"})"{dash}/>')

    def done(self):return '\n'.join(self.parts+['</svg>'])+'\n'

def render_flow(s):
    steps=s['steps'];top=156;pitch=194;nh=146;c=Canvas(s,top+pitch*len(steps)+36)
    for i,step in enumerate(steps):
        y=top+i*pitch;x=38;w=478;owner=f'node-{i}'
        if step.get('check'):
            c.parts.append(f'<path id="{owner}" d="M{x+22} {y} H{x+w-22} L{x+w} {y+22} V{y+nh-22} L{x+w-22} {y+nh} H{x+22} L{x} {y+nh-22} V{y+22}Z" fill="#e9f2fb" stroke="#54728f" stroke-width="2"/>')
        else:c.box(x,y,w,nh,'#eaf6ef' if i==len(steps)-1 else 'white',id=owner)
        c.text(x+18,y+27,f'{i+1:02d}  '+('ĐIỀU KIỆN' if step.get('check') else 'THAO TÁC'),16,45,color='#52667d',owner=owner)
        c.text(x+18,y+58,step['text'],22,35,owner=owner)
        if i<len(steps)-1:
            c.arrow(x+w/2,y+nh,x+w/2,y+pitch)
            c.text(x+w/2+14,y+nh+34,step.get('yes','Tiếp'),18,20,color='#52667d')
        if step.get('branch'):
            bx=620;bad=step.get('branch_tone')!='info';bid=f'branch-{i}'
            c.box(bx,y,230,nh,'#fff1ed' if bad else '#e9f2fb','#ad4b38' if bad else '#54728f',id=bid)
            c.text(bx+12,y+30,step['branch'],20,19,owner=bid)
            c.arrow(x+w,y+nh/2,bx,y+nh/2,error=bad)
            c.text((x+w+bx)/2,y+nh/2-14,step.get('no','Lỗi'),16,12,anchor='middle',color='#ad4b38' if bad else '#54728f')
    c.text(28,top+pitch*len(steps)+5,'Đi xuống: tiếp tục · Rẽ phải: kết quả khác và dừng nhánh đó',18,88,color='#52667d')
    return c.done()

def render_sequence(s):
    top=258;pitch=134;H=top+pitch*len(s['steps'])+20;c=Canvas(s,H);xs=[132,440,748]
    assert len(s['participants'])==3,'Chia hình khi cần hơn ba participant'
    for i,(x,name) in enumerate(zip(xs,s['participants'])):
        ident=f'actor-{i}';c.box(x-112,140,224,80,'#e9f2fb',id=ident)
        display=name.replace('Repository','\nRepository').replace('ServiceImpl','\nServiceImpl')
        c.text(x,172,display,20,18,anchor='middle',bold=True,owner=ident)
        c.parts.append(f'<path d="M{x} 220 V{H-28}" stroke="#bacdde" stroke-width="2" stroke-dasharray="5 6"/>')
    for i,step in enumerate(s['steps']):
        y=top+i*pitch
        if 'note' in step:
            owner=f'note-{i}';c.box(28,y,W-56,98,'#f0f5fa',id=owner)
            c.text(46,y+30,step['note'],21,65,owner=owner)
        else:
            x=xs[step['from']];x2=xs[step['to']]
            c.arrow(x,y+104,x2,y+104,dashed=step.get('reply',False))
            c.text((x+x2)/2,y+20,step['text'],21,max(20,int(abs(x-x2)/11)),anchor='middle')
    return c.done()

def render_concept(s):
    kind=s['kind'];rows=s.get('rows',[])
    if kind=='state':
        c=Canvas(s,680);xy=[(38,148),(512,148),(38,470),(512,470)]
        for i,(x,y) in enumerate(xy):
            ident=f'state-{i}';c.box(x,y,330,92,'#e9f2fb' if i<2 else '#eaf6ef',id=ident)
            c.text(x+165,y+55,s['nodes'][i],25,anchor='middle',bold=True,owner=ident)
        c.arrow(368,194,512,194);c.text(440,107,s['edges'][0][2],20,29,anchor='middle')
        c.arrow(203,240,203,470);c.text(218,355,'cancel',21)
        c.arrow(570,240,368,470);c.text(435,350,'cancel',21)
        c.arrow(677,240,677,470);c.text(696,335,'job: endAt\ntrước now',20,15)
        return c.done()
    if rows:
        n=len(s['heads']);cw=(W-56)/n;limit=int((cw-30)/11)
        hh=38+max(len(wrap(h,limit)) for h in s['heads'])*28
        heights=[max(106,40+max(len(wrap(cell,limit)) for cell in row)*30) for row in rows]
        top=106;c=Canvas(s,top+hh+sum(heights)+20*len(rows)+28)
        for j,head in enumerate(s['heads']):
            x=28+j*cw;owner=f'header-{j}';c.box(x,top,cw-10,hh,'#e9f2fb',id=owner)
            c.text(x+14,top+31,head,21,limit,bold=True,owner=owner)
        y=top+hh+18
        for i,row in enumerate(rows):
            for j,cell in enumerate(row):
                x=28+j*cw;owner=f'cell-{i}-{j}';c.box(x,y,cw-10,heights[i],id=owner)
                c.text(x+14,y+32,cell,22,limit,owner=owner)
            y+=heights[i]+20
        if kind=='timeline':
            for j in range(n-1):c.arrow(28+(j+1)*cw-24,94,28+(j+1)*cw+4,94)
        return c.done()
    cw=(W-72)/2;limit=31
    heights=[max(96,36+max(len(wrap(s[side][i],limit)) for side in ('left','right'))*30) for i in range(3)]
    H=190+sum(heights)+3*24+44;c=Canvas(s,H)
    for j,head in enumerate(s['heads']):
        x=28+j*(cw+16);c.box(x,100,cw,H-134,'#e9f2fb' if j==0 else '#eaf6ef')
        c.text(x+16,133,head,22,31,bold=True);y=190
        for i,cell in enumerate(s['left' if j==0 else 'right']):
            owner=f'comparison-{j}-{i}';c.box(x+12,y,cw-24,heights[i],id=owner)
            c.text(x+26,y+32,cell,22,limit,owner=owner)
            if i<2 and (kind=='transaction' or 'BCrypt' in s['title']):c.arrow(x+cw/2,y+heights[i],x+cw/2,y+heights[i]+24)
            y+=heights[i]+24
    if kind=='relationship':c.arrow(432,H-108,448,H-108)
    if kind=='transaction':c.text(28,H-12,'Mỗi cột = một transaction riêng',18,70,color='#52667d')
    return c.done()

def render(s):
    return render_flow(s) if s['kind']=='flow' else render_sequence(s) if s['kind']=='sequence' else render_concept(s)

def mermaid(s):
    def quote(value):return value.replace('&','&amp;').replace('"','&quot;').replace('|','&#124;').replace('\n','<br/>')
    if s['kind']=='sequence':
        out=['sequenceDiagram','    autonumber']
        for i,p in enumerate(s['participants']):out.append(f'    participant P{i} as {p}')
        for step in s['steps']:
            if 'note' in step:out.append('    Note over P0,P2: '+step['note'])
            else:out.append(f'    P{step["from"]}{"-->>" if step.get("reply") else "->>"}P{step["to"]}: {step["text"]}')
    elif s['kind']=='flow':
        out=['flowchart TD']
        for i,step in enumerate(s['steps']):
            label=quote(step['text']);out.append(f'    N{i}'+('{"'+label+'"}' if step.get('check') else '["'+label+'"]'))
            if i<len(s['steps'])-1:out.append(f'    N{i} -->|"{quote(step.get("yes","Tiếp"))}"| N{i+1}')
            if step.get('branch'):
                out.append(f'    B{i}["{quote(step["branch"])}"]');out.append(f'    N{i} -->|"{quote(step.get("no","Lỗi"))}"| B{i}')
    else:return None
    return '%% '+s['title']+'\n%% '+s.get('scope','')+'\n'+'\n'.join(out)+'\n'
