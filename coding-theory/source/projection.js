// Larger lookup view for the complete Morse chart, with keyboard-accessible headings.
const morseZoom=document.createElement('dialog');morseZoom.className='morse-zoom';
morseZoom.innerHTML='<div class="dialog-head"><h2></h2><button type="button">关闭</button></div><div class="morse-zoom-content"></div>';
document.body.appendChild(morseZoom);morseZoom.querySelector('button').onclick=()=>morseZoom.close();
document.querySelectorAll('.morse-chart-group').forEach((group,i)=>{
 const heading=group.querySelector('h2'),label=heading.textContent,button=document.createElement('button');
 button.type='button';button.dataset.morseZoom=String(i);button.textContent=label;button.setAttribute('aria-label','放大查看'+label);heading.replaceChildren(button);
 button.onclick=()=>{morseZoom.querySelector('h2').textContent=label;const content=morseZoom.querySelector('.morse-zoom-content');content.replaceChildren();[...group.children].filter(e=>e!==heading).forEach(e=>content.appendChild(e.cloneNode(true)));morseZoom.showModal();};
});

// This illustrates the theorem's boundary, not a simulated finite-length code.
(()=>{const lesson=document.getElementById('capacity-lesson');if(!lesson)return;
lesson.querySelectorAll('[data-cl-tab]').forEach(b=>b.onclick=()=>{const t=Number(b.dataset.clTab);lesson.querySelectorAll('[data-cl-tab]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.clTab)===t)));lesson.querySelectorAll('[data-cl-view]').forEach(x=>x.hidden=Number(x.dataset.clView)!==t);});
function setRate(r){lesson.querySelectorAll('[data-cl-rate]').forEach(x=>x.setAttribute('aria-pressed',String(Number(x.dataset.clRate)===r)));const over=r>800,fill=lesson.querySelector('#cl-fill'),verdict=lesson.querySelector('#cl-verdict');fill.style.width=(r/10)+'%';fill.style.background=over?'#a00000':'#095d35';const relation=lesson.querySelector('#cl-relation');relation.textContent='R = '+r+' '+(over?'>':'<')+' C = 800 bit/s';relation.style.color=over?'#a00000':'#095d35';verdict.classList.toggle('over',over);verdict.innerHTML=over?'<h3>超过容量：编码也突破不了</h3><p>再巧妙的编码，也不能让错误概率随码长增加而趋近0。</p>':'<h3>低于容量：有可能传得很可靠</h3><p>合适的编码与译码，配合足够长的码字，能让错误概率很小。</p>';}
lesson.querySelectorAll('[data-cl-rate]').forEach(b=>b.onclick=()=>setRate(Number(b.dataset.clRate)));setRate(700);
})();

// Each explanatory layer is a separate slide view, keeping all equations editable.
for(const [tab,view] of [['rs','rs'],['cost','cost'],['fiveg','fiveg']]){
const buttons=document.querySelectorAll('[data-'+tab+'-tab]');buttons.forEach(b=>b.onclick=()=>{const n=b.getAttribute('data-'+tab+'-tab');buttons.forEach(x=>x.setAttribute('aria-pressed',String(x.getAttribute('data-'+tab+'-tab')===n)));document.querySelectorAll('[data-'+view+'-view]').forEach(x=>x.hidden=x.getAttribute('data-'+view+'-view')!==n);});}

const fgPhotos=[...document.querySelectorAll('[data-fg-photo]')];
if(fgPhotos.length){const dialog=document.createElement('dialog');dialog.className='fg-photo-zoom';dialog.innerHTML='<div class="dialog-head"><h2></h2><button type="button">关闭</button></div><img alt="">';document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();fgPhotos.forEach(b=>b.onclick=()=>{dialog.querySelector('h2').textContent=b.dataset.fgCaption;const original=b.querySelector('img'),img=dialog.querySelector(':scope > img');img.src=original.src;img.alt=original.alt;dialog.showModal();});}
