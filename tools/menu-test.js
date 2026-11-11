// Kiem thu menu chinh, sao, chuoi thang, thu thach ngay, danh sach man, huong dan, luu tien do. node menu-test.js [thu muc anh]
const {spawn}=require('child_process'), fs=require('fs'), os=require('os'), path=require('path');
const shotDir=process.argv[2]||'';
const port=9300+Math.floor(Math.random()*500), dir=fs.mkdtempSync(path.join(os.tmpdir(),'cdp-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-first-run','--remote-debugging-port='+port,'--user-data-dir='+dir,'--window-size=480,900','--force-device-scale-factor=1','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const URL='file:///F:/CLAUDE%20AI/screw-jam-3d/index.html?debug=1&menu=1&day=2026-11-12';
(async()=>{
  let targets; for(let i=0;i<50;i++){try{targets=await(await fetch(`http://127.0.0.1:${port}/json`)).json();if(targets.find(t=>t.type==='page'))break;}catch(e){}await sleep(300);}
  const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r);
  let id=0; const pend=new Map(), logs=[];
  ws.onmessage=m=>{const d=JSON.parse(m.data); if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||d.error);pend.delete(d.id);} else if(d.method==='Runtime.exceptionThrown') logs.push('EXC '+(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text)); else if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error') logs.push('console.error '+d.params.args.map(a=>a.value??a.description).join(' '));};
  const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
  const ev=async e=>{const r=await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true});return r.result?r.result.value:r;};
  const shot=async n=>{ if(!shotDir)return; const s=await send('Page.captureScreenshot',{format:'png'}); fs.writeFileSync(path.join(shotDir,n+'.png'),Buffer.from(s.data,'base64')); };
  let fails=0; const ok=(n,c,x='')=>{ if(!c) fails++; console.log((c?'PASS ':'FAIL ')+n+(x?'  '+x:'')); };
  const click=sel=>ev(`document.querySelector(${JSON.stringify(sel)}).click()`);
  const screenText=()=>ev('document.getElementById("screen").innerText');
  const cardText=()=>ev('document.getElementById("card").innerText');
  const playJs=`(async function(){ const sj=window.__sj; const sleep=ms=>new Promise(r=>setTimeout(r,ms)); const path=sj.solvePath(sj.state.L,3,0,0,sj.state.model); if(!path) return 'nopath'; for(const idx of path){ const s=sj.screws[idx]; let w=0; while(sj.blockerOf(s)&&w<60){await sleep(100);w++;} sj.clickScrew(s); await sleep(330); if(sj.state.mode==='lost') return 'lost'; } let w=0; while(sj.state.mode==='play'&&w<80){await sleep(100);w++;} return sj.state.mode; })()`;
  const winLevel=async()=>{ const r=await ev(playJs); await sleep(1400); return r; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate',{url:URL}); await sleep(3500);

  // 1) menu chinh luc khoi dong
  ok('boots into MAIN MENU', await ev('document.getElementById("screen").classList.contains("show")')===true);
  let tx=await screenText(); ok('menu has Play / Daily / Levels / How to Play / Sound', /Play · Level 1/.test(tx)&&/Daily Challenge/.test(tx)&&/Levels/.test(tx)&&/How to Play/.test(tx)&&/Sound/.test(tx));
  ok('no Resume before starting', !/Resume/.test(tx));
  ok('guide red dot on first run', await ev('!!document.querySelector("#mGuide .dot")')===true);
  await shot('m1-menu');
  // 2) huong dan
  await click('#mGuide'); await sleep(200); tx=await screenText();
  const nCards=await ev('document.querySelectorAll("#screen .gcard").length');
  ok('guide lists every GUIDE item', nCards===await ev('__sj.GUIDE.length'), 'cards='+nCards);
  ok('guide covers tools (Hint, Hammer, Extra slot) and progress (Stars, Win streak, Daily)', ['Hint','Hammer','Extra slot','Stars','Win streak','Daily Challenge'].every(k=>tx.includes(k)));
  ok('NEW badges shown first time', (await ev('document.querySelectorAll("#screen .new-badge").length'))>0);
  await shot('m2-guide');
  await click('#gBack'); await sleep(200);
  ok('guide dot cleared after reading', await ev('!!document.querySelector("#mGuide .dot")')===false);
  // 3) tinh nang moi tu co huong dan
  await ev(`__sj.GUIDE.push({id:'zz-test', group:'Tools', icon:'🧪', title:'Test Tool', text:'A brand new tool for testing.'}); __sj.openMenu();`); await sleep(200);
  tx=await screenText(); ok('new feature shows "New:" note for returning players', /New:/.test(tx)&&/Test Tool/.test(tx));
  await shot('m3-newnote');
  await click('#mSee'); await sleep(200); tx=await screenText(); ok('new feature appears in How to Play with NEW badge', /Test Tool/.test(tx)&&/NEW/.test(tx));
  await ev('__sj.GUIDE.pop(); __sj.Guide.markAllSeen();'); await click('#gBack'); await sleep(200);
  // 4) Play
  await click('#mPlay'); await sleep(900);
  ok('Play hides menu and starts level 1', await ev('document.getElementById("screen").classList.contains("show")')===false && await ev('__sj.state.level')===0 && await ev('__sj.state.kind')==='level');
  // 5) menu trong game + Resume
  await click('#menuBtn'); await sleep(200); tx=await screenText(); ok('in-game menu shows Resume', /Resume/.test(tx));
  await click('#mResume'); await sleep(200); ok('Resume returns to the game', await ev('document.getElementById("screen").classList.contains("show")')===false);
  // 6) thang man 1 khong tro giup -> 3 sao, streak 1
  let r=await winLevel(); ok('level 1 won (no helps)', r==='won', r);
  tx=await cardText(); ok('win card shows 3 stars', (tx.match(/★/g)||[]).length>=3 && !/☆/.test(tx.split('Level')[0]||''), tx.replace(/\n/g,' | ').slice(0,120));
  ok('win card shows streak 1', /Win streak: 1/.test(tx));
  await shot('m4-win');
  let sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")'));
  ok('progress persisted: frontier 1, 3 stars, streak 1', sv.frontier===1&&sv.stars[0]===3&&sv.streak===1, JSON.stringify({f:sv.frontier,s:sv.stars,st:sv.streak}));
  // 7) man 2 voi 1 hint -> 2 sao
  await ev('[...document.querySelectorAll("#ovBtns button")].find(b=>/Next Level/.test(b.textContent)).click()'); await sleep(900);
  ok('Next Level loads level 2', await ev('__sj.state.level')===1);
  await ev('document.getElementById("hintBtn").click()'); await sleep(200);
  r=await winLevel(); ok('level 2 won with one Hint', r==='won', r);
  tx=await cardText(); ok('one help = 2 stars (★★☆)', /★★☆/.test(tx), tx.replace(/\n/g,' | ').slice(0,100));
  ok('card offers Replay for 3 stars', /Replay for 3 stars/.test(tx));
  // 8) man 3 voi hint + hammer -> 1 sao, nhan thuong chuoi 3
  await ev('[...document.querySelectorAll("#ovBtns button")].find(b=>/Next Level/.test(b.textContent)).click()'); await sleep(900);
  await ev('document.getElementById("hintBtn").click()'); await sleep(150);
  await ev('document.getElementById("hammerBtn").click()'); await sleep(150); await ev('document.getElementById("hammerBtn").click()'); await sleep(150);   // bam lan 2 de cat bua (van tinh la da dung)
  r=await winLevel(); ok('level 3 won with Hint + Hammer', r==='won', r);
  tx=await cardText(); ok('two helps = 1 star (★☆☆)', /★☆☆/.test(tx), tx.replace(/\n/g,' | ').slice(0,100));
  ok('3-win streak gives +1 Hammer', /3-win streak bonus/.test(tx)&&/Win streak: 3/.test(tx));
  sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")')); ok('bonus hammer saved, streak 3', sv.bonusHammers===1&&sv.streak===3, 'bonus='+sv.bonusHammers);
  await shot('m5-streak3');
  // 9) thua lam mat chuoi
  await ev('[...document.querySelectorAll("#ovBtns button")].find(b=>/Next Level/.test(b.textContent)).click()'); await sleep(900);
  let lost=false;
  for(let trial=0;trial<25&&!lost;trial++){
    await ev('__sj.restartCurrent()'); await sleep(250);
    for(let i=0;i<14;i++){
      const idx=await ev(`(function(){const f=__sj.screws.filter(s=>!s.removed&&!__sj.blockerOf(s)); if(!f.length) return -1; const full=!__sj.slots.some(sl=>sl.open&&!sl.screw); const b=__sj.boxes[__sj.state.boxIdx]; const c=full&&b?f.filter(s=>s.color===b.color):f; if(!c.length) return -2; return c[Math.floor(Math.random()*c.length)].idx;})()`);
      if(idx<0) break; await ev(`__sj.pullScrew(__sj.screws[${idx}])`); await sleep(160);
      if(await ev('__sj.state.mode')!=='play') break;
    }
    await sleep(900); lost=(await ev('__sj.state.mode'))==='lost';
  }
  ok('lost on level 4', lost);
  tx=await cardText(); ok('lose card warns the streak is at risk', /streak is at risk/.test(tx));
  await shot('m6-lose');
  await ev('[...document.querySelectorAll("#ovBtns button")].find(b=>/Try Again/.test(b.textContent)).click()'); await sleep(500);
  sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")')); ok('Try Again after a loss resets the streak', sv.streak===0, 'streak='+sv.streak);
  ok('best streak remembered', sv.bestStreak===3);
  // 10) danh sach man + choi lai man cu
  await click('#menuBtn'); await sleep(200); await click('#mLevels'); await sleep(300);
  const nLv=await ev('document.querySelectorAll("#screen .lv").length'); ok('Levels screen lists levels 1..frontier+1', nLv===4, 'buttons='+nLv);
  tx=await screenText(); ok('Levels screen shows stars and NEW marker', /★/.test(tx)&&/NEW/.test(tx));
  await shot('m7-levels');
  await ev('document.querySelectorAll("#screen .lv")[0].click()'); await sleep(900);
  ok('tapping level 1 replays it', await ev('__sj.state.level')===0 && await ev('document.getElementById("screen").classList.contains("show")')===false);
  const before=JSON.parse(await ev('localStorage.getItem("sj3d-save")'));
  r=await winLevel(); ok('replayed level 1 won', r==='won', r);
  tx=await cardText(); ok('replay card says Replay, no streak change', /Replay · best/.test(tx));
  sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")')); ok('replay does not move frontier or streak', sv.frontier===before.frontier&&sv.streak===before.streak);
  // 11) thu thach hang ngay
  await ev('[...document.querySelectorAll("#ovBtns button")].find(b=>/Menu/.test(b.textContent)).click()'); await sleep(300);
  tx=await screenText(); ok('menu shows Daily as NEW', /Daily Challenge · NEW/.test(tx));
  await click('#mDaily'); await sleep(900);
  ok('Daily starts (kind=daily, date 2026-11-12)', await ev('__sj.state.kind')==='daily' && await ev('__sj.state.dailyDate')==='2026-11-12');
  ok('HUD title says DAILY', (await ev('document.getElementById("level").textContent'))==='DAILY');
  const a1=await ev('__sj.screws.map(s=>s.color).join("")'), a2=await ev('(function(){const L=__sj.makeDaily("2026-11-12"); return L.screws.map(s=>s.color).join("");})()'), a3=await ev('(function(){const L=__sj.makeDaily("2026-11-13"); return L.screws.map(s=>s.color).join("");})()');
  ok('same date = same puzzle, different date = different puzzle', a1===a2 && a2!==a3);
  await shot('m8-daily');
  r=await winLevel(); ok('daily won', r==='won', r);
  tx=await cardText(); ok('daily card: +1 Hammer and 1 day streak', /Daily complete/.test(tx)&&/Daily streak: 1 day/.test(tx), tx.replace(/\n/g,' | ').slice(0,120));
  sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")')); ok('daily saved (stars, streak, bonus hammer)', sv.dailyDone['2026-11-12']===3&&sv.dailyStreak===1&&sv.bonusHammers===2, JSON.stringify({d:sv.dailyDone,s:sv.dailyStreak,b:sv.bonusHammers}));
  // chuoi ngay lien tiep va bi ngat
  await ev('__sj.loadLevel(0,"2026-11-13")'); await sleep(800); r=await winLevel(); sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")'));
  ok('next-day daily continues the daily streak (2)', r==='won'&&sv.dailyStreak===2, 'streak='+sv.dailyStreak);
  await ev('__sj.loadLevel(0,"2026-11-15")'); await sleep(800); r=await winLevel(); sv=JSON.parse(await ev('localStorage.getItem("sj3d-save")'));
  ok('skipping a day resets the daily streak to 1', r==='won'&&sv.dailyStreak===1, 'streak='+sv.dailyStreak);
  await ev('__sj.loadLevel(0,"2026-11-15")'); await sleep(800); r=await winLevel(); const sv2=JSON.parse(await ev('localStorage.getItem("sj3d-save")'));
  ok('winning the same daily again gives no second reward', sv2.bonusHammers===sv.bonusHammers && sv2.dailyStreak===1);
  // 12) luu tien do sau khi tai lai trang
  await send('Page.navigate',{url:URL}); await sleep(3500);
  const re=await ev('JSON.stringify({f:__sj.Save.d.frontier,ds:__sj.Save.d.dailyStreak,bs:__sj.Save.d.bestStreak,seen:(__sj.Save.d.guideSeen||[]).length})');
  ok('progress survives a page reload', JSON.parse(re).f===3&&JSON.parse(re).ds===1&&JSON.parse(re).bs===3&&JSON.parse(re).seen>0, re);
  tx=await screenText(); ok('menu after reload shows Play · Level 4', /Play · Level 4/.test(tx));
  console.log(logs.length?logs.join('\n'):'no JS errors');
  console.log(fails?('FAILED: '+fails):'ALL PASSED');
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e=>{console.error(e);chrome.kill();process.exit(1);});
