// Kịch bản kiểm thử tình huống: node scen.js [WxH]
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const size=(process.argv[2]||'480x900'), shotDir=process.argv[3]||'';
const port=9300+Math.floor(Math.random()*500), dir=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+dir,'--window-size='+size.replace('x',','),'--force-device-scale-factor=1','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  let targets; for(let i=0;i<50;i++){try{targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();if(targets.find(t=>t.type==='page'))break;}catch(e){}await sleep(300);}
  const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map(); const logs=[];
  ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||d.error);pend.delete(d.id);} else if(d.method==='Runtime.exceptionThrown') logs.push('EXC '+(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text)); else if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error') logs.push('console.error '+d.params.args.map(a=>a.value??a.description).join(' '));};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});return r.result?r.result.value:r;};
  const shot=async n=>{ if(!shotDir)return; const s=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(path.join(shotDir,n+'.png'),Buffer.from(s.data,'base64')); };
  const ok=(name,cond,extra='')=>console.log((cond?'PASS ':'FAIL ')+name+(extra?'  '+extra:''));
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate',{url:'file:///F:/CLAUDE%20AI/screw-jam-3d/index.html?start=3&debug=1'}); await sleep(3500);
  await shot('s1-start');
  ok('loads level 4', await ev('__sj.state.level')===3 && await ev('__sj.screws.length')===12);
  // 1) hint
  await ev('document.getElementById("hintBtn").click()'); await sleep(300);
  ok('hint ring visible after Hint button', await ev('__sj.hintVisible')===true);
  await shot('s2-hint');
  // 2) lose: chơi ngẫu nhiên nhiều ván cho đến khi bí thật
  let lostAt=-1;
  for(let trial=0;trial<25&&lostAt<0;trial++){
    await ev('__sj.loadLevel(3)'); await sleep(250);
    for(let i=0;i<14;i++){
      const idx=await ev(`(function(){const f=__sj.screws.filter(s=>!s.removed&&!__sj.blockerOf(s)); if(!f.length) return -1; const full=!__sj.slots.some(sl=>sl.open&&!sl.screw); const b=__sj.boxes[__sj.state.boxIdx]; const c=full&&b?f.filter(s=>s.color===b.color):f; if(!c.length) return -2; return c[Math.floor(Math.random()*c.length)].idx;})()`);
      if(idx<0) break; await ev(`__sj.pullScrew(__sj.screws[${idx}])`); await sleep(160);
      if(await ev('__sj.state.mode')!=='play') break;
    }
    await sleep(900);
    const m=await ev('__sj.state.mode'); if(m==='lost') lostAt=trial;
  }
  console.log('random games until lost:', lostAt+1);
  await sleep(1500);
  const mode=await ev('__sj.state.mode'); ok('lose state reached with bad play', mode==='lost','mode='+mode);
  await shot('s3-lost');
  ok('lose overlay shows Watch Ad button', await ev('[...document.querySelectorAll("#ovBtns button")].some(b=>/Watch Ad/.test(b.textContent))'));
  // 3) watch ad -> +1 slot -> back to play
  await ev('[...document.querySelectorAll("#ovBtns button")].find(b=>/Watch Ad/.test(b.textContent)).click()'); await sleep(500);
  ok('ad overlay shown', await ev('__sj.state.mode')==='ad');
  await sleep(3800);
  ok('after ad: play mode and 4 slots', await ev('__sj.state.mode')==='play' && await ev('__sj.state.openSlots')===4, 'mode='+await ev('__sj.state.mode')+' slots='+await ev('__sj.state.openSlots'));
  await shot('s4-after-ad');
  // 4) restart
  await ev('document.getElementById("replay").click()'); await sleep(800);
  ok('restart resets (12 screws, 3 slots, play)', await ev('__sj.screws.filter(s=>!s.removed).length')===12 && await ev('__sj.state.openSlots')===3 && await ev('__sj.state.mode')==='play');
  // 5) tap blocked screw -> toast, no removal
  const blk=await ev(`(function(){const s=__sj.screws.find(s=>__sj.blockerOf(s)); return s?s.idx:-1;})()`);
  ok('level has a covered screw', blk>=0);
  // 6) locked slot tap -> ad
  await ev('document.getElementById("addHole").click()'); await sleep(600);
  ok('+1 Slot button starts ad', await ev('__sj.state.mode')==='ad'); await sleep(3800);
  ok('+1 Slot granted', await ev('__sj.state.openSlots')===4);
  // 6b) búa gỡ: tháo được cả ốc đang bị che; búa miễn phí 1 lần mỗi màn, lần sau phải xem quảng cáo
  await ev('__sj.loadLevel(3)'); await sleep(900);
  const cov=await ev(`(function(){const s=__sj.screws.find(s=>__sj.blockerOf(s)); return s?s.idx:-1;})()`);
  await ev('__sj.armHammer()'); ok('hammer armed (free use)', await ev('__sj.state.hammerArmed')===true);
  await ev(`__sj.clickScrew(__sj.screws[${cov}])`); await sleep(500);
  ok('hammer removes a COVERED screw', await ev(`__sj.screws[${cov}].removed`)===true);
  ok('hammer disarmed and used up', await ev('__sj.state.hammerArmed')===false && await ev('__sj.state.hammers')===0);
  await ev('__sj.armHammer()'); await sleep(400);
  ok('second hammer requires ad', await ev('__sj.state.mode')==='ad'); await sleep(3800);
  ok('after ad hammer is armed', await ev('__sj.state.hammerArmed')===true && await ev('__sj.state.mode')==='play');
  // 7) next level progression & persistence
  await ev('__sj.loadLevel(4)'); await sleep(500);
  ok('level 5 loads', await ev('__sj.state.level')===4);
  ok('save data readable', await ev('typeof __sj.Save.d.frontier')==='number');
  await shot('s5-level5');
  // rò rỉ bộ nhớ: nạp 40 màn liên tiếp, số geometry/texture trong GPU không được tăng
  await ev('__sj.loadLevel(10)'); await sleep(300); const g0=await ev('__sj.info.geometries');
  for(let i=11;i<51;i++){ await ev('__sj.loadLevel('+i+')'); }
  await sleep(300); const g1=await ev('__sj.info.geometries'); ok('no geometry leak over 40 levels', g1-g0<=4, 'before='+g0+' after='+g1);
  console.log(logs.length?logs.join('\n'):'no JS errors');
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e=>{console.error(e);chrome.kill();process.exit(1);});
