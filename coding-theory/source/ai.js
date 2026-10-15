let aiStage=0,aiSlow=2,aiErrorPosition=[1,0],aiFault=false,aiChecked=false;
const aiGradients=[2,4,6];
function aiGradientResults(g=aiGradients){return [g[0]/2+g[1],g[1]-g[2],g[0]/2+g[2]];}
function aiGradientRecover(r,slow){return slow===0?r[1]+2*r[2]:slow===1?r[0]+r[2]:2*r[0]-r[1];}
const aiA=[[1,2],[3,4]],aiB=[[5,6],[7,8]];
function aiMultiply(a,b){return a.map(row=>b[0].map((_,j)=>row.reduce((v,x,k)=>v+x*b[k][j],0)));}
const aiProduct=aiMultiply(aiA,aiB);
let aiOutput=aiProduct.map(row=>[...row]);
function aiChecks(c){return {rows:c.map(r=>r.reduce((a,b)=>a+b,0)),columns:c[0].map((_,j)=>c.reduce((v,r)=>v+r[j],0))};}
// Independent checks computed from inputs, not from an untrusted product.
const aiExpected={rows:aiA.map(r=>r.reduce((v,a,k)=>v+a*aiB[k].reduce((x,y)=>x+y,0),0)),columns:aiB[0].map((_,j)=>aiB.reduce((v,r,k)=>v+aiA.reduce((s,a)=>s+a[k],0)*r[j],0))};
function aiCorrupted(){return aiOutput.map(row=>[...row]);}
function aiInject(position=aiErrorPosition,delta=5){aiErrorPosition=position;aiOutput=aiProduct.map(row=>[...row]);aiOutput[position[0]][position[1]]+=delta;aiFault=true;aiChecked=false;}
function aiLocate(c){const actual=aiChecks(c),rs=actual.rows.map((v,i)=>v-aiExpected.rows[i]),cs=actual.columns.map((v,i)=>v-aiExpected.columns[i]),rows=rs.flatMap((v,i)=>v?[i]:[]),cols=cs.flatMap((v,i)=>v?[i]:[]);return rows.length===1&&cols.length===1&&rs[rows[0]]===cs[cols[0]]?{row:rows[0],column:cols[0],delta:rs[rows[0]]}:null;}
function aiRender(){
 document.querySelectorAll('[data-ai-stage]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.aiStage)===aiStage));
 const view=document.getElementById('ai-view');
 if(aiStage===0)view.innerHTML='<div class="ai-request">“帮我解释今天的微积分作业。”<span>一句提问背后：读取模型 → 大量乘加 → 逐词生成</span></div><div class="ai-basics"><article><h2>① 存得住</h2><h3>数据集、模型文件、训练存档</h3><p>硬盘或服务器故障时，<br>利用纠删码重建缺失块。</p><small>Ceph：4＋2纠删码。</small></article><article><h2>② 读得准</h2><h3>GPU显存中的参数与中间值</h3><p>某些比特翻转时，<br>利用ECC检测或纠正。</p><small>A100显存：SECDED。</small></article><article><h2>③ 算得对</h2><h3>矩阵乘法的输出</h3><p>输入没坏，结果仍可能出错。<br>可以给计算结果加校验。</p><small>算法级容错：ABFT。</small></article></div><div class="ai-note">70亿参数 × 每个2字节 ≈ 14 GB：可靠数据支撑AI。</div>';
 else if(aiStage===1){
  const r=aiGradientResults(),formulas=['½g₁＋g₂','g₂−g₃','½g₁＋g₃'],recovery=['r₂＋2r₃ = −2＋14 = 12','r₁＋r₃ = 5＋7 = 12','2r₁−r₂ = 10−(−2) = 12'];
  view.innerHTML='<div class="ai-gradient-intro">训练要汇总“参数调整建议”（梯度）：g₁=2，g₂=4，g₃=6，目标和为12。</div><div class="ai-workers">'+r.map((v,i)=>`<button class="ai-worker ${i===aiSlow?'slow':''}" data-ai-slow="${i}" aria-label="让机器${i+1}变慢"><strong>机器${i+1}</strong><span>r${i+1} = ${formulas[i]}</span><b>${i===aiSlow?'暂未返回':v}</b><small>点击让这台机器变慢</small></button>`).join('')+'</div><div class="ai-gradient-result"><b>任意两台返回，就能恢复所需的梯度和。</b><span>'+recovery[aiSlow]+'</span></div><div class="ai-note">多安排计算，少等待慢机器；代价是冗余工作。</div>';
 }else if(aiStage===2){
  const c=aiCorrupted(),checks=aiChecks(c),found=aiChecked?aiLocate(c):null;
  view.innerHTML='<div class="ai-columns"><div><h2>矩阵乘法：A × B = C</h2><div class="ai-input-matrices"><div><small>A</small><code>1　2<br>3　4</code></div><b>×</b><div><small>B</small><code>5　6<br>7　8</code></div><b>→</b><span>四个输出</span></div><div class="ai-check-matrix"><span></span><b>第1列</b><b>第2列</b><small>行和</small>'+c.map((row,i)=>'<b>第'+(i+1)+'行</b>'+row.map((v,j)=>`<button class="${aiFault&&i===aiErrorPosition[0]&&j===aiErrorPosition[1]?'bad':''}" data-ai-cell="${i},${j}" aria-label="让第${i+1}行第${j+1}列结果出错">${v}</button>`).join('')+`<span class="${aiChecked&&checks.rows[i]!==aiExpected.rows[i]?'bad':''}">${aiChecked?checks.rows[i]:'·'}</span>`).join('')+'<small>列和</small>'+checks.columns.map((v,j)=>`<span class="${aiChecked&&v!==aiExpected.columns[j]?'bad':''}">${aiChecked?v:'·'}</span>`).join('')+'<span></span></div><div class="ai-note">假设：精确整数，只有一个输出算错。</div></div><div><h2>先从输入独立算出预期校验</h2><div class="ai-expected">预期行和：41，93<br>预期列和：62，72</div><div class="ai-message" aria-live="polite">'+(found?`第${found.row+1}行、第${found.column+1}列校验都多了${found.delta}。<br>交点定位错误；减去${found.delta}即可恢复。`:aiChecked?'行和、列和都吻合：本例校验通过。':'输入增加校验关系，让输出也可以被检查。<br>这与前面的行列校验有相同的思路。')+'</div><div class="ai-actions"><button data-ai-action="inject">制造错误</button><button data-ai-action="check">检查校验</button><button data-ai-action="repair" '+(!found?'disabled':'')+'>恢复结果</button><button data-ai-action="reset">重置</button></div></div></div>';
 }else view.innerHTML='<div class="ai-papers"><article><div><b>ReaLM</b><small>DAC 2025</small></div><section><h2>大模型计算校验：降低恢复开销</h2><p>统计式ABFT：按错误影响选择恢复策略。</p><a href="https://arxiv.org/abs/2503.24053" target="_blank" rel="noopener">论文 ↗</a></section></article><article><div><b>REACH</b><small>2025-12 · 预印本</small></div><section><h2>AI显存：用内外两层码保护数据</h2><p>内层修小块；失败标为擦除，由外层恢复。</p><a href="https://arxiv.org/abs/2512.18152" target="_blank" rel="noopener">论文 ↗</a></section></article><article><div><b>SProbe</b><small>2026-09 · 预印本</small></div><section><h2>GPU计算：定位哪一项算错了</h2><p>构造综合，用Reed–Solomon译码链诊断错误。</p><a href="https://arxiv.org/abs/2609.19743" target="_blank" rel="noopener">论文 ↗</a></section></article></div>';
 document.querySelectorAll('[data-ai-slow]').forEach(b=>b.onclick=()=>{aiSlow=Number(b.dataset.aiSlow);aiRender();});
 document.querySelectorAll('[data-ai-cell]').forEach(b=>b.onclick=()=>{aiInject(b.dataset.aiCell.split(',').map(Number));aiRender();});
 document.querySelectorAll('[data-ai-action]').forEach(b=>b.onclick=()=>{
  const action=b.dataset.aiAction;if(action==='inject')aiInject();else if(action==='check')aiChecked=true;else if(action==='repair'){const found=aiLocate(aiCorrupted());if(found){aiOutput[found.row][found.column]-=found.delta;aiFault=false;}}else{aiOutput=aiProduct.map(row=>[...row]);aiFault=false;aiChecked=false;}aiRender();
 });
}
document.querySelectorAll('[data-ai-stage]').forEach(b=>b.onclick=()=>{aiStage=Number(b.dataset.aiStage);aiRender();});
aiRender();
