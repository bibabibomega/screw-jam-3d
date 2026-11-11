const fs=require('fs');
const src=fs.readFileSync('F:/CLAUDE AI/screw-jam-3d/index.html','utf8');
const code=src.split('// ==LEVELS==')[1].split('// ==/LEVELS==')[0];
const {LEVELS,resolveLevel,inRect,solvePath,makeLevel}=new Function(code+';return {LEVELS,resolveLevel,inRect,solvePath,makeLevel}')();
const grow=(q,d)=>({...q,w:q.w+d,h:q.h+d});
const verbose=process.argv[2]==='-v';
LEVELS.forEach((def,li)=>{
  const L=resolveLevel(def); const n=L.screws.length; const out=[];
  const cnt={}; L.screws.forEach(s=>cnt[s.color]=(cnt[s.color]||0)+1);
  const byId={}; L.plates.forEach(p=>byId[p.id]=p);
  L.screws.forEach((s,i)=>{
    s.plateIds.forEach(id=>{ if(!inRect(grow(byId[id],-0.8),s.x,s.y)) out.push(`screw ${i} not inside plate ${id} with margin`);});
    L.plates.forEach(q=>{
      if(q.layer<=s.layer) return;
      const inside=inRect(q,s.x,s.y);
      if(!inside && inRect(grow(q,1.0),s.x,s.y)) out.push(`screw ${i} partially under plate ${q.id}`);
      if(inside && !inRect(grow(q,-0.9),s.x,s.y)) out.push(`screw ${i} barely under plate ${q.id}`);
    });
    s.cover=L.plates.filter(p=>p.layer>s.layer&&inRect(p,s.x,s.y)).map(p=>p.id);
    if(s.x<-5.0||s.x>5.0||s.y<-4.6||s.y>5.4) out.push(`screw ${i} off board (${s.x.toFixed(1)},${s.y.toFixed(1)})`);
  });
  L.plates.forEach(p=>{
    for(const [sx,sy] of [[1,1],[1,-1],[-1,1],[-1,-1]]){const c=Math.cos(p.ang),s=Math.sin(p.ang);const x=p.x+sx*p.w/2*c-sy*p.h/2*s,y=p.y+sx*p.w/2*s+sy*p.h/2*c;
      if(Math.abs(x)>5.4||y<-5||y>5.7) out.push(`plate ${p.id} corner off board (${x.toFixed(1)},${y.toFixed(1)})`);}
  });
  for(const c in cnt) if(cnt[c]%3) out.push('color '+c+' count '+cnt[c]);
  const order=L.order, full=(1<<n)-1;
  function plateGone(p,rem){return L.screws.every((s,i)=>!s.plateIds.includes(p.id)||(rem>>i&1));}
  function blocked(i,rem){const s=L.screws[i];return L.plates.some(p=>p.layer>s.layer&&inRect(p,s.x,s.y)&&!plateGone(p,rem));}
  function solveWith(SLOTS){
    const memo=new Map();
    function solve(rem,buf){
      if(rem===full) return true;
      const key=rem*100000+buf; if(memo.has(key)) return memo.get(key);
      memo.set(key,false);
      const dc={}; L.screws.forEach((s,i)=>{if((rem&~buf)>>i&1)dc[s.color]=(dc[s.color]||0)+1;});
      let bi=0; while(bi<order.length&&(dc[order[bi]]||0)>=3) bi++;
      const cur=order[bi]; let ok=false;
      for(let i=0;i<n&&!ok;i++){
        if(rem>>i&1||blocked(i,rem)) continue;
        let r2=rem|(1<<i), b2=buf;
        if(L.screws[i].color===cur){
          for(;;){ const c2={}; L.screws.forEach((s,k)=>{if((r2&~b2)>>k&1)c2[s.color]=(c2[s.color]||0)+1;});
            let b=0; while(b<order.length&&(c2[order[b]]||0)>=3)b++; if(b>=order.length)break;
            const col=order[b]; let moved=false;
            for(let k=0;k<n;k++) if((b2>>k&1)&&L.screws[k].color===col&&(c2[col]||0)<3){b2&=~(1<<k);c2[col]=(c2[col]||0)+1;moved=true;}
            if(!moved)break; }
        } else {
          let bc=0; for(let k=0;k<n;k++) if(b2>>k&1) bc++;
          if(bc>=SLOTS) continue; b2|=(1<<i);
        }
        if(solve(r2,b2)) ok=true;
      }
      memo.set(key,ok); return ok;
    }
    return solve(0,0);
  }
  let minSlots=null; for(let k=0;k<=5;k++) if(solvePath(L,k)){minSlots=k;break;}
  console.log(`L${li+1} screws=${n} counts=${JSON.stringify(cnt)} minSlotsNeeded=${minSlots}`);
  if(verbose) L.screws.forEach((s,i)=>console.log(`  s${i} ${s.color} (${s.x.toFixed(1)},${s.y.toFixed(1)}) covered by [${s.cover}]`));
  out.forEach(o=>console.log('  !! '+o));
});
// --- màn sinh tự động ---
const t0=Date.now(); const stats={};
for(let n=4;n<104;n++){
  const a=Date.now(); const L=makeLevel(n); const dt=Date.now()-a;
  const cnt={}; L.screws.forEach(s=>cnt[s.color]=(cnt[s.color]||0)+1);
  const bad=Object.values(cnt).some(v=>v%3);
  let min=null; for(let k=0;k<=4;k++) if(solvePath(L,k)){min=k;break;}
  const want=[1,1,2,3][(n-4)%4];
  stats[n]={screws:L.screws.length,min,want,ms:dt,bad};
  if(bad||min===null||min>3) console.log('!! level',n+1,JSON.stringify(stats[n]));
}
console.log('generated levels 5..104:', Object.values(stats).filter(s=>s.min===s.want).length+'/100 hit target; max ms',Math.max(...Object.values(stats).map(s=>s.ms)),'total',Date.now()-t0,'ms');
console.log(JSON.stringify(Object.values(stats).map(s=>s.min)));
