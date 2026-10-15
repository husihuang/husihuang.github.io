// Ideal repetition-code illustration. q1 is the leftmost bit; syndrome order C1,C2.
function qBranches(error=0){const mask=error?1<<(3-error):0;return [mask,7^mask].map(n=>n.toString(2).padStart(3,'0'));}
function qParity(bits){return `${Number(bits[0])^Number(bits[1])}${Number(bits[1])^Number(bits[2])}`;}
function qCNOT(vector,control,target){const c=1<<(3-control),t=1<<(3-target);return vector.map((_,i)=>vector[i&c?i^t:i]);}
function qEncode(a,b){return qCNOT(qCNOT([a,0,0,0,b,0,0,0],1,2),1,3);}
function qDecode(vector){return qCNOT(qCNOT(vector,1,3),1,2);}
function qX(vector,position){const mask=1<<(3-position);return vector.map((_,i)=>vector[i^mask]);}
function qZ(vector,position){const mask=1<<(3-position);return vector.map((v,i)=>i&mask?-v:v);}
function qAncillas(vector){const joint=Array(32).fill(0);vector.forEach((v,i)=>{joint[i*4+parseInt(qParity(i.toString(2).padStart(3,'0')),2)]=v;});return joint;}
let qStage=0,qError=2,qMeasured=false,qRepaired=false,qDirection='01';
let qRoot;
const qRoots=[...document.querySelectorAll('[data-quantum-stage]')];
function qWord(bits,markError=false){return [...bits].map((v,i)=>`<span class="q-bit ${qError===i+1&&(markError||!qRepaired)?'bad':''}">${v}</span>`).join('');}
function renderQuantumPage(){
 const words=qBranches(qRepaired?0:qError),syndrome=qParity(qBranches(qError)[0]);
 const choices=`<div class="q-controls">${['无翻转','第1位','第2位','第3位'].map((s,i)=>`<button data-q-error="${i}" class="${qError===i?'selected':''}">${s}</button>`).join('')}</div>`;
 let html='';
 if(qStage===0)html=`<div class="q-columns"><section><h2>从两个基态到一个叠加态</h2><div class="q-formula">|ψ⟩ = a|0⟩ + b|1⟩</div><p>|0⟩、|1⟩是两个基态。<br>a、b叫“幅度”，它们决定测量概率。</p><div class="q-callout">按0/1方向测量：<br>得到0的概率是 |a|²，得到1是 |b|²。<br>|a|² + |b|² = 1</div></section><section><h2>例子：两种结果的概率相同</h2><div class="q-formula">|+⟩ = (|0⟩ + |1⟩)/√2</div><div class="q-probability"><div><b>0</b><span>50%</span></div><div><b>1</b><span>50%</span></div></div><p>一次测量，只会读到其中一个结果。</p><div class="q-callout">按这个方向测量后，变成对应基态。<br>原来的叠加关系随之改变。</div></section></div>`;
 if(qStage===1)html=`<div class="q-columns"><section><h2>把一个逻辑态编码到三位的整体</h2><div class="q-formula">(a|0⟩ + b|1⟩)|00⟩<br>↓ 两个受控翻转操作<br>a|000⟩ + b|111⟩</div><p>先准备两位辅助数据为|00⟩。<br>第1位分别控制第2、第3位翻转。</p></section><section><h2>保护的是两个分支之间的关系</h2><div class="q-branches"><b>a</b><div class="q-word">${qWord('000').replaceAll(' bad','')}</div><span></span><b>b</b><div class="q-word">${qWord('111').replaceAll(' bad','')}</div><span></span></div><div class="q-callout">a、b及其相对相位仍在联合态中。<br>这是一个整体编码的状态。</div><p>对叠加态，它不等于三个独立的|ψ⟩副本。</p></section></div>`;
 if(qStage===2)html=`<div class="q-columns"><section><h2>选择一次翻转，看看两个分支</h2>${choices}<div class="q-branches"><b>a</b><div class="q-word">${qWord(qBranches(qError)[0],true)}</div><b class="q-syndrome">${qMeasured?syndrome:'??'}</b><b>b</b><div class="q-word">${qWord(qBranches(qError)[1],true)}</div><b class="q-syndrome">${qMeasured?syndrome:'??'}</b></div><div class="q-controls"><button data-q-action="measure">读取校验</button><button data-q-action="reset">重置</button></div><div class="q-callout">${qMeasured?`共同读数 ${syndrome}。<br>没有区分两个信息分支。`:'请算一算：两个分支的奇偶关系是否相同？'}</div></section><section><h2>只问关系，不逐个读取数据位</h2><div class="q-formula">C1 = 第1位 ⊕ 第2位<br>C2 = 第2位 ⊕ 第3位</div><p>用两个辅助校验位承接奇偶关系，<br>再测量它们，得到C1、C2。</p><div class="q-callout">读数与a、b无关，<br>保留两个数据分支之间的叠加。</div></section></div>`;
 if(qStage===3)html=`<div class="q-columns"><section><h2>经典查表决定：翻转哪一位？</h2>${choices}<table><thead><tr><th>校验C1C2</th><th>恢复操作</th></tr></thead><tbody>${['不操作','翻转第1位','翻转第2位','翻转第3位'].map((v,i)=>`<tr class="${qError===i?'current':''}"><td>${['00','10','11','01'][i]}</td><td>${v}</td></tr>`).join('')}</tbody></table><div class="q-table-note">X：0↔1；同一位翻转两次，回到原态。</div></section><section><h2>恢复的不是某一个测量值</h2><div class="q-formula">a|${words[0]}⟩ + b|${words[1]}⟩</div><div class="q-controls"><button data-q-action="repair" ${qRepaired?'disabled':''}>按校验结果纠正</button><button data-q-action="reset">重置</button></div><div class="q-callout">${qRepaired?'恢复 a|000⟩ + b|111⟩。<br>幅度和相对相位都保留下来。':`校验 ${syndrome} → ${['无需翻转','再翻转第1位','再翻转第2位','再翻转第3位'][qError]}。`}</div><p>再逆向执行两个编码操作：<br><b>(a|0⟩ + b|1⟩)|00⟩</b>，取回原逻辑态。</p></section></div>`;
 if(qStage===4)html=`<div class="q-columns"><section><h2>正负号也属于需要保护的信息</h2><div class="q-formula">a|000⟩ + b|111⟩<br>↓ 第2位发生Z相位错误<br>a|000⟩ − b|111⟩</div><p>两个分支的奇偶关系都没变。<br>C1、C2仍为 <b>00</b>，这套校验没有报警。</p><div class="q-callout">三位重复方案只纠一次比特翻转。<br>完整方案还要保护相位。</div></section><section><h2>同样的0/1概率，也能是不同的态</h2><div class="q-equation">|+⟩ = (|0⟩ + |1⟩)/√2<br>|−⟩ = (|0⟩ − |1⟩)/√2</div><div class="q-controls"><button data-q-basis="01">按0/1方向测量</button><button data-q-basis="+-">换成+/−方向</button></div><div class="q-callout">${qDirection==='01'?'两种态都各有50%概率得到0或1。<br>这次测量的统计分布相同。':'理想测量：|+⟩必得+，|−⟩必得−。<br>相对的正负号影响可观测结果。'}</div><p class="q-note">Shor九量子比特码能纠任一物理位上的<br>任意单比特错误，包括比特与相位错误。</p></section></div>`;
 qRoot.querySelector('.q-panel').innerHTML=html;
 qRoot.querySelectorAll('[data-q-error]').forEach(b=>b.onclick=()=>{qError=+b.dataset.qError;qMeasured=false;qRepaired=false;renderQuantum();});
 qRoot.querySelectorAll('[data-q-basis]').forEach(b=>b.onclick=()=>{qDirection=b.dataset.qBasis;renderQuantum();});
 qRoot.querySelectorAll('[data-q-action]').forEach(b=>b.onclick=()=>{if(b.dataset.qAction==='measure')qMeasured=true;if(b.dataset.qAction==='repair'){qMeasured=true;qRepaired=true;}if(b.dataset.qAction==='reset'){qMeasured=false;qRepaired=false;}renderQuantum();});
}
function renderQuantum(){for(const root of qRoots){qRoot=root;qStage=+root.dataset.quantumStage;renderQuantumPage();}}
renderQuantum();
