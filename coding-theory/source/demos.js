let demoStep=0,rowError=[3,2],hammingError=5;
const rowOriginal=[[1,0,1,1,0],[0,1,0,1,1],[1,1,1,0,0],[0,0,1,0,1],[1,0,0,1,1]];
function codedRows(){const a=rowOriginal.map(r=>[...r,r.reduce((n,v)=>n^v,0)]);a.push(Array.from({length:6},(_,c)=>a.reduce((n,r)=>n^r[c],0)));return a;}
const hammingOriginal=[0,1,1,0,0,1,1];
const groups=[[1,3,5,7],[2,3,6,7],[4,5,6,7]];
function demoSteps(){return 6;}
function demoCaption(names){return '<div class="demo-steps">'+names.map((n,i)=>`<span class="${i===demoStep?'current':''}">${i+1} ${n}</span>`).join('')+'</div>';}
function demoControls(){return `<div class="demo-controls"><button data-demo-action="back" ${demoStep===0?'disabled':''}>上一步</button><button data-demo-action="forward">${demoStep===5?'下一页':'下一步'}</button><button data-demo-action="reset">重置演示</button></div>`;}
function rowState(){const a=codedRows();if(demoStep>=2&&demoStep<5)a[rowError[0]][rowError[1]]^=1;return a;}
function hammingState(){const b=hammingOriginal.slice();if(demoStep>=1&&demoStep<5)b[hammingError-1]^=1;return b;}
function getSyndrome(bits){return groups.map(g=>g.reduce((s,k)=>s^bits[k-1],0));}
function renderDemo(){
 if(COURSE[index].scene==='RowParity')renderRowDemo();else renderHammingDemo();
 const el=elements[index];
 el.querySelectorAll('[data-demo-action]').forEach(b=>b.onclick=()=>{
  if(b.dataset.demoAction==='forward')next();else if(b.dataset.demoAction==='back')prev();
  else{demoStep=0;rowError=[3,2];hammingError=5;renderDemo();updateStatus();}
 });
}
function renderRowDemo(){
 const a=rowState(),r=rowError[0],c=rowError[1],ones=a[r].reduce((n,v)=>n+v,0),colones=a.reduce((n,x)=>n+x[c],0);
 const titles=['先观察原来的25个比特','补上一行、一列校验位','现在有一个比特被翻转','检查每一行：哪一行异常？','再检查列：交点就是错误位置','翻回这一格，所有校验重新通过'];
 const explanations=[
  '原信息没有额外的检查规则。只看这些0和1，通常无法知道哪一位被改动。',
  '每行、每列都有偶数个1；浅色边缘是校验位。',
  '点击任意格子，更换单个错误位置。试着先预测：哪一行、哪一列会出现异常？',
  `第${r+1}行现在有${ones}个1，是奇数。其他行仍保持偶数。`,
  `第${c+1}列有${colones}个1，为奇数；异常行列的交点就是错位。`,
  '绿色格子已经恢复。信息和校验位都回到原来的状态；这一保证假设最多只有一位翻转。'
 ];
 const formula=demoStep===4?`第${r+1}行 ∩ 第${c+1}列`:demoStep===5?'奇数 → 偶数':demoStep===3?`${ones}个1：奇数`:demoStep===1?'每行偶数 · 每列偶数':'';
 let cells='';a.forEach((row,rr)=>row.forEach((v,cc)=>{
  const pending=demoStep===0&&(rr===5||cc===5),hit=rr===r&&cc===c;
  const cls=[v?'one':'',rr===5||cc===5?'check':'',pending?'pending':'',demoStep>=3&&demoStep<5&&rr===r?'row-alert':'',demoStep===4&&cc===c?'col-alert':'',hit&&[2,4].includes(demoStep)?'error':'',hit&&demoStep===5?'fixed':''].join(' ');
  cells+=`<button class="${cls}" data-rowcell="${rr},${cc}" aria-label="第${rr+1}行第${cc+1}列，点击选择单个错误">${pending?'·':v}</button>`;
 }));
 document.getElementById('row-demo').innerHTML=demoCaption(['原信息','加校验','翻转','查行','查列','纠正'])+`<div class="demo-layout"><div><div class="demo-grid-label">${demoStep===0?'原信息 + 预留的校验位置':'浅色边缘：校验行与校验列'}</div><div class="demo-grid">${cells}</div></div><div class="demo-explain"><h2>${titles[demoStep]}</h2><p>${explanations[demoStep]}</p>${formula?`<div class="demo-equation">${formula}</div>`:''}${demoControls()}</div></div>`;
 document.querySelectorAll('[data-rowcell]').forEach(b=>b.onclick=()=>{rowError=b.dataset.rowcell.split(',').map(Number);demoStep=2;renderDemo();updateStatus();});
}
function renderHammingDemo(){
 const bits=hammingState(),s=getSyndrome(bits),number=s[0]+2*s[1]+4*s[2];
 const checked=demoStep===5?3:Math.max(0,demoStep-1);
 const candidates=demoStep>=2&&demoStep<5?Array.from({length:7},(_,i)=>i+1).filter(k=>groups.slice(0,checked).every((g,j)=>Number(g.includes(k))===s[j])):[];
 const titles=['每个圆内，1都是偶数个','翻转一位：校验被破坏','检查左圆，留下第一条线索','检查右圆，缩小候选区域','检查下圆，定位唯一交区','翻回这一位，三个圆重新通过'];
 const colors=['#164d80','#873d16','#145c36'],centers=[[190,150],[340,150],[265,270]],labels=[[60,45],[450,45],[421,355]],names=['s₁','s₂','s₄'];
 const positions=[[125,132],[405,132],[265,83],[265,355],[164,250],[366,250],[265,193]];
 const circles=centers.map(([x,y],j)=>{const active=j<checked,color=active?(s[j]?'#a00000':'#095d35'):colors[j];return `<circle cx="${x}" cy="${y}" r="145" fill="${color}" fill-opacity="${active?'.07':'.025'}" stroke="${color}" stroke-width="${active?5:3}" ${active&&!s[j]?'stroke-dasharray="10 5"':''}/><text x="${labels[j][0]}" y="${labels[j][1]}" class="dv-group" style="fill:${color}">${names[j]}</text>`;}).join('');
 const nodes=positions.map(([x,y],i)=>{const k=i+1,candidate=candidates.includes(k),changed=demoStep===1&&k===hammingError,fixed=demoStep===5&&k===hammingError;
 const stroke=fixed?'#095d35':changed||candidate?'#a00000':'#526578',fill=fixed?'#dcf2e3':changed||candidate?'#fff0ee':candidates.length?'#f4f5f6':'#fff';
 return `<g data-hammingcell="${k}" data-candidate="${candidate}" role="button" tabindex="0" aria-label="第${k}位，值${bits[i]}，点击选择单个错误"><rect x="${x-32}" y="${y-36}" width="64" height="67" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${candidate||changed||fixed?5:2}"/><text x="${x}" y="${y-12}" text-anchor="middle" class="dv-name">${[1,2,4].includes(k)?'p':'c'}${k}</text><text x="${x}" y="${y+24}" text-anchor="middle" class="dv-value">${bits[i]}</text></g>`;}).join('');
 const checks=groups.map((g,j)=>{const ones=g.reduce((n,k)=>n+bits[k-1],0),known=demoStep===0||demoStep===5||j<checked;return `<div class="decode-check ${known?(s[j]?'odd':'even'):''}"><span>${names[j]} · ${['左圆','右圆','下圆'][j]}</span><b>${known?`${ones}个1 → ${s[j]}`:'待检查'}</b></div>`;}).join('');
 let result=demoStep===0?'信息1011；p₁、p₂、p₄是校验位。':demoStep===1?`第${hammingError}位：${hammingOriginal[hammingError-1]} → ${bits[hammingError-1]}<br>点击图中任意位，更换单错。`:demoStep===2?'奇数 → 错在圆内<br>偶数 → 错在圆外':demoStep===3?`两条线索相交：<br>候选位置 ${candidates.join('、')}`:demoStep===4?`<strong>${s[2]}${s[1]}${s[0]}₂ = ${number}</strong><br>三个圆的内外关系，锁定第${number}位。`:'<strong>恢复信息 1011</strong><br>重新检查：三个结果都是0。';
 document.getElementById('hamming-demo').innerHTML=demoCaption(['编码','翻转','查s₁','查s₂','查s₄','纠正'])+`<div class="decode-layout"><svg class="decode-venn" viewBox="35 0 465 430" role="group" aria-label="汉明码三个相交圆，点击任意比特选择错误">${circles}${nodes}</svg><div class="decode-panel"><h2>${titles[demoStep]}</h2><div class="decode-word"><span>${demoStep===0?'原码字':demoStep===5?'已纠正':'收到'}</span><code>${bits.join('')}</code></div><div class="decode-checks">${checks}</div><div class="decode-result" aria-live="polite">${result}</div>${demoControls()}</div></div>`;
 document.querySelectorAll('[data-hammingcell]').forEach(b=>{const choose=()=>{hammingError=Number(b.dataset.hammingcell);demoStep=1;renderDemo();updateStatus();};b.onclick=choose;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();choose();}};});
}
