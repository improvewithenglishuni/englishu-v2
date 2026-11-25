const { chromium } = require('playwright'); const path=require('path'),fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:.25});
await p.goto('file://'+path.join(__dirname,process.argv[2]));await p.evaluate(()=>window.ready);
fs.mkdirSync('meas',{recursive:true});
for(let f=0;f<126;f++){await p.evaluate(f=>{const r=setFrame(f);
  const keep=new Set(['sketch','doodles','doodles2']);
  document.getElementById('world').style.transform='none';
  for(const el of document.getElementById('world').children){ if(!keep.has(el.id)&&!el.querySelector('#sketch')) el.style.visibility='hidden'; }
  // inside the svg that holds the sketch, hide everything except the sketch
  const sk=document.getElementById('sketch'); for(const c of sk.parentNode.children){ if(c!==sk && c.tagName!=='defs') c.style.visibility='hidden'; }
  document.getElementById('stage').style.background='#fff'; return r;},f);
  await p.waitForTimeout(20);
  await (await p.$('#stage')).screenshot({path:`meas/m${String(f).padStart(3,'0')}.png`});}
await b.close();})();
