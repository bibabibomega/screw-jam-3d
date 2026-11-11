// node cdp.js "<url>" <timeoutSec> <shotPath> [doneRegex]
// Mở Chrome headless thật (thời gian thực), điều khiển qua CDP, đọc kết quả tự test từ document.title.
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const [url,timeoutSec='120',shot='',doneRe='"result":"(WON|LOST|NO_PATH|BLOCKED|STOPPED)[^"]*"\\}\\]$']=process.argv.slice(2);
const port=9300+Math.floor(Math.random()*500);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[
  '--headless=new','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run',
  '--remote-debugging-port='+port,'--user-data-dir='+dir,'--window-size=480,900','--force-device-scale-factor=1','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let targets;
  for(let i=0;i<50;i++){ try{ targets=await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if(targets.find(t=>t.type==='page'))break; }catch(e){} await sleep(300); }
  const page=targets.find(t=>t.type==='page');
  const ws=new WebSocket(page.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pending=new Map(); const logs=[];
  ws.onmessage=m=>{ const d=JSON.parse(m.data);
    if(d.id&&pending.has(d.id)){pending.get(d.id)(d.result||d.error);pending.delete(d.id);}
    else if(d.method==='Runtime.consoleAPICalled') logs.push('console.'+d.params.type+': '+d.params.args.map(a=>a.value??a.description).join(' '));
    else if(d.method==='Runtime.exceptionThrown') logs.push('EXCEPTION: '+(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text)); };
  const send=(method,params={})=>new Promise(r=>{const i=++id;pending.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate',{url});
  const t0=Date.now(); let title='',last='';
  while(Date.now()-t0<timeoutSec*1000){
    await sleep(1500);
    const r=await send('Runtime.evaluate',{expression:'document.title'}); title=r.result?.value||'';
    if(title!==last){last=title; process.env.FULL?console.log(title):console.log(((Date.now()-t0)/1000).toFixed(0)+'s  '+title.slice(0,120));}
    if(new RegExp(doneRe).test(title)) break;
  }
  if(shot){ const s=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(shot,Buffer.from(s.data,'base64')); console.log('screenshot',shot); }
  const st=await send('Runtime.evaluate',{expression:'JSON.stringify({mode:window.__sj&&__sj.state.mode,level:window.__sj&&__sj.state.level+1})'}); console.log('state',st.result?.value);
  logs.slice(0,15).forEach(l=>console.log(l));
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e=>{console.error('runner error',e);chrome.kill();process.exit(1);});
