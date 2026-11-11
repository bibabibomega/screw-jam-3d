# py -3.13 store-assets.py : ghép tiêu đề (20% phía trên) vào ảnh chụp game -> store-assets/screenshot-N.png (1080x1920)
from PIL import Image, ImageDraw, ImageFont
import os
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','store-assets'); RAW=os.path.join(D,'raw')
SCENES=[('1-tap','TAP & UNSCREW!',(255,168,1)),('2-match','MATCH COLORS TO CLEAR!',(56,103,214)),('3-jam',"DON'T GET JAMMED!",(235,59,90)),('4-endless','ENDLESS PUZZLES',(5,196,107))]
def font(sz):
    for f in ('C:/Windows/Fonts/ariblk.ttf','C:/Windows/Fonts/arialbd.ttf'):
        if os.path.exists(f): return ImageFont.truetype(f,sz)
    return ImageFont.load_default()
def wrap(d,text,f,maxw):
    words=text.split(); lines=[]; cur=''
    for w in words:
        t=(cur+' '+w).strip()
        if d.textlength(t,font=f)<=maxw: cur=t
        else: lines.append(cur); cur=w
    lines.append(cur); return lines
for i,(name,title,col) in enumerate(SCENES,1):
    g=Image.open(os.path.join(RAW,name+'.png')).convert('RGB')
    W,H=1080,1920; bannerH=int(H*0.20)
    bg=Image.new('RGB',(W,H),(244,239,234)); d=ImageDraw.Draw(bg)
    d.rectangle([0,0,W,bannerH],fill=col)
    f=font(104); lines=wrap(d,title,f,W-120)
    if len(lines)>2: f=font(84); lines=wrap(d,title,f,W-120)
    lh=int(f.size*1.12); y=(bannerH-lh*len(lines))//2
    for ln in lines:
        w=d.textlength(ln,font=f); d.text(((W-w)/2+4,y+5),ln,font=f,fill=(0,0,0,60)); d.text(((W-w)/2,y),ln,font=f,fill=(255,255,255)); y+=lh
    ph=H-bannerH-60; pw=int(g.width*ph/g.height); g2=g.resize((pw,ph),Image.LANCZOS)
    mask=Image.new('L',g2.size,0); ImageDraw.Draw(mask).rounded_rectangle([0,0,pw-1,ph-1],56,fill=255)
    bg.paste(g2,((W-pw)//2,bannerH+30),mask)
    bg.save(os.path.join(D,f'screenshot-{i}.png')); print('screenshot',i,bg.size)
