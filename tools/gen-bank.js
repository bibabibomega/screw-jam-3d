// Sinh kho bố cục: node gen-bank.js  -> ghi bank.json. Mỗi bố cục phải qua mọi luật hình học và đạt được độ khó mục tiêu với 1 bộ màu nào đó.
const fs=require('fs');
const src=fs.readFileSync('F:/CLAUDE AI/screw-jam-3d/index.html','utf8');
const code=src.split('// ==LEVELS==')[1].split('// ==/LEVELS==')[0];
const M=new Function(code+';return {genLayout,resolveLevel,solvePath,mulberry32,layoutIssues}')();
const want={12:24,9:10}; const bank=[]; const cnt={12:0,9:0};
const rng=M.mulberry32(20261111);
const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
function hits(lay,targets,tries){ const k=lay.screws.length/3, found={};
  for(let a=0;a<tries&&Object.keys(found).length<targets.length;a++){
    const cols=sh(['R','B','Y','G','P']).slice(0,k), bag=sh([].concat(...cols.map(c=>[c,c,c])));
    const L=M.resolveLevel({order:sh(cols.slice()),plates:lay.plates,screws:lay.screws.map((s,i)=>({...s,c:bag[i]}))});
    for(const t of targets) if(!found[t]&&M.solvePath(L,t)&&(t===0||!M.solvePath(L,t-1))) found[t]=1; }
  return Object.keys(found).length===targets.length; }
let tries=0;
while((cnt[12]<want[12]||cnt[9]<want[9])&&tries<9000){ tries++;
  const nS=cnt[12]<want[12]&&(cnt[9]>=want[9]||tries%3)?12:9; if(cnt[nS]>=want[nS]) continue;
  const lay=M.genLayout(rng,nS); if(!lay) continue;
  const targets=nS===12?[1,2,3]:[1];
  if(!hits(lay,targets,nS===12?400:150)) continue;
  bank.push({plates:lay.plates,screws:lay.screws.map(({p,t,also})=>also?{p,t,also}:{p,t})}); cnt[nS]++; }
console.log('bank',cnt,'tries',tries);
fs.writeFileSync(__dirname+'/bank.json',JSON.stringify(bank));
