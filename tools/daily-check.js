const fs=require('fs');
const src=fs.readFileSync('F:/CLAUDE AI/screw-jam-3d/index.html','utf8');
const code=src.split('// ==LEVELS==')[1].split('// ==/LEVELS==')[0];
const M=new Function(code+';return {makeDaily,solvePath,layoutIssues}')();
let hard=0,bad=0,maxMs=0,sigs=new Set(); const t0=Date.now();
for(let d=0;d<365;d++){ const date=new Date(Date.UTC(2026,10,12+d)).toISOString().slice(0,10); const a=Date.now(); const L=M.makeDaily(date); maxMs=Math.max(maxMs,Date.now()-a);
  const ok3=!!M.solvePath(L,3), ok2=!!M.solvePath(L,2); if(!ok3) bad++; if(ok3&&!ok2) hard++; sigs.add(L.screws.map(s=>s.color).join('')+L.plates.map(p=>p.x+','+p.y).join('')); }
console.log('365 daily puzzles: unsolvable='+bad+', need all 3 slots='+hard+', unique='+sigs.size+', max gen ms='+maxMs+', total ms='+(Date.now()-t0));
