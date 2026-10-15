let vennInformation=[1,0,1,1],vennComplete=true;
const vennRadius=145,vennPositions=[[125,132],[405,132],[265,83],[265,355],[164,250],[366,250],[265,193]];
function vennWord(){const [a,b,c,d]=vennInformation;return [a^b^d,a^c^d,a,b^c^d,b,c,d];}
function renderVenn(){
 const word=vennWord(),groups=[[1,3,5,7],[2,3,6,7],[4,5,6,7]],colors=['#164d80','#873d16','#145c36'];
 const centers=[[190,150],[340,150],[265,270]],svg=document.getElementById('hamming-venn');let markup='';
 centers.forEach(([cx,cy],i)=>markup+=`<circle cx="${cx}" cy="${cy}" r="${vennRadius}" fill="${colors[i]}" fill-opacity=".055" stroke="${colors[i]}" stroke-width="2.5"/>`);
 for(let k=1;k<=7;k++){
  const [x,y]=vennPositions[k-1],parity=[1,2,4].includes(k),value=parity&&!vennComplete?'?':word[k-1];
  const sub={1:'₁',2:'₂',3:'₃',4:'₄',5:'₅',6:'₆',7:'₇'}[k],label=(parity?'p':'c')+sub;
  markup+=`<g class="venn-node ${parity?'venn-parity':'venn-data'}" ${!parity?`role="button" tabindex="0" data-venn-bit="${k}"`:''} aria-label="${k}号${parity?'校验':'信息'}位，${value}${parity?'':'，点击切换0和1'}"><rect x="${x-32}" y="${y-36}" width="64" height="64" rx="6"/><text class="venn-node-label" x="${x}" y="${y-13}" text-anchor="middle">${label}</text><text class="venn-node-value" x="${x}" y="${y+21}" text-anchor="middle">${value}</text></g>`;
 }
 svg.innerHTML=markup;
 svg.querySelectorAll('[data-venn-bit]').forEach(node=>{const toggle=()=>{const k=Number(node.dataset.vennBit);vennInformation[[3,5,6,7].indexOf(k)]^=1;renderVenn();};node.onclick=toggle;node.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}};});
 document.getElementById('venn-information-value').textContent=vennInformation.join('');
 document.getElementById('venn-counts').innerHTML=groups.map((group,i)=>{const n=group.reduce((sum,k)=>sum+([1,2,4].includes(k)&&!vennComplete?0:word[k-1]),0);return `<span style="color:${colors[i]}"><b>s${['₁','₂','₄'][i]}</b><span>${n}个1${vennComplete?'　✓':'（待校验）'}</span></span>`;}).join('');
 document.getElementById('venn-codeword').textContent=word.map((v,i)=>!vennComplete&&[0,1,3].includes(i)?'?':v).join('');
 document.getElementById('venn-info').setAttribute('aria-pressed',!vennComplete);document.getElementById('venn-complete').setAttribute('aria-pressed',vennComplete);
}
document.getElementById('venn-info').onclick=()=>{vennComplete=false;renderVenn();};
document.getElementById('venn-complete').onclick=()=>{vennComplete=true;renderVenn();};
renderVenn();
