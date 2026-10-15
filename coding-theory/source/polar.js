// Natural order, no bit-reversal: x = u F^(tensor 3), F = [[1,0],[1,1]].
const pcInfoPositions=[3,5,6,7];let pcInformation=[1,0,1,1],pcStage=0,pcRound=0,pcAssigned=false,pcPrefix=[],pcDecodeHistory=[];
function pcInput(info=pcInformation){let u=Array(8).fill(0);pcInfoPositions.forEach((p,i)=>u[p]=info[i]);return u;}
function pcTrace(u){const rows=[[...u]];for(let gap=1;gap<u.length;gap*=2){const row=[...rows.at(-1)];for(let base=0;base<u.length;base+=2*gap)for(let j=0;j<gap;j++)row[base+j]^=row[base+gap+j];rows.push(row);}return rows;}
function pcEncode(u){return pcTrace(u).at(-1);}
function pcReliabilities(z,n){return n===1?[z]:[...pcReliabilities(2*z-z*z,n/2),...pcReliabilities(z*z,n/2)];}
const pcZ=pcReliabilities(.5,8);
function pcF(a,b){return a===null||b===null?null:a^b;}
function pcG(a,b,s){if(b!==null)return b;return a===null?null:a^s;}
function pcObservation(y,prefix,target){
 const trace=[{values:[...y],label:'接收8位',operation:''}];
 function visit(alpha,offset,index){
  if(alpha.length===1)return alpha[0];
  const half=alpha.length/2,left=index<half;
  const partial=left?null:pcEncode(prefix.slice(offset,offset+half));
  const next=Array.from({length:half},(_,j)=>left?pcF(alpha[j],alpha[j+half]):pcG(alpha[j],alpha[j+half],partial[j]));
  trace.push({values:next,label:half===1?'本位线索':'合并'+half+'位',operation:left?'两路已知 → 异或':'利用此前决定合并'});
  return visit(next,left?offset:offset+half,left?index:index-half);
 }
 return {value:visit(y,0,target),trace};
}
let pcSent=pcEncode(pcInput()),pcReceived=[];
function pcStartDecode(failed=false){pcInformation=[1,0,1,1];pcSent=pcEncode(pcInput());pcReceived=pcSent.map((v,i)=>(failed?[0,1,2,3,4,5,6,7]:[0,2,5]).includes(i)?null:v);pcPrefix=[];pcDecodeHistory=[];}
function pcNext(){
 if(pcPrefix.length>=8)return;
 const i=pcPrefix.length,observation=pcObservation(pcReceived,pcPrefix,i),frozen=!pcInfoPositions.includes(i);
 if(!frozen&&observation.value===null){pcRender();return;}
 const value=frozen?0:observation.value;pcPrefix.push(value);pcDecodeHistory.push({i,value,frozen,...observation});pcRender();
}
function pcVector(values,classes=[]){return values.map((v,i)=>`<span class="pc-bit ${classes[i]||''}">${v===null?'?':v}</span>`).join('');}
let pcRecursiveMode='schematic',pcCombineSize=4,pcCombineLayer=1;
function pcCombineSplitGraph(){
return `<svg class="pc-recursive pc-combine-split" viewBox="0 0 1128 275" role="img" aria-label="两个输入先异或混合，通过两次独立的物理信道W，再按顺序译码分成W负和W正两个合成信道">
<text class="pc-cs-heading" x="0" y="26">先合成：两次独立使用信道W</text><text class="pc-cs-heading" x="650" y="26">再分裂：按顺序解两个比特</text>
<g fill="none" stroke="#536d8b" stroke-width="3"><path d="M54 102H340 M450 102H540 M54 192H340 M450 192H540 M205 192V102"/></g>
<circle cx="205" cy="192" r="4" fill="#00144a"/><circle cx="205" cy="102" r="16" fill="#fff" stroke="#00144a" stroke-width="2"/><path d="M195 102H215 M205 92V112" stroke="#00144a" stroke-width="2"/>
<g class="pc-cs-label"><text x="10" y="111">a</text><text x="10" y="201">b</text><text x="245" y="80">a⊕b</text><text x="270" y="169">b</text><text x="552" y="111">y₁</text><text x="552" y="201">y₂</text></g>
<rect x="340" y="70" width="110" height="64" fill="#f1f5fa" stroke="#7890aa" stroke-width="2"/><rect x="340" y="160" width="110" height="64" fill="#f1f5fa" stroke="#7890aa" stroke-width="2"/><g class="pc-cs-w" text-anchor="middle"><text x="395" y="112">W</text><text x="395" y="202">W</text></g>
<text class="pc-cs-caption" x="70" y="265">W：每次独立有50%概率丢失</text>
<rect x="650" y="62" width="465" height="83" fill="#fbf0f0" stroke="#b77878"/><text class="pc-cs-label pc-cs-bad" x="668" y="94">先解a：合成信道 W⁻</text><text class="pc-cs-detail" x="668" y="128">线索(y₁,y₂)；丢失概率75%</text>
<rect x="650" y="162" width="465" height="83" fill="#eef7f1" stroke="#488865"/><text class="pc-cs-label pc-cs-good" x="668" y="194">再解b：合成信道 W⁺（a已知）</text><text class="pc-cs-detail" x="668" y="228">线索(y₁,y₂,a)；丢失概率25%</text>
</svg>`;
}
function pcRecursiveNetwork(){
const n=pcCombineSize,depth=Math.log2(n),active=pcCombineLayer,dy=n===4?48:25,yy=i=>(n===4?53:34)+i*dy,stageWidth=740/depth;
let groups='',wires='',gates='',channels='',labels='';
for(let i=0;i<n;i++){
wires+=`<line class="pc-physical-wire" x1="70" y1="${yy(i)}" x2="960" y2="${yy(i)}" stroke="#74879d"/>`;
labels+=`<text class="pc-recursive-value" x="18" y="${yy(i)+8}">u${i+1}</text><text class="pc-recursive-value" x="1060" y="${yy(i)+8}">y${i+1}</text>`;
channels+=`<rect class="pc-physical-channel" x="960" y="${yy(i)-11}" width="72" height="22" rx="2" fill="#eef3f8" stroke="#6a819d"/><text class="pc-w-label" text-anchor="middle" x="996" y="${yy(i)+8}">W</text><line x1="1032" y1="${yy(i)}" x2="1048" y2="${yy(i)}" stroke="#74879d"/>`;
}
for(let d=0;d<depth;d++){
const gap=2**d,start=140+d*stageWidth,col=['#254b7d','#095d35','#a00000'][d],shown=d<active;
labels+=`<text class="pc-recursive-label" text-anchor="middle" x="${start+stageWidth/2}" y="18" style="fill:${shown?col:'#8795a6'}">第${d+1}层：${2*gap}个一组</text>`;
if(!shown)continue;
for(let base=0;base<n;base+=2*gap){
groups+=`<rect x="${start+8}" y="${yy(base)-11}" width="${stageWidth-26}" height="${(2*gap-1)*dy+22}" rx="4" fill="${d%2?'#f0f7f233':'#eef3fa44'}" stroke="${col}" stroke-opacity=".35" stroke-dasharray="5 4"/>`;
for(let j=0;j<gap;j++){
const upper=base+j,lower=upper+gap,x=start+stageWidth*.5+j*28;
wires+=`<line class="pc-xor-branch" data-layer="${d+1}" data-upper="${upper}" data-lower="${lower}" x1="${x}" y1="${yy(lower)}" x2="${x}" y2="${yy(upper)}" stroke="${col}"/>`;
gates+=`<circle class="pc-xor-source" cx="${x}" cy="${yy(lower)}" r="3.5" fill="${col}"/><circle class="pc-xor-gate" cx="${x}" cy="${yy(upper)}" r="8" fill="#fff" stroke="${col}" stroke-width="2"/><path d="M${x-5} ${yy(upper)}h10 M${x} ${yy(upper)-5}v10" stroke="${col}" stroke-width="2"/>`;
}}
}
return `<svg class="pc-recursive pc-progressive-network" viewBox="0 0 1128 235" role="img" aria-label="${n}个物理信道的递归合成，已展开${active}层，共${depth}层；异或支线全部竖直">${groups}${wires}${gates}${channels}${labels}</svg>`;
}
function pcCombineControls(){const depth=Math.log2(pcCombineSize);return `<div class="pc-combine-controls"><button data-pc-size="4" aria-pressed="${pcCombineSize===4}">4个信道</button><button data-pc-size="8" aria-pressed="${pcCombineSize===8}">8个信道</button><span aria-live="polite">已展开${pcCombineLayer} / ${depth}层</span><button data-pc-layer="prev" ${pcCombineLayer===0?'disabled':''}>上一层</button><button data-pc-layer="next" ${pcCombineLayer===depth?'disabled':''}>展开下一层</button></div>`;}
function pcRecursiveGraph(){
const levels=[[.5]];for(let d=1;d<=3;d++)levels.push(levels.at(-1).flatMap(z=>[2*z-z*z,z*z]));
const x=(d,j)=>150+(j+.5)*978/(2**d),y=d=>28+d*70;let paths='',nodes='';
for(let d=0;d<4;d++)for(let j=0;j<levels[d].length;j++){
if(d<3)for(let k=0;k<2;k++)paths+=`<line x1="${x(d,j)}" y1="${y(d)+18}" x2="${x(d+1,j*2+k)}" y2="${y(d+1)-18}" stroke="${k?'#488865':'#b77878'}"/>`;
nodes+=`<rect x="${x(d,j)-50}" y="${y(d)-18}" width="100" height="36" rx="3" fill="${d===0?'#f2f5fa':j%2?'#eef7f1':'#fbf0f0'}" stroke="#aebdca"/><text class="pc-recursive-value" text-anchor="middle" x="${x(d,j)}" y="${y(d)+9}">${(levels[d][j]*100).toFixed(1)}%</text>`;
}
const labels=['原信道','第1层 · 2个','第2层 · 4个','第3层 · 8个'];return `<svg class="pc-recursive" viewBox="0 0 1128 275" role="img" aria-label="三层极化把50%擦除概率分化成八个不同可靠性的合成信道">${labels.map((t,d)=>`<text class="pc-recursive-label" x="0" y="${y(d)+8}">${t}</text>`).join('')}${paths}${nodes}</svg>`;
}
function pcRender(){
 document.querySelectorAll('[data-pc-stage]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.pcStage)===pcStage));
 const view=document.getElementById('pc-view');
 if(pcStage===0)view.innerHTML='<div class="pc-columns"><div><h2>先看最小的两位变换</h2><svg class="pc-kernel" viewBox="0 0 540 225" aria-label="a和b变换为a异或b与b"><path d="M95 60H440 M95 175H440 M310 175V60"/><circle cx="310" cy="175" r="4" style="fill:var(--navy);stroke:none"/><circle cx="310" cy="60" r="22"/><text x="310" y="68" text-anchor="middle">⊕</text><text x="50" y="68">a</text><text x="50" y="183">b</text><text x="450" y="68">a⊕b</text><text x="450" y="183">b</text><text class="pc-small" x="265" y="212" text-anchor="middle">每次独立有50%概率丢失</text></svg></div><div class="pc-explain"><h2>同样的物理信道，形成不同的解码难度</h2><div class="pc-prob-card"><b>先解a：两次都要收到</b><span>丢失概率：1 − (1−50%)² = <strong>75%</strong></span></div><div class="pc-prob-card good"><b>再解b：利用已经知道的a</b><span>收到b，或收到a⊕b，都可以算b。<br>丢失概率：50% × 50% = <strong>25%</strong></span></div><div class="pc-note">一个变差，一个变好；平均丢失概率仍是50%。</div></div></div>';
 else if(pcStage===4){
const modes=[['schematic','信道合成与分裂'],['channel','1→2→4→8分化树'],['network','4/8信道逐层合成']];
view.innerHTML='<div class="pc-recursive-modes">'+modes.map(([m,t])=>`<button data-pc-recursive-mode="${m}" aria-pressed="${pcRecursiveMode===m}">${t}</button>`).join('')+'</div>'+(pcRecursiveMode==='schematic'?pcCombineSplitGraph():pcRecursiveMode==='channel'?pcRecursiveGraph():pcCombineControls()+pcRecursiveNetwork())+'<p class="pc-recursive-note">'+(pcRecursiveMode==='schematic'?'合成、分裂后再重复同一过程，就得到1→2→4→8的递归分化。':pcRecursiveMode==='channel'?'左支路2z−z²，右支路z²；底层8个丢失概率与下一视图逐一对应。':'虚线框表示本层分组；实心点才连接，普通交叉不连接。')+'</p>';
 }

 else if(pcStage===1)view.innerHTML='<h2>重复三层变换，得到8个合成信道</h2><div class="pc-bar-caption">合成信道的丢失概率（越低越可靠） · 基于独立50%擦除模型计算</div><div class="pc-chart">'+pcZ.map((z,i)=>`<div class="pc-bar-column ${pcAssigned?(pcInfoPositions.includes(i)?'info':'frozen'):''}"><span>${(100*z).toFixed(1)}%</span><div class="pc-bar-track"><i style="height:${z*150}px"></i></div><b>u${i+1}</b><small>${pcAssigned?(pcInfoPositions.includes(i)?'信息位':'冻结为0'):'待选择'}</small></div>`).join('')+'</div><div class="pc-bar-bottom"><button data-pc-action="assign">选出4个更可靠的位置</button><span>'+ (pcAssigned?'u₄、u₆、u₇、u₈放信息，其余位置冻结为0。':'信息放在哪四个位置？')+'</span></div>';
 else if(pcStage===2){
  const rows=pcTrace(pcInput()),labels=['输入u','第1轮<br>间隔1','第2轮<br>间隔2','第3轮<br>间隔4'];
  const gap=pcRound?2**(pcRound-1):1,pairs=[];
  if(pcRound)for(let base=0;base<8;base+=2*gap)for(let j=0;j<gap;j++)pairs.push([base+j,base+j+gap]);
  view.innerHTML='<div class="pc-columns"><div><div class="pc-position-head"><span></span>'+Array.from({length:8},(_,i)=>`<span>${i+1}</span>`).join('')+'</div>'+rows.map((row,r)=>`<div class="pc-encode-row ${r===pcRound?'current':''}"><b>${labels[r]}</b><div class="pc-vector">${pcVector(row.map(v=>r<=pcRound?v:null),r===0?Array.from({length:8},(_,i)=>pcInfoPositions.includes(i)?'info':'frozen'):[])}</div></div>`).join('')+'<div class="pc-note">深蓝是信息；其余位置冻结为0。</div></div><div class="pc-explain"><h2>信息1011，填入u₄、u₆、u₇、u₈</h2><div class="pc-information">'+pcInformation.map((v,i)=>`<button data-pc-info="${i}" aria-label="切换第${i+1}个信息位">${v}</button>`).join('')+'<small>点击可更换</small></div><div class="pc-equations">'+(pcRound?pairs.map(([a,b])=>`位置${a+1} ← ${rows[pcRound-1][a]} ⊕ ${rows[pcRound-1][b]} = ${rows[pcRound][a]}`).join('<br>'):'每一对：前项变成“前项⊕后项”，后项保留。<br>三轮只改变配对间隔，规则始终相同。')+'</div><div class="pc-actions"><button data-pc-action="encode-next" '+(pcRound===3?'disabled':'')+'>下一轮异或</button><button data-pc-action="encode-reset">重新编码</button></div><div class="pc-codeword">'+(pcRound===3?'发送x = '+rows[3].join(''):'输入u = '+rows[0].join(''))+'</div></div></div>';
 }else{
  const target=Math.min(pcPrefix.length,7),observation=pcObservation(pcReceived,pcPrefix,target),last=pcDecodeHistory.at(-1);
  const active=pcPrefix.length===8?pcObservation(pcReceived,pcPrefix.slice(0,7),7):observation;
  const frozen=!pcInfoPositions.includes(target),uncertain=pcPrefix.length<8&&!frozen&&observation.value===null;
  let message=pcPrefix.length===8?'8位都已判定；从u₄、u₆、u₇、u₈取回信息1011。':frozen?`下一位u${target+1}是冻结位，双方约定为0。<br>这一位无需猜测，写入0即可。`:`下一位u${target+1}是信息位。<br>${uncertain?'线索为“？”：这次接收无法继续确定，停止。':'综合接收结果和此前决定，得到 '+observation.value+'。'}`;
  view.innerHTML='<div class="pc-columns"><div><h2>怎样计算当前这一位的线索？</h2>'+active.trace.map((r,i)=>`<div class="pc-trace-row"><div><b>${r.label}</b><small>${r.operation}</small></div><div class="pc-vector">${pcVector(r.values)}</div></div>`).join('')+'</div><div class="pc-explain"><h2>顺序译码：从u₁到u₈逐位决定</h2><div class="pc-decisions">'+Array.from({length:8},(_,i)=>`<div class="${pcInfoPositions.includes(i)?'info':'frozen'} ${i===target?'active':''}"><small>u${i+1}</small><b>${i<pcPrefix.length?pcPrefix[i]:'·'}</b></div>`).join('')+'</div><div class="pc-message" aria-live="polite">'+message+'</div><div class="pc-actions"><button data-pc-action="decode-next" '+(pcPrefix.length===8||uncertain?'disabled':'')+'>判定下一位</button><button data-pc-action="decode-reset">重置</button><button data-pc-action="decode-fail">全部丢失</button></div><div class="pc-note">本例擦除x₁、x₃、x₆；冻结位提供约束。<br></div></div></div>';
 }
 if(pcStage===2)view.querySelector('.pc-explain h2').textContent='信息'+pcInformation.join('')+'，填入u₄、u₆、u₇、u₈';
 if(pcStage===1)view.querySelectorAll('.pc-bar-track i').forEach((bar,i)=>bar.style.height=pcZ[i]*99+'px');
 if(pcStage===3&&pcReceived.every(v=>v===null))view.querySelector('.pc-explain .pc-note').innerHTML='全部丢失时，无法确定的信息位不猜测。';
 view.querySelectorAll('[data-pc-size]').forEach(b=>b.onclick=()=>{pcCombineSize=Number(b.dataset.pcSize);pcCombineLayer=1;pcRender();});
 view.querySelectorAll('[data-pc-layer]').forEach(b=>b.onclick=()=>{pcCombineLayer=Math.max(0,Math.min(Math.log2(pcCombineSize),pcCombineLayer+(b.dataset.pcLayer==='next'?1:-1)));pcRender();});
 view.querySelectorAll('[data-pc-recursive-mode]').forEach(b=>b.onclick=()=>{pcRecursiveMode=b.dataset.pcRecursiveMode;pcRender();});
 document.querySelectorAll('[data-pc-info]').forEach(b=>b.onclick=()=>{pcInformation[Number(b.dataset.pcInfo)]^=1;pcRound=0;pcRender();});
 document.querySelectorAll('[data-pc-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.pcAction;if(a==='assign')pcAssigned=true;else if(a==='encode-next')pcRound=Math.min(3,pcRound+1);else if(a==='encode-reset')pcRound=0;else if(a==='decode-next'){pcNext();return;}else pcStartDecode(a==='decode-fail');pcRender();});
}
document.querySelectorAll('[data-pc-stage]').forEach(b=>b.onclick=()=>{pcStage=Number(b.dataset.pcStage);if(pcStage===3)pcStartDecode();pcRender();});
pcRender();
