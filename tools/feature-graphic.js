// node feature-graphic.js -> store-assets/feature-graphic-1024x500.png (bắt buộc cho Google Play)
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const port=9300+Math.floor(Math.random()*500), dir=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+dir,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let targets; for(let i=0;i<50;i++){try{targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();if(targets.find(t=>t.type==='page'))break;}catch(e){}await sleep(300);}
  const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map(); ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||d.error);pend.delete(d.id);}};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride',{width:1024,height:500,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:require('url').pathToFileURL(path.join(__dirname,'feature-graphic.html')).href}); await sleep(1500);
  const s=await send('Page.captureScreenshot',{format:'png',clip:{x:0,y:0,width:1024,height:500,scale:1}});
  fs.writeFileSync(path.join(__dirname,'..','store-assets','feature-graphic-1024x500.png'),Buffer.from(s.data,'base64')); console.log('saved feature graphic');
  ws.close(); chrome.kill(); process.exit(0);
})();
