// Encode the same local illustration with the browser's actual image codecs.
const ifRoot=document.getElementById('image-format-demo'),ifView=document.getElementById('image-format-view');
const ifPixelView=ifView.innerHTML,ifSvg=document.querySelector('.picture-example').cloneNode(true);
ifSvg.setAttribute('xmlns','http://www.w3.org/2000/svg');
const ifCanvas=document.createElement('canvas');ifCanvas.width=300;ifCanvas.height=170;
let ifStage=0,ifFormat='jpeg',ifQuality=80,ifReady=false;
const ifTypes={jpeg:{name:'JPEG',extension:'jpg',mime:'image/jpeg',description:'常见照片：有损压缩'},png:{name:'PNG',extension:'png',mime:'image/png',description:'截图、图表：无损压缩'},webp:{name:'WebP',extension:'webp',mime:'image/webp',description:'网页图片：支持有损与无损'}};
function ifEncode(format=ifFormat,quality=ifQuality){
 const type=ifTypes[format],url=ifCanvas.toDataURL(type.mime,format==='jpeg'?quality/100:.8);
 if(!url.startsWith('data:'+type.mime+';'))return null;
 const bytes=Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0));return {url,bytes};
}
function ifUpdateFile(){
 if(ifStage!==1||!ifReady)return;
 const encoded=ifEncode(),type=ifTypes[ifFormat];
 if(!encoded){document.getElementById('if-file-size').textContent='本浏览器不支持此格式的编码。';return;}
 document.getElementById('if-preview').src=encoded.url;document.getElementById('if-preview').alt='同一幅示意图保存为'+type.name+'后解码的结果';
 document.getElementById('if-file-title').textContent='同一幅图 → scene.'+type.extension;
 document.getElementById('if-file-size').innerHTML='<b>'+type.name+'文件：</b>'+encoded.bytes.length.toLocaleString()+'字节（'+(encoded.bytes.length/1000).toFixed(1)+' kB）';
 const prefix=[...encoded.bytes.slice(0,3)];document.getElementById('if-hex').textContent=prefix.map(v=>v.toString(16).padStart(2,'0').toUpperCase()).join(' ');
 document.getElementById('if-binary').textContent=prefix.map(v=>v.toString(2).padStart(8,'0')).join(' ');
 const link=document.getElementById('if-download');link.href=encoded.url;link.download='编码示例_scene.'+type.extension;
 const quality=document.getElementById('if-quality'),explain=document.getElementById('if-lossless');quality.hidden=ifFormat!=='jpeg';explain.hidden=ifFormat==='jpeg';
 if(ifFormat!=='jpeg')explain.textContent=ifFormat==='png'?'无损：保留输入图像的像素值。':'本例采用WebP有损模式。';
 const output=document.getElementById('if-quality-output');output.textContent=ifQuality;
 ifRoot.querySelectorAll('[data-if-format]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ifFormat===ifFormat));
}
function ifRender(){
 ifRoot.querySelectorAll('[data-if-stage]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.ifStage===ifStage));
 if(ifStage===0){ifView.innerHTML=ifPixelView;return;}
 ifView.innerHTML='<div class="if-file-layout"><section><div class="if-preview-head"><h2 id="if-file-title">同一幅图 → scene.jpg</h2><a id="if-download" class="if-download">下载样例</a></div><img id="if-preview" class="if-preview" alt="正在生成图片格式示例"><div id="if-file-size" class="if-size">正在生成真实文件…</div><div id="if-quality" class="if-quality"><label>JPEG质量参数：<output id="if-quality-output">'+ifQuality+'</output><input id="if-quality-slider" type="range" min="5" max="95" value="'+ifQuality+'" aria-label="JPEG编码质量参数"></label></div><div id="if-lossless" class="if-lossless" hidden></div></section><section><h2>常见格式解决不同的需求</h2><table class="if-choices"><tbody>'+Object.entries(ifTypes).map(([key,type])=>'<tr><td><button data-if-format="'+key+'" aria-pressed="'+(key===ifFormat)+'">'+type.name+'</button></td><td>'+type.description+'</td></tr>').join('')+'</tbody></table><div class="if-header"><div class="if-header-label">文件头3字节：<code id="if-hex"></code></div><code id="if-binary"></code></div></section></div>';
 ifRoot.querySelectorAll('[data-if-format]').forEach(b=>b.onclick=()=>{ifFormat=b.dataset.ifFormat;ifUpdateFile();});
 document.getElementById('if-quality-slider').oninput=e=>{ifQuality=+e.target.value;ifUpdateFile();};ifUpdateFile();
}
ifRoot.querySelectorAll('[data-if-stage]').forEach(b=>b.onclick=()=>{ifStage=+b.dataset.ifStage;ifRender();});
const ifSource=new Image();ifSource.onload=()=>{ifCanvas.getContext('2d').drawImage(ifSource,0,0,300,170);ifReady=true;ifUpdateFile();};
ifSource.onerror=()=>{if(ifStage===1)document.getElementById('if-file-size').textContent='示意图加载失败，请重新打开课件。';};
ifSource.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(ifSvg));
