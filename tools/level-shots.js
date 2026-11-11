// node shots.js "5,6,7" outDir [WxH]
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const levels=process.argv[2].split(',').map(Number), out=process.argv[3], size=process.argv[4]||'480x900';
const port=9300+Math.floor(Math.random()*500), dir=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+dir,'--window-size='+size.replace('x',','),'--force-device-scale-factor=1','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let targets; for(let i=0;i<50;i++){try{targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();if(targets.find(t=>t.type==='page'))break;}catch(e){}await sleep(300);}
  const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map();
  ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||d.error);pend.delete(d.id);}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  const ev=e=>send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate',{url:'file:///F:/CLAUDE%20AI/screw-jam-3d/index.html?debug=1&start='+(levels[0]-1)}); await sleep(3000);
  for(const lv of levels){ await ev(`__sj.loadLevel(${lv-1})`); await sleep(900); const s=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(path.join(out,'lv'+lv+'.png'),Buffer.from(s.data,'base64')); }
  ws.close(); chrome.kill(); process.exit(0);
})();
