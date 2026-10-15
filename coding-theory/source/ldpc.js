const lpH=[[1,0,0,1,1,0,0,0],[1,1,0,0,0,1,0,0],[0,1,1,0,0,0,1,0],[0,0,1,1,0,0,0,1]];
const lpNames=['d₁','d₂','d₃','d₄','p₁','p₂','p₃','p₄'];
const lpGroups=lpH.map(row=>row.flatMap((v,i)=>v?[i]:[]));
let lpInformation=[1,0,1,1],lpStage=0,lpSelected=0,lpReceived=[],lpRecovered=[],lpHistory=[];
function lpEncode(u){return [...u,u[0]^u[3],u[0]^u[1],u[1]^u[2],u[2]^u[3]];}
function lpSyndrome(c){return lpGroups.map(g=>g.reduce((v,i)=>v^c[i],0));}
function lpCandidate(c){for(let j=0;j<4;j++){const unknown=lpGroups[j].filter(i=>c[i]===null);if(unknown.length===1)return {check:j,bit:unknown[0],value:lpGroups[j].reduce((v,i)=>c[i]===null?v:v^c[i],0)};}return null;}
function lpStart(stalled=false){lpReceived=lpEncode(lpInformation);(stalled?[0,1,2,3]:[0,1,4]).forEach(i=>lpReceived[i]=null);lpRecovered=[];lpHistory=[];lpSelected=-1;}
function lpAdvance(){const step=lpCandidate(lpReceived);if(step){lpReceived[step.bit]=step.value;lpRecovered.push(step.bit);lpSelected=step.check;lpHistory.push(step);}lpRender();}
function lpRender(){
 document.querySelectorAll('[data-lp-stage]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.lpStage)===lpStage));
 document.getElementById('lp-matrix').innerHTML='<div class="lp-matrix-head"><b>H</b>'+lpNames.map(n=>'<span>'+n+'</span>').join('')+'</div>'+lpH.map((row,j)=>`<button class="lp-matrix-row ${lpSelected===j?'active':''}" data-lp-check="${j}" aria-label="查看校验C${j+1}"><b>C${j+1}</b>${row.map(v=>`<span class="${v?'one':'zero'}">${v}</span>`).join('')}</button>`).join('');
 const word=lpStage===2?lpReceived:lpEncode(lpInformation);let svg='<svg class="lp-graph" viewBox="0 0 560 190" aria-label="8个比特节点和4个校验节点构成的Tanner图">';
 lpGroups.forEach((g,j)=>g.forEach(i=>svg+=`<line class="${lpSelected===j?'active':''}" x1="${35+70*i}" y1="64" x2="${70+140*j}" y2="139"/>`));
 word.forEach((v,i)=>svg+=`<text x="${35+70*i}" y="18" text-anchor="middle">${lpNames[i]}</text><circle class="${v===null?'missing':lpRecovered.includes(i)&&lpStage===2?'recovered':''}" cx="${35+70*i}" cy="47" r="17"/><text class="value" x="${35+70*i}" y="54" text-anchor="middle">${v===null?'?':v}</text>`);
 lpGroups.forEach((g,j)=>svg+=`<g class="${lpSelected===j?'active':''}" role="button" tabindex="0" data-lp-check="${j}" aria-label="查看校验C${j+1}"><rect x="${46+140*j}" y="139" width="48" height="34"/><text x="${70+140*j}" y="163" text-anchor="middle">C${j+1}</text></g>`);
 document.getElementById('lp-graph').innerHTML=svg+'</svg>';
 const panel=document.getElementById('lp-panel');
 if(lpStage===0)panel.innerHTML='<h2>一行校验，就是一次局部检查</h2><div class="lp-equations">C1：d₁ ⊕ d₄ ⊕ p₁ = 0<br>C2：d₁ ⊕ d₂ ⊕ p₂ = 0<br>C3：d₂ ⊕ d₃ ⊕ p₃ = 0<br>C4：d₃ ⊕ d₄ ⊕ p₄ = 0</div><div class="lp-message">H中的1对应图中的一条线。<br>合法码字：Hcᵀ = 0。<br>每组1的个数为偶数。</div>';
 else if(lpStage===1){const u=lpInformation,c=lpEncode(u);panel.innerHTML='<h2>4位信息，算出4位校验</h2><div class="lp-information">'+u.map((v,i)=>`<button data-lp-info="${i}" aria-label="切换信息位d${i+1}">${v}</button>`).join('')+'<span>点击切换信息位</span></div><div class="lp-equations lp-encode-equations"><span>p₁ = d₁ ⊕ d₄ = '+c[4]+'</span><span>p₂ = d₁ ⊕ d₂ = '+c[5]+'</span><span>p₃ = d₂ ⊕ d₃ = '+c[6]+'</span><span>p₄ = d₃ ⊕ d₄ = '+c[7]+'</span></div><div class="lp-word">'+c.slice(0,4).join('')+' '+c.slice(4).join('')+'</div><div class="lp-legend">信息在前，校验在后：Hcᵀ = 0。</div>';}
 else{
  const remaining=word.filter(v=>v===null).length,last=lpHistory.at(-1),candidate=lpCandidate(word);let message;
  if(last)message=`第${lpHistory.length}步：C${last.check+1}只剩${lpNames[last.bit]}未知。<br>${lpNames[last.bit]} = ${lpGroups[last.check].filter(i=>i!==last.bit).map(i=>word[i]).join(' ⊕ ')} = ${last.value}。`;
  else message='收到 ??11 ?110：d₁、d₂、p₁丢失。<br>C3只剩d₂未知，先从这里开始。';
  if(remaining&&!candidate)message='译码停住：每条校验都含有2个未知位。<br>局部检查无法继续；稀疏连接并不保证所有丢失都能恢复。';
  if(!remaining)message+=' 全部恢复，Hcᵀ = 0。';
  panel.innerHTML='<h2>擦除译码：一次解一个未知数</h2><div class="lp-word">'+word.slice(0,4).map(v=>v===null?'?':v).join('')+' '+word.slice(4).map(v=>v===null?'?':v).join('')+'</div><div class="lp-message" aria-live="polite">'+message+'</div><div class="lp-actions"><button data-lp-action="next" '+(!candidate?'disabled':'')+'>恢复下一位</button><button data-lp-action="reset">重新演示</button><button data-lp-action="stalled">看卡住的例子</button></div><div class="lp-legend">“？”代表丢失；绿色代表恢复。</div>';
 }
 document.querySelectorAll('[data-lp-check]').forEach(b=>{const select=()=>{lpSelected=Number(b.dataset.lpCheck);lpRender();};b.onclick=select;if(b.tagName.toLowerCase()==='g')b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}};});
 document.querySelectorAll('[data-lp-info]').forEach(b=>b.onclick=()=>{lpInformation[Number(b.dataset.lpInfo)]^=1;lpRender();});
 document.querySelectorAll('[data-lp-action]').forEach(b=>b.onclick=()=>{if(b.dataset.lpAction==='next')lpAdvance();else{lpInformation=[1,0,1,1];lpStart(b.dataset.lpAction==='stalled');lpRender();}});
}
document.querySelectorAll('[data-lp-stage]').forEach(b=>b.onclick=()=>{lpStage=Number(b.dataset.lpStage);lpSelected=0;if(lpStage===2){lpInformation=[1,0,1,1];lpStart();}lpRender();});
lpRender();
