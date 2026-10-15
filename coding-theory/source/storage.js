// One byte per shard illustrates a systematic (6,4) MDS code over GF(256).
// Arithmetic polynomial x^8+x^4+x^3+x^2+1. Ceph's exact matrices vary by plugin.
const ecData=[10,6,3,5],ecRows=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1],[1,1,1,1],[1,2,4,8]];
function ecMul(a,b){let r=0;while(b){if(b&1)r^=a;b>>=1;a<<=1;if(a&256)a^=0x11d;}return r;}
function ecInv(a){if(!a)throw Error('Zero inverse');let r=1,b=a,n=254;while(n){if(n&1)r=ecMul(r,b);b=ecMul(b,b);n>>=1;}return r;}
function ecEncode(data){return ecRows.map(row=>row.reduce((v,c,i)=>v^ecMul(c,data[i]),0));}
const ecWord=ecEncode(ecData);let ecMissing=[],ecRestored=false;
function ecDecode(available,values=ecWord){
 if(available.length<4)return null;
 const a=available.slice(0,4).map(i=>[...ecRows[i],values[i]]);
 for(let c=0;c<4;c++){
  const pivot=a.findIndex((r,i)=>i>=c&&r[c]!==0);if(pivot<0)return null;
  [a[c],a[pivot]]=[a[pivot],a[c]];const inv=ecInv(a[c][c]);a[c]=a[c].map(v=>ecMul(v,inv));
  for(let r=0;r<4;r++)if(r!==c){const factor=a[r][c];a[r]=a[r].map((v,j)=>v^ecMul(factor,a[c][j]));}
 }
 return a.map(r=>r[4]);
}
function ecRender(){
 const names=['D₁','D₂','D₃','D₄','P','Q'];
 document.getElementById('ec-shards').innerHTML=ecWord.map((v,i)=>{
  const absent=ecMissing.includes(i),lost=absent&&!ecRestored;
  return `<div class="ec-shard ${i>3?'parity':''} ${lost?'lost':absent?'restored':''}"><strong>${names[i]}</strong><code>${lost?'????????':v.toString(2).padStart(8,'0')}</code><small>${lost?'数据块丢失':absent?'已计算恢复':'服务器 '+(i+1)}</small></div>`;
 }).join('');
 const box=document.getElementById('ec-explanation');
 if(!ecMissing.length)box.innerHTML='<b>4块原始内容，生成2块不同的校验。</b><br>P把四块逐位异或；Q先“乘不同的权重”再异或，提供第二条独立线索。';
 else if(ecMissing.length===1)box.innerHTML=ecRestored?'<b>D₂已恢复：00000110。</b><br><code>D₂ = P ⊕ D₁ ⊕ D₃ ⊕ D₄</code>　已知位置，把缺失内容当成未知数。':'<b>D₂丢了，另外5块还在。</b><br>先用P和其他3个数据块，算回D₂；⊕表示逐位异或。';
 else if(ecMissing.length===2)box.innerHTML=ecRestored?'<b>D₂和D₄都已恢复。</b><br>把其余块代入P、Q两条校验关系，解出两个未知块。':'<b>D₂、D₄同时丢失：一条校验不够。</b><br>P和Q提供两条独立关系；留下的4块仍能确定全部原始内容。';
 else box.innerHTML='<b>丢失3块，剩下的信息不足以唯一恢复。</b><br>4个原始数据块，只剩3条独立线索；这个4＋2方案的保护上限是任意2块丢失。';
}
document.querySelectorAll('[data-ec]').forEach(button=>button.onclick=()=>{
 const action=button.dataset.ec;
 if(action==='recover'){
  const decoded=ecDecode(ecRows.map((_,i)=>i).filter(i=>!ecMissing.includes(i)));
  ecRestored=decoded!==null;ecRender();return;
 }
 ecMissing=action==='one'?[1]:action==='two'?[1,3]:action==='three'?[0,1,3]:[];ecRestored=false;ecRender();
});
ecRender();
