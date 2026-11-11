// node store-assets.js  -> chụp game ở 1080x1920 (store-assets/raw) và vẽ icon 512x512. Sau đó chạy store-assets.py để ghép tiêu đề.
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const OUT=path.join(__dirname,'..','store-assets'), RAW=path.join(OUT,'raw');
const port=9300+Math.floor(Math.random()*500), dir=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+dir,'--window-size=540,960','--force-device-scale-factor=2','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let targets; for(let i=0;i<50;i++){try{targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();if(targets.find(t=>t.type==='page'))break;}catch(e){}await sleep(300);}
  const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map();
  ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||d.error);pend.delete(d.id);}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  const ev=e=>send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true}).then(r=>r.result&&r.result.value);
  const shot=async n=>{const s=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(path.join(RAW,n+'.png'),Buffer.from(s.data,'base64')); console.log('saved',n);};
  await send('Runtime.enable'); await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:true});
  await send('Page.navigate',{url:'file:///F:/CLAUDE%20AI/screw-jam-3d/index.html?debug=1&start=2'}); await sleep(3500);
  const hideToast='document.getElementById("toast").classList.remove("show")';
  // 1) TAP & UNSCREW: màn 3, vòng gợi ý quanh ốc nên tháo
  await ev(hideToast); await ev('__sj.showHint()'); await sleep(250); await ev(hideToast); await shot('1-tap');
  // 2) MATCH COLORS: màn 4, một ốc đang bay vào hộp cùng màu
  await ev('__sj.loadLevel(3)'); await sleep(900);
  await ev(`(function(){const p=__sj.solvePath(__sj.state.L,3,0,0,__sj.state.model); __sj.pullScrew(__sj.screws[p[0]]);})()`); await sleep(330); await ev(hideToast); await shot('2-match');
  // 3) DON'T GET JAMMED: màn 8, lỗ chờ gần đầy
  await ev('__sj.loadLevel(7)'); await sleep(900);
  await ev(`(function(){for(let n=0;n<2;n++){const b=__sj.boxes[__sj.state.boxIdx]; const s=__sj.screws.find(s=>!s.removed&&s.color!==b.color&&!__sj.blockerOf(s)); if(s) __sj.pullScrew(s);}})()`); await sleep(1400); await ev(hideToast); await shot('3-jam');
  // 4) ENDLESS PUZZLES: màn muộn
  await ev('__sj.loadLevel(23)'); await sleep(1200); await ev(hideToast); await shot('4-endless');
  // icon 512x512 bằng SVG
  const svg=`<html><body style="margin:0"><svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D6F6E6"/><stop offset="1" stop-color="#7FD9B6"/></linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2B466"/><stop offset="1" stop-color="#C58F3F"/></linearGradient>
  <radialGradient id="gold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FFD25E"/><stop offset="1" stop-color="#F59A00"/></radialGradient>
  <filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" flood-color="#2d3a36" flood-opacity=".35"/></filter></defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <g stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity=".75"><line x1="146" y1="150" x2="146" y2="96"/><line x1="146" y1="150" x2="98" y2="124"/><line x1="146" y1="150" x2="190" y2="108"/><line x1="146" y1="150" x2="94" y2="176"/></g>
  <g transform="translate(262 292) rotate(32)" filter="url(#sh)"><rect x="-205" y="-82" width="410" height="164" rx="52" fill="url(#wood)"/>
   <g stroke="#B07E2E" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M-110 -40 H150"/><path d="M-60 6 H170"/><path d="M-120 46 H90"/></g>
   <circle cx="-135" cy="0" r="52" fill="#9A6B22"/><circle cx="-135" cy="0" r="46" fill="url(#gold)" stroke="#E08E00" stroke-width="5"/>
   <g stroke="#2d2a36" stroke-width="13" stroke-linecap="round"><line x1="-160" y1="0" x2="-110" y2="0"/><line x1="-135" y1="-25" x2="-135" y2="25"/></g>
   <path d="M-168 -22 A38 38 0 0 1 -138 -42" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/></g></svg></body></html>`;
  await send('Emulation.setDeviceMetricsOverride',{width:512,height:512,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'data:text/html;charset=utf-8,'+encodeURIComponent(svg)}); await sleep(800);
  const s=await send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:512,height:512,scale:1}}); fs.writeFileSync(path.join(OUT,'icon-512.png'),Buffer.from(s.data,'base64')); console.log('saved icon');
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e=>{console.error(e);chrome.kill();process.exit(1);});
